export interface Setting {
  lang: string;
  alwaysOnTop: boolean;
}

export interface SettingMethodsByMain extends Record<string, any> {
  getSetting: () => Promise<Setting>;
  setSetting: (setting: Setting) => Promise<void>;
}

export interface SettingMethodsByRender extends Record<string, any> {
  onSettingChange: (setting: Setting) => void;
}
