export const WORLD_WIDTH = 2200;

export function createWorld() {
  return {
    width: WORLD_WIDTH,
    height: 720,
    groundY: 620,
    areas: {
      village: { x: 0, width: 800, name: 'Stoneford Village', atmosphere: 'day' },
      forest: { x: 800, width: 600, name: 'Whispering Forest', atmosphere: 'mist' },
      lake: { x: 1400, width: 350, name: 'Moonlit Lake', atmosphere: 'night' },
      ruins: { x: 1750, width: 450, name: 'Forgotten Ruins', atmosphere: 'ancient' }
    },
    baseLocations: [
      { name: 'Stoneford Village', x: 260, y: 560, type: 'village' },
      { name: 'Whispering Forest', x: 960, y: 420, type: 'forest' },
      { name: 'Moonlit Lake', x: 1560, y: 510, type: 'lake' },
      { name: 'Forgotten Ruins', x: 1920, y: 500, type: 'ruins' }
    ]
  };
}

export const NPCS = [
  { id: 'elder', name: 'Elder Rowan', x: 420, y: 560, width: 34, height: 48, color: '#c7a36a', role: 'elder', home: 'village' },
  { id: 'lira', name: 'Lira', x: 640, y: 560, width: 30, height: 46, color: '#ff8fab', role: 'merchant', home: 'village' },
  { id: 'milo', name: 'Milo', x: 880, y: 560, width: 30, height: 46, color: '#7dd3fc', role: 'guard', home: 'village' },
  { id: 'fisher', name: 'Nessa', x: 1490, y: 560, width: 30, height: 46, color: '#94a3b8', role: 'fisher', home: 'lake' },
  { id: 'wanderer', name: 'Ivo', x: 1120, y: 430, width: 30, height: 46, color: '#d6b4fc', role: 'wanderer', home: 'forest' }
];

export const ENEMIES = [
  { id: 'forest-creature', name: 'Forest Creature', x: 1040, y: 570, health: 36, speed: 60, color: '#5cc8a8', reward: 14 },
  { id: 'forest-creature-2', name: 'Forest Creature', x: 1180, y: 570, health: 36, speed: 62, color: '#5cc8a8', reward: 14 },
  { id: 'shadow-wolf', name: 'Shadow Wolf', x: 1560, y: 570, health: 56, speed: 80, color: '#7c3aed', reward: 20 }
];

export function getCurrentArea(playerX) {
  if (playerX < 800) return 'village';
  if (playerX < 1400) return 'forest';
  if (playerX < 1750) return 'lake';
  return 'ruins';
}

export function createEnemyInstance(enemyDef) {
  return {
    ...enemyDef,
    alive: true,
    x: enemyDef.x,
    y: 570,
    width: 34,
    height: 40,
    vx: 0,
    vy: 0,
    hitFlash: 0,
    attackCooldown: 0,
    takeDamage(amount, dir) {
      if (!this.alive) return;
      this.health -= amount;
      this.hitFlash = 0.18;
      this.vx = dir * 150;
      if (this.health <= 0) {
        this.alive = false;
      }
    }
  };
}
