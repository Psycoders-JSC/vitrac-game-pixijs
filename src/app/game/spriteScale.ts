/** Sprite scaling for mobile base 360px width. Textures are high-res; we scale to design size. */
export const SPRITE_CONFIG = {
  /** Target pixel sizes on 360px base */
  player: { targetWidth: 50, textureWidth: 532 },
  enemy: { targetWidth: 36, maxTextureWidth: 440 },
  bullet: { targetWidth: 12, textureWidth: 16 },
  seed: { targetRadius: 6, baseRadius: 3 },
  powerUp: { targetWidth: 40, textureWidth: 256 },
} as const;

export function getPlayerScale(screenWidth: number): number {
  const base = screenWidth / 360;
  return (
    base *
    (SPRITE_CONFIG.player.targetWidth / SPRITE_CONFIG.player.textureWidth)
  );
}

export function getEnemyScale(screenWidth: number): number {
  const base = screenWidth / 360;
  return (
    base *
    (SPRITE_CONFIG.enemy.targetWidth / SPRITE_CONFIG.enemy.maxTextureWidth)
  );
}

export function getBulletScale(screenWidth: number): number {
  const base = screenWidth / 360;
  return (
    base *
    (SPRITE_CONFIG.bullet.targetWidth / SPRITE_CONFIG.bullet.textureWidth)
  );
}

export function getSeedScale(screenWidth: number): number {
  const base = screenWidth / 360;
  return (
    base * (SPRITE_CONFIG.seed.targetRadius / SPRITE_CONFIG.seed.baseRadius)
  );
}

export function getPowerUpScale(screenWidth: number): number {
  const base = screenWidth / 360;
  return (
    base *
    (SPRITE_CONFIG.powerUp.targetWidth / SPRITE_CONFIG.powerUp.textureWidth)
  );
}
