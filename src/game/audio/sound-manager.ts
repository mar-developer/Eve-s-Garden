/**
 * SoundManager — singleton for all game audio via Howler.js.
 *
 * Uses lazy initialization so no Howl instances are created at module-load
 * time (avoids SSR crashes in Next.js). Call `init()` once on first user
 * interaction to preload everything.
 */

type SoundName =
  | 'crash'
  | 'portal'
  | 'star'
  | 'pop1'
  | 'pop2'
  | 'pop3'
  | 'boing'
  | 'note'
  | 'fanfare'
  | 'key-click'
  | 'whoosh';

type MusicName =
  | 'music-home'
  | 'music-candy'
  | 'music-space'
  | 'music-ocean'
  | 'music-volcano'
  | 'music-cloud';

type AllSoundNames = SoundName | MusicName;

interface SoundDef {
  src: string;
  loop: boolean;
  poolSize: number; // 1 for most, 3 for rapid-fire SFX
}

const SOUND_DEFS: Record<AllSoundNames, SoundDef> = {
  // SFX
  crash:       { src: '/sounds/crash.mp3',     loop: false, poolSize: 3 },
  portal:      { src: '/sounds/portal.mp3',    loop: false, poolSize: 1 },
  star:        { src: '/sounds/star.mp3',       loop: false, poolSize: 1 },
  pop1:        { src: '/sounds/pop-1.mp3',      loop: false, poolSize: 3 },
  pop2:        { src: '/sounds/pop-2.mp3',      loop: false, poolSize: 3 },
  pop3:        { src: '/sounds/pop-3.mp3',      loop: false, poolSize: 3 },
  boing:       { src: '/sounds/boing.mp3',      loop: false, poolSize: 1 },
  note:        { src: '/sounds/note.mp3',       loop: false, poolSize: 1 },
  fanfare:     { src: '/sounds/fanfare.mp3',    loop: false, poolSize: 1 },
  'key-click': { src: '/sounds/key-click.mp3',  loop: false, poolSize: 1 },
  whoosh:      { src: '/sounds/whoosh.mp3',      loop: false, poolSize: 1 },

  // Music (looping)
  'music-home':    { src: '/sounds/dimensions/home.mp3',    loop: true, poolSize: 1 },
  'music-candy':   { src: '/sounds/dimensions/candy.mp3',   loop: true, poolSize: 1 },
  'music-space':   { src: '/sounds/dimensions/space.mp3',   loop: true, poolSize: 1 },
  'music-ocean':   { src: '/sounds/dimensions/ocean.mp3',   loop: true, poolSize: 1 },
  'music-volcano': { src: '/sounds/dimensions/volcano.mp3', loop: true, poolSize: 1 },
  'music-cloud':   { src: '/sounds/dimensions/cloud.mp3',   loop: true, poolSize: 1 },
};

/** Maps dimension IDs (PascalCase) to music track names */
const DIMENSION_MUSIC: Record<string, MusicName> = {
  Home:    'music-home',
  Candy:   'music-candy',
  Space:   'music-space',
  Ocean:   'music-ocean',
  Volcano: 'music-volcano',
  Cloud:   'music-cloud',
};

const POP_NAMES: SoundName[] = ['pop1', 'pop2', 'pop3'];

class SoundManager {
  private initialized = false;

  /** Pool of Howl instances per sound name. Index wraps via round-robin. */
  private pools: Map<AllSoundNames, import('howler').Howl[]> = new Map();
  /** Round-robin cursor per pool */
  private poolCursors: Map<AllSoundNames, number> = new Map();

  private currentMusicName: MusicName | null = null;

  masterVolume = 1;
  sfxVolume = 1;
  musicVolume = 0.5;

