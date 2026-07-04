use serde::Serialize;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{Emitter, WebviewWindow};

#[cfg(windows)]
use windows::Win32::Foundation::POINT;
#[cfg(windows)]
use windows::Win32::UI::WindowsAndMessaging::GetCursorPos;

#[derive(Clone, Serialize)]
struct GazePayload {
    rel_x: i32,
    rel_y: i32,
}

pub fn start_gaze_tracking(window: WebviewWindow) {
    println!("[gaze] start");

    let win = Arc::new(window);
    let kill = Arc::new(Mutex::new(false));
    let kill_thread = kill.clone();

    let w = win.clone();
    win.on_window_event(move |event| {
        if let tauri::WindowEvent::Destroyed = event {
            println!("[gaze] stop");
            *kill.lock().unwrap() = true;
        }
    });

    thread::spawn(move || {
        println!("[gaze] thread running");
        loop {
            if *kill_thread.lock().unwrap() {
                break;
            }

            let pos = get_cursor();
            let win_pos = w.inner_position();

            if let (Some((cx, cy)), Ok(wp)) = (pos, win_pos) {
                let payload = GazePayload {
                    rel_x: cx - wp.x,
                    rel_y: cy - wp.y,
                };
                if let Err(e) = w.emit("gaze-move", payload) {
                    eprintln!("[gaze] emit error: {:?}", e);
                }
            }

            thread::sleep(Duration::from_millis(16));
        }
    });
}

fn get_cursor() -> Option<(i32, i32)> {
    #[cfg(windows)]
    unsafe {
        let mut pos = POINT { x: 0, y: 0 };
        let _ = GetCursorPos(&mut pos);
        Some((pos.x, pos.y))
    }
    #[cfg(not(windows))]
    {
        None
    }
}
