export class SettingsManager {
  constructor() {
    this.storageKey = 'the-last-ember-settings';
    this.defaults = {
      masterVolume: 75,
      musicVolume: 60,
      sfxVolume: 80,
      textSpeed: 60,
      screenShake: true,
      fullscreen: false
    };
    this.settings = this.load();
  }

  load() {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? { ...this.defaults, ...JSON.parse(raw) } : { ...this.defaults };
    } catch {
      return { ...this.defaults };
    }
  }

  save() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
  }

  applyUI() {
    const master = document.getElementById('masterVolume');
    const music = document.getElementById('musicVolume');
    const sfx = document.getElementById('sfxVolume');
    const text = document.getElementById('textSpeed');
    const shake = document.getElementById('screenShakeToggle');
    const fullscreen = document.getElementById('fullscreenToggle');

    if (master) master.value = this.settings.masterVolume;
    if (music) music.value = this.settings.musicVolume;
    if (sfx) sfx.value = this.settings.sfxVolume;
    if (text) text.value = this.settings.textSpeed;
    if (shake) shake.checked = this.settings.screenShake;
    if (fullscreen) fullscreen.checked = this.settings.fullscreen;
  }
}