  /**
   * Preload all sounds. Call once on first user interaction
   * (click / tap) to satisfy browser autoplay policy.
   */
  async init(): Promise<void> {
    if (this.initialized) return;
    if (typeof window === 'undefined') return;

    const { Howl } = await import('howler');

    for (const [name, def] of Object.entries(SOUND_DEFS) as [AllSoundNames, SoundDef][]) {
      const pool: import('howler').Howl[] = [];
      for (let i = 0; i < def.poolSize; i++) {
        pool.push(
          new Howl({
            src: [def.src],
            loop: def.loop,
            preload: true,
            volume: def.loop
              ? this.masterVolume * this.musicVolume
              : this.masterVolume * this.sfxVolume,
          }),
        );
      }
      this.pools.set(name, pool);
      this.poolCursors.set(name, 0);
    }

    this.initialized = true;
  }

  // ─── Volume Control ────────────────────────────────────────

  setMasterVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  setSfxVolume(v: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  setMusicVolume(v: number): void {
    this.musicVolume = Math.max(0, Math.min(1, v));
    this.applyVolumes();
  }

  /** Push current volume levels to every loaded Howl */
  private applyVolumes(): void {
    for (const [name, pool] of this.pools.entries()) {
      const def = SOUND_DEFS[name];
      const vol = def.loop
        ? this.masterVolume * this.musicVolume
        : this.masterVolume * this.sfxVolume;
      for (const howl of pool) {
        howl.volume(vol);
      }
    }
  }

  // ─── SFX Playback ─────────────────────────────────────────

  playSfx(name: SoundName): void {
    if (!this.initialized) return;
    const pool = this.pools.get(name);
    if (!pool || pool.length === 0) return;

    const cursor = this.poolCursors.get(name) ?? 0;
    const howl = pool[cursor % pool.length];
    howl.volume(this.masterVolume * this.sfxVolume);
    howl.play();
    this.poolCursors.set(name, cursor + 1);
  }

  playRandomPop(): void {
    const name = POP_NAMES[Math.floor(Math.random() * POP_NAMES.length)];
    this.playSfx(name);
  }

  // ─── Music Playback ───────────────────────────────────────

  playMusic(dimensionId: string): void {
    if (!this.initialized) return;
    const trackName = DIMENSION_MUSIC[dimensionId];
    if (!trackName) return;

    // Already playing this track
    if (this.currentMusicName === trackName) return;

    this.stopMusic();

    const pool = this.pools.get(trackName);
    if (!pool || pool.length === 0) return;

    const howl = pool[0];
    howl.volume(this.masterVolume * this.musicVolume);
    howl.play();
    this.currentMusicName = trackName;
  }

  stopMusic(): void {
    if (this.currentMusicName) {
      const pool = this.pools.get(this.currentMusicName);
      if (pool && pool.length > 0) {
        pool[0].stop();
      }
      this.currentMusicName = null;
    }
  }

  /**
   * Cross-fade from the current music track to the new dimension's track.
   * Both fade operations happen simultaneously over `durationMs`.
   */
  crossfadeTo(dimensionId: string, durationMs: number): void {
    if (!this.initialized) return;
    const newTrackName = DIMENSION_MUSIC[dimensionId];
    if (!newTrackName) return;

    // Already playing the target track
    if (this.currentMusicName === newTrackName) return;

    const targetVolume = this.masterVolume * this.musicVolume;

    // Fade out current track
    if (this.currentMusicName) {
      const oldPool = this.pools.get(this.currentMusicName);
      if (oldPool && oldPool.length > 0) {
        const oldHowl = oldPool[0];
        oldHowl.fade(oldHowl.volume(), 0, durationMs);
        // Stop after fade completes to free resources
        const fadingTrack = this.currentMusicName;
        setTimeout(() => {
          // Only stop if it hasn't been reassigned
          if (this.currentMusicName !== fadingTrack) {
            const p = this.pools.get(fadingTrack);
            if (p && p.length > 0) {
              p[0].stop();
            }
          }
        }, durationMs + 50);
      }
    }

    // Fade in new track
    const newPool = this.pools.get(newTrackName);
    if (newPool && newPool.length > 0) {
      const newHowl = newPool[0];
      newHowl.volume(0);
      newHowl.play();
      newHowl.fade(0, targetVolume, durationMs);
    }

    this.currentMusicName = newTrackName;
  }
}

export const soundManager = new SoundManager();
