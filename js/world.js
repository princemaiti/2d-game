export const WORLD_WIDTH = 12000;

export function createWorld() {
  return {
    width: WORLD_WIDTH,
    height: 2200,
    groundY: 620,
    areas: {
      village: { x: 0, width: 1400, name: 'Stoneford Village', atmosphere: 'day' },
      forest: { x: 1400, width: 2100, name: 'Whispering Forest', atmosphere: 'mist' },
      lake: { x: 3500, width: 1700, name: 'Moonlit Lake', atmosphere: 'night' },
      marsh: { x: 5200, width: 2000, name: 'Blackroot Marsh', atmosphere: 'mist' },
      highlands: { x: 7200, width: 2300, name: 'Ashen Highlands', atmosphere: 'storm' },
      ruins: { x: 9500, width: 2500, name: 'Forgotten Ruins', atmosphere: 'ancient' }
    },
    baseLocations: [
      { name: 'Stoneford Village', x: 260, y: 560, type: 'village' },
      { name: 'Whispering Forest', x: 2450, y: 420, type: 'forest' },
      { name: 'Moonlit Lake', x: 4350, y: 510, type: 'lake' },
      { name: 'Blackroot Marsh', x: 6200, y: 500, type: 'marsh' },
      { name: 'Ashen Highlands', x: 8200, y: 430, type: 'highlands' },
      { name: 'Forgotten Ruins', x: 10800, y: 500, type: 'ruins' }
    ],
    landmarks: [
      { x: 1320, type: 'gate' },
      { x: 1850, type: 'trees' },
      { x: 3900, type: 'dock' },
      { x: 5700, type: 'marsh' },
      { x: 7600, type: 'cliffs' },
      { x: 9700, type: 'arch' },
      { x: 11600, type: 'obelisk' }
    ]
  };
}

export const NPCS = [
  { id: 'elder', name: 'Elder Rowan', x: 420, y: 560, width: 34, height: 48, color: '#c7a36a', role: 'elder', home: 'village' },
  { id: 'lira', name: 'Lira', x: 640, y: 560, width: 30, height: 46, color: '#ff8fab', role: 'merchant', home: 'village' },
  { id: 'milo', name: 'Milo', x: 1040, y: 560, width: 30, height: 46, color: '#7dd3fc', role: 'guard', home: 'village' },
  { id: 'fisher', name: 'Nessa', x: 4300, y: 560, width: 30, height: 46, color: '#94a3b8', role: 'fisher', home: 'lake' },
  { id: 'wanderer', name: 'Ivo', x: 2500, y: 430, width: 30, height: 46, color: '#d6b4fc', role: 'wanderer', home: 'forest' },
  { id: 'marshkeeper', name: 'Veya', x: 6250, y: 560, width: 30, height: 46, color: '#86efac', role: 'marshkeeper', home: 'marsh' },
  { id: 'scout', name: 'Tarin', x: 8200, y: 560, width: 30, height: 46, color: '#fbbf24', role: 'scout', home: 'highlands' }
];

export const ENEMIES = [
  { id: 'forest-creature', name: 'Forest Creature', x: 2050, y: 570, health: 36, speed: 60, color: '#5cc8a8', reward: 14 },
  { id: 'forest-creature-2', name: 'Forest Creature', x: 2850, y: 570, health: 36, speed: 62, color: '#5cc8a8', reward: 14 },
  { id: 'shadow-wolf', name: 'Shadow Wolf', x: 3350, y: 570, health: 56, speed: 80, color: '#7c3aed', reward: 20 },
  { id: 'marsh-wisp', name: 'Marsh Wisp', x: 5900, y: 560, health: 48, speed: 70, color: '#22d3ee', reward: 22 },
  { id: 'ash-hound', name: 'Ash Hound', x: 7900, y: 570, health: 70, speed: 88, color: '#f97316', reward: 28 },
  { id: 'ruin-guardian', name: 'Ruin Guardian', x: 10700, y: 550, health: 100, speed: 45, color: '#ef4444', reward: 50 }
];

export function getCurrentArea(playerX) {
  const areas = [
    ['village', 0, 800],
    ['forest', 1400, 3500],
    ['lake', 3500, 5200],
    ['marsh', 5200, 7200],
    ['highlands', 7200, 9500],
    ['ruins', 9500, WORLD_WIDTH]
  ];
  return areas.find(([, start, end]) => playerX >= start && playerX < end)?.[0] || 'ruins';
}

export function createEnemyInstance(enemyDef) {
  return {
    ...enemyDef,
    alive: true,
    x: enemyDef.x,
    y: enemyDef.y ?? 570,
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
