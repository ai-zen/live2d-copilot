use png::Decoder;
use std::io::Cursor;
use std::sync::mpsc;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::WebviewWindow;
use windows::Win32::Foundation::POINT;
use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

/// Decode PNG data, returns (rgba_pixels, width, height)
fn decode_png(data: &[u8]) -> Result<(Vec<u8>, u32, u32), png::DecodingError> {
    let decoder = Decoder::new(Cursor::new(data));
    let mut reader = decoder.read_info()?;
    let mut img_data = vec![0; reader.output_buffer_size()];
    let info = reader.next_frame(&mut img_data)?;
    Ok((img_data, info.width, info.height))
}

/// Get RGBA pixel at (x, y) from RGBA8888 bitmap
fn get_pixel_alpha(bitmap: &[u8], width: u32, x: u32, y: u32) -> Option<u8> {
    let index = ((y * width + x) as usize) * 4;
    if index + 3 < bitmap.len() {
        Some(bitmap[index + 3]) // alpha channel
    } else {
        None
    }
}

/// Capture window content as PNG bytes (synchronous, heavy)
fn capture_preview(window: &WebviewWindow) -> Result<Vec<u8>, String> {
    if !window.is_visible().map_err(|e| e.to_string())? {
        return Err("Window not visible".into());
    }

    let (tx, rx) = mpsc::channel();

    let _ = window.with_webview(move |webview| {
        #[cfg(windows)]
        unsafe {
            use webview2_com::CapturePreviewCompletedHandler;
            use webview2_com::Microsoft::Web::WebView2::Win32::{
                ICoreWebView2_15, COREWEBVIEW2_CAPTURE_PREVIEW_IMAGE_FORMAT_PNG,
            };
            use windows::core::Interface;
            use windows::Win32::UI::Shell::SHCreateMemStream;

            let stream1 = match SHCreateMemStream(None) {
                Some(s) => s,
                None => {
                    let _ = tx.send(Err("Cannot create stream".into()));
                    return;
                }
            };

            let stream2 = match stream1.Clone() {
                Ok(s) => s,
                Err(e) => {
                    let _ = tx.send(Err(e.to_string()));
                    return;
                }
            };

            let tx1 = tx.clone();
            let tx2 = tx.clone();
            let handler = CapturePreviewCompletedHandler::create(Box::new(move |result| {
                if let Err(err) = result {
                    tx1.send(Err(err.to_string())).ok();
                    return Err(err.into());
                }

                let mut data: Vec<u8> = Vec::new();
                let mut buf = [0u8; 4096];

                loop {
                    let mut bytes_read = 0u32;
                    let r = stream2.Read(
                        buf.as_mut_ptr() as *mut _,
                        buf.len() as u32,
                        Some(&mut bytes_read),
                    );
                    if r.is_err() {
                        let _ = tx.send(Err(r.message().to_string()));
                        return Ok(());
                    }
                    if bytes_read == 0 {
                        break;
                    }
                    data.extend_from_slice(&buf[..bytes_read as usize]);
                }

                tx1.send(Ok(data)).ok();
                Ok(())
            }));

            let result = webview
                .controller()
                .CoreWebView2()
                .unwrap()
                .cast::<ICoreWebView2_15>()
                .unwrap()
                .CapturePreview(
                    COREWEBVIEW2_CAPTURE_PREVIEW_IMAGE_FORMAT_PNG,
                    &stream1,
                    &handler,
                );

            if let Err(err) = result {
                tx2.send(Err(err.to_string())).ok();
            }
        }

        #[cfg(not(windows))]
        {
            let _ = tx.send(Err("Unsupported platform".into()));
        }
    });

    rx.recv().map_err(|e| e.to_string())?
}

struct Point2D {
    x: i32,
    y: i32,
}

/// Get current cursor position on screen
fn get_cursor_pos() -> Result<Point2D, String> {
    #[cfg(windows)]
    unsafe {
        let mut pos = POINT { x: 0, y: 0 };
        let _ = GetCursorPos(&mut pos);
        Ok(Point2D { x: pos.x, y: pos.y })
    }

    #[cfg(not(windows))]
    {
        Err("Unsupported platform".into())
    }
}

/// Check if cursor is on given window, return relative position
fn is_mouse_on_window(window: &WebviewWindow, cursor: &Point2D) -> Result<Option<Point2D>, String> {
    if !window.is_visible().unwrap_or(false) {
        return Ok(None);
    }

    let win_pos = window.inner_position().map_err(|e| e.to_string())?;
    let win_size = window.inner_size().map_err(|e| e.to_string())?;

    let rel = Point2D {
        x: cursor.x - win_pos.x,
        y: cursor.y - win_pos.y,
    };

    if rel.x > 0
        && rel.x < win_size.width as i32
        && rel.y > 0
        && rel.y < win_size.height as i32
    {
        Ok(Some(rel))
    } else {
        Ok(None)
    }
}

/// Enable mouse passthrough on transparent areas.
/// When the pixel under cursor has alpha=0, mouse events pass through the window.
pub fn enable_mouse_through(window: WebviewWindow) {
    let window = Arc::new(window);

    let kill = Arc::new(Mutex::new(false));
    let kill_capture = kill.clone();
    let kill_switch = kill.clone();

    // Shared buffer for captured screenshot
    let buffer: Arc<Mutex<(Vec<u8>, u32, u32)>> = Arc::new(Mutex::new((Vec::new(), 0, 0)));
    let buffer_capture = buffer.clone();
    let buffer_switch = buffer.clone();

    let win_ref = window.clone();

    // Cleanup on destroy
    window.on_window_event(move |event| {
        if let tauri::WindowEvent::Destroyed = event {
            *kill.lock().unwrap() = true;
        }
    });

    // Thread 1: capture window screenshot when mouse is over it
    thread::spawn(move || loop {
        if *kill_capture.lock().unwrap() {
            break;
        }

        let cursor = match get_cursor_pos() {
            Ok(p) => p,
            Err(_) => break,
        };

        match is_mouse_on_window(&win_ref, &cursor) {
            Ok(Some(_)) => {
                if let Ok(png_data) = capture_preview(&win_ref) {
                    if let Ok((bitmap, w, h)) = decode_png(&png_data) {
                        let mut buf = buffer_capture.lock().unwrap();
                        buf.0.clear();
                        buf.0.extend_from_slice(&bitmap);
                        buf.1 = w;
                        buf.2 = h;
                    }
                }
            }
            Ok(None) => {}
            Err(_) => break,
        }

        thread::sleep(Duration::from_millis(100));
    });

    let win_ref2 = window.clone();

    // Thread 2: toggle ignore_cursor_events based on alpha
    thread::spawn(move || loop {
        if *kill_switch.lock().unwrap() {
            break;
        }

        let cursor = match get_cursor_pos() {
            Ok(p) => p,
            Err(_) => break,
        };

        match is_mouse_on_window(&win_ref2, &cursor) {
            Ok(Some(rel)) => {
                let buf = buffer_switch.lock().unwrap();
                if let Some(alpha) = get_pixel_alpha(&buf.0, buf.1, rel.x as u32, rel.y as u32) {
                    let _ = win_ref2.set_ignore_cursor_events(alpha == 0);
                }
            }
            Ok(None) => {}
            Err(_) => break,
        }

        thread::sleep(Duration::from_millis(16));
    });
}
