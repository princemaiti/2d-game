import { Player } from './player.js';
import { createWorld, NPCS, ENEMIES, createEnemyInstance, getCurrentArea } from './world.js';
import { QuestSystem } from './quests.js';
import { DialogueSystem } from './dialogue.js';
import { SaveSystem } from './save.js';
import { SettingsManager } from './settings.js';
import { AudioManager } from './audio.js';

const LOADING_TIPS = [
  'Some memories are better left forgotten.',
  'The forest listens when the night grows deep.',
  'A glowing relic can be a blessing or a curse.',
  'Every village has a story worth hearing.',
  'The Ember is never truly gone.',
  'Look carefully: the world hides clues in plain sight.'
];

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.terrainImage = new Image();
    this.terrainImage.src = './assets/terrain.svg';
    this.npcImage = new Image();
    this.npcImage.src = './assets/npc.svg';
    this.enemyImage = new Image();
    this.enemyImage.src = './assets/enemy.svg';
    this.world = createWorld();
    this.player = new Player(260, 520);
    this.cameraX = 0;
    this.cameraY = 0;
    this.ambientTime = 0;
    this.gameStarted = false;
    this.isPaused = false;
    this.currentArea = 'village';
    this.unlockedAreas = ['village'];
    this.storyProgress = 0;
    this.mouseDown = false;
    this.input = { left: false, right: false, up: false, down: false, run: false };
    this.hud = {
      healthBar: document.getElementById('healthBar'),
      staminaBar: document.getElementById('staminaBar'),
      currentMission: document.getElementById('currentMission'),
      currentObjective: document.getElementById('currentObjective'),
      notificationBox: document.getElementById('notificationBox'),
      dialogueBox: document.getElementById('dialogueBox'),
      dialogueName: document.getElementById('dialogueName'),
      dialogueText: document.getElementById('dialogueText'),
      dialogueChoices: document.getElementById('dialogueChoices'),
      dialogueContinueBtn: document.getElementById('dialogueContinueBtn'),
      pauseMenu: document.getElementById('pauseMenu'),
      missionPanel: document.getElementById('missionPanel'),
      missionList: document.getElementById('missionList'),
      mapOverlay: document.getElementById('mapOverlay'),
      mapStatus: document.getElementById('mapStatus'),
      playerMapMarker: document.getElementById('playerMapMarker'),
      missionMapMarker: document.getElementById('missionMapMarker'),
      inventoryOverlay: document.getElementById('inventoryOverlay'),
      settingsPanel: document.getElementById('settingsPanel')
    };

    this.settings = new SettingsManager();
    this.audio = new AudioManager();
    this.quests = new QuestSystem();
    this.npcs = NPCS.map((npc) => ({ ...npc, talked: false, relationship: 0 }));
    this.enemies = ENEMIES.map((enemy) => createEnemyInstance(enemy));
    this.saveSystem = new SaveSystem(this);
    this.dialogueSystem = new DialogueSystem(this);
    this.activeDialogueNpc = null;
    this.notificationTimeout = null;

    this.bindEvents();
    this.settings.applyUI();
    this.syncMissionHud();
    this.startLoading();
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }

  bindEvents() {
    document.getElementById('continueBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      if (!this.saveSystem.loadGame()) {
        this.startNewGame();
      } else {
        this.beginGame();
      }
    });

    document.getElementById('newGameBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.startNewGame();
    });

    document.getElementById('loadGameBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      if (this.saveSystem.loadGame()) {
        this.beginGame();
      }
    });

    document.getElementById('settingsBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.showSettings(true);
    });

    document.getElementById('creditsBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      document.getElementById('creditsPanel').classList.remove('hidden');
    });

    document.getElementById('creditsCloseBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      document.getElementById('creditsPanel').classList.add('hidden');
    });

    document.getElementById('quitBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.gameStarted = false;
      this.isPaused = false;
      document.getElementById('gameRoot').classList.add('hidden');
      document.getElementById('menuScreen').classList.remove('hidden');
    });

    document.getElementById('dialogueContinueBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.continueDialogue();
    });

    document.querySelectorAll('[data-menu-action]').forEach((button) => {
      button.addEventListener('click', () => {
        const action = button.dataset.menuAction;
        this.handleMenuAction(action);
      });
    });

    document.getElementById('settingsCloseBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.showSettings(false);
    });

    document.getElementById('mapCloseBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.hud.mapOverlay.classList.add('hidden');
    });

    document.getElementById('inventoryCloseBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.hud.inventoryOverlay.classList.add('hidden');
    });

    document.getElementById('missionCloseBtn').addEventListener('click', () => {
      this.audio.playUiClick();
      this.hud.missionPanel.classList.add('hidden');
    });

    document.querySelectorAll('.map-location').forEach((location) => {
      location.addEventListener('click', () => {
        this.audio.playUiClick();
        this.hud.mapOverlay.classList.add('hidden');
        const locationName = location.querySelector('.location-label').textContent;
        const mission = this.quests.getCurrentMission();
        if (location.classList.contains(this.currentArea)) {
          this.showNotification(`You are in ${locationName}.`);
        } else if (mission.location.includes(locationName)) {
          this.showNotification(`${locationName} is your current mission destination.`);
        } else {
          this.showNotification(`${locationName} lies ahead on the road.`);
        }
      });
    });

    window.addEventListener('keydown', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') this.input.left = true;
      if (key === 'd' || key === 'arrowright') this.input.right = true;
      if (key === 'w' || key === 'arrowup') this.input.up = true;
      if (key === 's' || key === 'arrowdown') this.input.down = true;
      if (key === 'shift') this.input.run = true;
      if (key === 'm') this.toggleMap();
      if (key === 'q') this.toggleMissionPanel();
      if (key === 'e') this.interact();
      if (key === 'escape') this.togglePause();
      if (key === ' ') event.preventDefault();
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      if (key === 'a' || key === 'arrowleft') this.input.left = false;
      if (key === 'd' || key === 'arrowright') this.input.right = false;
      if (key === 'w' || key === 'arrowup') this.input.up = false;
      if (key === 's' || key === 'arrowdown') this.input.down = false;
      if (key === 'shift') this.input.run = false;
    });

    this.canvas.addEventListener('mousedown', () => {
      if (!this.gameStarted || this.isPaused || this.activeDialogueNpc) return;
      this.player.attack(this.enemies, this);
      this.audio.playTone(220, 0.08, 'square', 0.04);
    });

    const volumeInputs = ['masterVolume', 'musicVolume', 'sfxVolume', 'textSpeed'];
    volumeInputs.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        this.settings.settings[id === 'masterVolume' ? 'masterVolume' : id === 'musicVolume' ? 'musicVolume' : id === 'sfxVolume' ? 'sfxVolume' : 'textSpeed'] = Number(el.value);
        this.settings.save();
      });
    });

    document.getElementById('screenShakeToggle').addEventListener('change', (event) => {
      this.settings.settings.screenShake = event.target.checked;
      this.settings.save();
    });

    document.getElementById('fullscreenToggle').addEventListener('change', (event) => {
      this.settings.settings.fullscreen = event.target.checked;
      this.settings.save();
      if (event.target.checked) {
        document.documentElement.requestFullscreen?.();
      } else {
        document.exitFullscreen?.();
      }
    });
  }

  startLoading() {
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercent = document.getElementById('loadingPercent');
    const loadingTip = document.getElementById('loadingTip');
    loadingTip.textContent = LOADING_TIPS[Math.floor(Math.random() * LOADING_TIPS.length)];

    let progress = 0;
    const interval = setInterval(() => {
      progress += 5;
      loadingBar.style.width = `${progress}%`;
      loadingPercent.textContent = `${progress}%`;
      if (progress >= 100) {
        clearInterval(interval);
        setTimeout(() => {
          document.getElementById('loadingScreen').classList.add('hidden');
          document.getElementById('menuScreen').classList.remove('hidden');
        }, 300);
      }
    }, 80);
  }

  startNewGame() {
    this.player.reset(260, 520);
    this.cameraX = 0;
    this.cameraY = 0;
    this.player.inventory.coins = 40;
    this.player.inventory.healthPotion = 2;
    this.currentArea = 'village';
    this.unlockedAreas = ['village'];
    this.storyProgress = 0;
    this.quests = new QuestSystem();
    this.quests.currentMissionId = 0;
    this.npcs = NPCS.map((npc) => ({ ...npc, talked: false, relationship: 0 }));
    this.enemies = ENEMIES.map((enemy) => createEnemyInstance(enemy));
    this.syncMissionHud();
    this.beginGame();
  }

  beginGame() {
    document.getElementById('menuScreen').classList.add('hidden');
    document.getElementById('gameRoot').classList.remove('hidden');
    this.gameStarted = true;
    this.isPaused = false;
    this.hud.pauseMenu.classList.add('hidden');
    this.showNotification('Stoneford awakens.');
  }

  togglePause() {
    if (!this.gameStarted) return;
    this.isPaused = !this.isPaused;
    this.hud.pauseMenu.classList.toggle('hidden', !this.isPaused);
  }

  toggleMap() {
    if (!this.gameStarted) return;
    this.hud.mapOverlay.classList.toggle('hidden');
  }

  toggleMissionPanel() {
    if (!this.gameStarted) return;
    this.hud.missionPanel.classList.toggle('hidden');
    this.renderMissionList();
  }

  showSettings(show) {
    this.hud.settingsPanel.classList.toggle('hidden', !show);
  }

  handleMenuAction(action) {
    this.audio.playUiClick();
    if (action === 'resume') {
      this.isPaused = false;
      this.hud.pauseMenu.classList.add('hidden');
    } else if (action === 'map') {
      this.hud.pauseMenu.classList.add('hidden');
      this.isPaused = false;
      this.toggleMap();
    } else if (action === 'missions') {
      this.hud.pauseMenu.classList.add('hidden');
      this.isPaused = false;
      this.toggleMissionPanel();
    } else if (action === 'inventory') {
      this.hud.pauseMenu.classList.add('hidden');
      this.isPaused = false;
      this.hud.inventoryOverlay.classList.toggle('hidden');
    } else if (action === 'settings') {
      this.hud.pauseMenu.classList.add('hidden');
      this.isPaused = false;
      this.showSettings(true);
    } else if (action === 'save') {
      this.saveSystem.saveGame();
    } else if (action === 'mainMenu') {
      this.gameStarted = false;
      this.isPaused = false;
      document.getElementById('gameRoot').classList.add('hidden');
      document.getElementById('menuScreen').classList.remove('hidden');
    }
  }

  showNotification(text) {
    this.hud.notificationBox.textContent = text;
    if (this.notificationTimeout) clearTimeout(this.notificationTimeout);
    this.notificationTimeout = setTimeout(() => {
      this.hud.notificationBox.textContent = 'Stoneford is quiet...';
    }, 2400);
  }

  renderMissionList() {
    const list = this.hud.missionList;
    list.innerHTML = '';
    this.quests.missions.forEach((mission) => {
      const entry = document.createElement('div');
      entry.className = `mission-entry ${mission.status === 'completed' ? 'done' : ''}`;
      entry.innerHTML = `<h4>${mission.title}</h4><p>${mission.objective}</p>`;
      list.appendChild(entry);
    });
  }

  syncMissionHud() {
    const mission = this.quests.getCurrentMission();
    this.hud.currentMission.textContent = `Mission: ${mission.title}`;
    this.hud.currentObjective.textContent = `Objective: ${mission.objective}`;
    this.renderMissionList();
    if (this.gameStarted) this.updateMapState();
  }

  interact() {
    if (!this.gameStarted || this.isPaused || this.activeDialogueNpc) return;
    const npc = this.npcs.find((entry) => Math.abs(entry.x - this.player.x) < 70 && Math.abs(entry.y - this.player.y) < 70);
    if (npc) {
      this.activeDialogueNpc = npc;
      this.dialogueSystem.openDialogue(npc.id, { missionStarted: this.quests.currentMissionId > 0 || this.storyProgress > 0 });
      npc.talked = true;
      return;
    }

    if (this.currentArea === 'village') {
      this.showNotification('The road is quiet, but the air feels wrong.');
    }
  }

  continueDialogue() {
    if (!this.activeDialogueNpc) return;
    if (this.activeDialogueNpc.id === 'elder') {
      if (this.quests.currentMissionId === 0) {
        this.storyProgress = 1;
        this.quests.missions[0].status = 'completed';
        this.quests.unlockNext();
        this.player.inventory.coins += 10;
        this.showNotification('Quest complete: The Elder\'s Warning');
        this.audio.playQuestComplete();
      } else if (this.quests.currentMissionId === 2) {
        this.storyProgress = 3;
        this.quests.missions[2].status = 'completed';
        this.showNotification('The village is safe for now.');
      }
    } else {
      this.showNotification('You listen carefully to the village chatter.');
    }
    this.activeDialogueNpc = null;
    this.hud.dialogueBox.classList.add('hidden');
    this.syncMissionHud();
  }

  processDialogueChoice(choiceText) {
    if (!this.activeDialogueNpc) return;
    if (this.activeDialogueNpc.id === 'elder') {
      if (choiceText.includes('help') || choiceText.includes('I will help')) {
        this.storyProgress = 1;
        this.quests.missions[0].status = 'completed';
        this.quests.unlockNext();
        this.player.inventory.coins += 10;
        this.showNotification('Quest updated: Forest Scare');
        this.syncMissionHud();
      }
    }
  }

  update(dt) {
    if (!this.gameStarted || this.isPaused) return;

    this.ambientTime += dt;
    this.player.update(dt, this.input, this.world);
    const targetCameraX = Math.max(0, Math.min(this.player.x - this.canvas.width * 0.38, this.world.width - this.canvas.width));
    const targetCameraY = Math.max(0, Math.min(this.player.y - this.canvas.height * 0.5, this.world.height - this.canvas.height));
    this.cameraX += (targetCameraX - this.cameraX) * Math.min(1, dt * 8);
    this.cameraY += (targetCameraY - this.cameraY) * Math.min(1, dt * 8);
    this.currentArea = getCurrentArea(this.player.x);
    this.updateMapState();

    if (this.currentArea !== 'village' && !this.unlockedAreas.includes(this.currentArea)) {
      this.unlockedAreas.push(this.currentArea);
    }

    if (this.currentArea === 'forest' && this.quests.currentMissionId === 1 && this.quests.missions[1].status !== 'completed') {
      this.quests.missions[1].objective = 'Defeat the creatures in the Whispering Forest.';
      this.syncMissionHud();
    }

    this.enemies.forEach((enemy) => {
      if (!enemy.alive) return;
      const dx = this.player.x - enemy.x;
      const dy = this.player.y - enemy.y;
      const distance = Math.hypot(dx, dy);
      if (distance < 240 && distance > 0) {
        enemy.x += (dx / distance) * enemy.speed * dt;
        enemy.y += (dy / distance) * enemy.speed * dt;
      }
      if (distance < 42) {
        this.player.health = Math.max(0, this.player.health - 10 * dt);
      }
      if (enemy.hitFlash > 0) enemy.hitFlash -= dt;
    });

    if (this.player.health <= 0) {
      this.player.health = 100;
      this.player.x = 260;
      this.player.y = 520;
      this.showNotification('You were knocked back to Stoneford.');
    }

    this.checkMissionProgress();
    this.updateHudBars();
  }

  checkMissionProgress() {
    const current = this.quests.getCurrentMission();
    if (this.quests.currentMissionId === 0 && this.storyProgress >= 1) {
      current.status = 'completed';
      this.quests.currentMissionId = 1;
      current.objective = 'Completed';
      this.syncMissionHud();
    }

    if (this.quests.currentMissionId === 1) {
      const forestCleared = this.enemies.filter((enemy) => enemy.alive === false && enemy.name.includes('Forest')).length >= 2;
      if (forestCleared) {
        this.quests.missions[1].status = 'completed';
        this.quests.missions[1].objective = 'Return to Elder Rowan in Stoneford.';
        this.quests.missions[2].status = 'active';
        this.quests.currentMissionId = 2;
        this.player.inventory.coins += 25;
        this.player.inventory.healthPotion += 1;
        this.showNotification('Forest cleared. Return to the village.');
        this.audio.playQuestComplete();
        this.syncMissionHud();
      }
    }

    if (this.quests.currentMissionId === 2) {
      const elder = this.npcs.find((npc) => npc.id === 'elder');
      if (elder && Math.hypot(this.player.x - elder.x, this.player.y - elder.y) < 140) {
        this.showNotification('Elder Rowan is waiting for your report. Press E.');
      }
    }
  }

  updateHudBars() {
    this.hud.healthBar.style.width = `${(this.player.health / this.player.maxHealth) * 100}%`;
    this.hud.staminaBar.style.width = `${(this.player.stamina / this.player.maxStamina) * 100}%`;
  }

  updateMapState() {
    const area = this.world.areas[this.currentArea];
    const mission = this.quests.getCurrentMission();
    const areaName = area ? area.name : this.currentArea;
    const targetArea = this.world.areas[mission.targetArea];
    const mapWidth = 100;
    const playerPercent = Math.max(2, Math.min(98, (this.player.x / this.world.width) * mapWidth));
    const playerMapY = Math.max(10, Math.min(90, 8 + (this.player.y / this.world.height) * 84));
    const targetPercent = targetArea
      ? Math.max(2, Math.min(98, (mission.targetX / this.world.width) * mapWidth))
      : playerPercent;
    const targetMapY = Math.max(10, Math.min(90, 8 + ((mission.targetY || this.player.y) / this.world.height) * 84));

    this.hud.mapStatus.innerHTML = `<strong>${areaName}</strong><span>${mission.status === 'completed' ? 'All missions complete' : `Objective: ${mission.objective}`}</span>`;
    this.hud.playerMapMarker.style.left = `${playerPercent}%`;
    this.hud.playerMapMarker.style.top = `${playerMapY}%`;
    this.hud.missionMapMarker.style.left = `${targetPercent}%`;
    this.hud.missionMapMarker.style.top = `${targetMapY}%`;
    this.hud.missionMapMarker.classList.toggle('same-location', Math.abs(this.player.x - mission.targetX) < 90);
    this.hud.missionMapMarker.querySelector('span:last-child').textContent = mission.status === 'completed' ? 'Done' : 'Objective';
    this.hud.mapOverlay.querySelectorAll('.map-location').forEach((location) => {
      location.classList.toggle('active', location.classList.contains(this.currentArea));
      location.classList.toggle('visited', this.unlockedAreas.some((areaId) => location.classList.contains(areaId)));
    });
  }

  renderDialogue(name, text, choices) {
    this.hud.dialogueName.textContent = name;
    this.hud.dialogueText.textContent = text;
    this.hud.dialogueChoices.innerHTML = '';

    choices.forEach((choice) => {
      const button = document.createElement('button');
      button.className = 'dialogue-choice';
      button.textContent = choice;
      button.addEventListener('click', () => {
        this.processDialogueChoice(choice);
        this.hud.dialogueBox.classList.add('hidden');
        this.activeDialogueNpc = null;
      });
      this.hud.dialogueChoices.appendChild(button);
    });

    this.hud.dialogueBox.classList.remove('hidden');
  }

  render() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (this.terrainImage.complete && this.terrainImage.naturalWidth > 0) {
      const terrainPattern = ctx.createPattern(this.terrainImage, 'repeat');
      ctx.fillStyle = terrainPattern;
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    } else {
      ctx.fillStyle = '#315f4b';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    const sunX = 880 - this.cameraX * 0.12;
    ctx.fillStyle = 'rgba(255, 210, 100, 0.85)';
    ctx.beginPath();
    ctx.arc(sunX, 120, 58, 0, Math.PI * 2);
    ctx.fill();

    for (let i = 0; i < 16; i++) {
      const x = (i * 200) - (this.cameraX * 0.25) % 200 + Math.sin(this.ambientTime * 0.12 + i) * 16;
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath();
      ctx.arc(x, 90 + (i % 2) * 18, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    for (let i = 0; i < 22; i++) {
      const x = (i * 137 - this.cameraX * 0.35) % this.canvas.width;
      const y = 300 + (i % 5) * 42 + Math.sin(this.ambientTime * 1.4 + i) * 12;
      ctx.fillStyle = `rgba(191, 219, 254, ${0.12 + (i % 3) * 0.06})`;
      ctx.beginPath();
      ctx.arc(x < 0 ? x + this.canvas.width : x, y, 2 + (i % 2), 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#3f7655';
    ctx.fillStyle = 'rgba(63, 118, 85, 0.22)';
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    ctx.strokeStyle = 'rgba(187, 247, 208, 0.08)';
    ctx.lineWidth = 1;
    for (let x = -this.cameraX % 80; x < this.canvas.width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvas.height);
      ctx.stroke();
    }
    for (let y = -this.cameraY % 80; y < this.canvas.height; y += 80) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvas.width, y);
      ctx.stroke();
    }

    ctx.fillStyle = '#325f47';
    for (let i = 0; i < 30; i++) {
      const x = i * 90 - (this.cameraX * 0.6) % 90;
      const y = ((i * 173 - this.cameraY * 0.6) % (this.canvas.height + 160)) - 80;
      ctx.beginPath();
      ctx.arc(x, y, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#4b3621';
      ctx.fillRect(x - 4, y + 12, 8, 30);
      ctx.fillStyle = '#325f47';
    }

    ctx.fillStyle = '#7a5f3f';
    ctx.fillRect(120 - this.cameraX, 540, 150, 80);
    ctx.fillStyle = '#8e7758';
    ctx.fillRect(175 - this.cameraX, 500, 40, 40);
    ctx.fillStyle = '#d9bf8e';
    ctx.fillRect(205 - this.cameraX, 520, 12, 30);

    ctx.fillStyle = '#b7784a';
    ctx.fillRect(430 - this.cameraX, 530, 120, 90);
    ctx.fillRect(600 - this.cameraX, 515, 150, 105);

    ctx.save();
    ctx.translate(0, -this.cameraY);
    this.world.landmarks.forEach((landmark) => {
      const screenX = landmark.x - this.cameraX;
      if (screenX < -180 || screenX > this.canvas.width + 180) return;

      if (landmark.type === 'gate') {
        ctx.fillStyle = '#334155';
        ctx.fillRect(screenX, 480, 22, 140);
        ctx.fillRect(screenX + 118, 480, 22, 140);
        ctx.fillStyle = '#7c5a36';
        ctx.fillRect(screenX + 20, 530, 100, 90);
        ctx.fillStyle = '#fbbf24';
        ctx.fillRect(screenX + 68, 552, 5, 10);
      } else if (landmark.type === 'trees') {
        for (let index = 0; index < 5; index += 1) {
          const treeX = screenX + index * 34;
          ctx.fillStyle = '#4b3621';
          ctx.fillRect(treeX + 13, 500 - (index % 2) * 25, 10, 120);
          ctx.fillStyle = index % 2 ? '#166534' : '#15803d';
          ctx.beginPath();
          ctx.arc(treeX + 18, 480 - (index % 2) * 25, 38, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (landmark.type === 'dock') {
        ctx.fillStyle = '#8b6b45';
        ctx.fillRect(screenX, 560, 180, 18);
        ctx.fillRect(screenX + 28, 578, 12, 42);
        ctx.fillRect(screenX + 142, 578, 12, 42);
        ctx.fillStyle = 'rgba(34, 211, 238, 0.55)';
        ctx.fillRect(screenX - 20, 585, 220, 35);
      } else if (landmark.type === 'marsh') {
        ctx.fillStyle = '#365314';
        for (let index = 0; index < 8; index += 1) {
          const reedX = screenX + index * 24;
          ctx.fillRect(reedX, 500 + (index % 3) * 18, 5, 120);
          ctx.fillRect(reedX + 7, 515 + (index % 2) * 16, 4, 105);
        }
        ctx.fillStyle = 'rgba(45, 212, 191, 0.34)';
        ctx.beginPath();
        ctx.ellipse(screenX + 100, 600, 110, 24, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (landmark.type === 'cliffs') {
        ctx.fillStyle = '#57534e';
        ctx.beginPath();
        ctx.moveTo(screenX, 620);
        ctx.lineTo(screenX + 70, 390);
        ctx.lineTo(screenX + 140, 620);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#78716c';
        ctx.fillRect(screenX + 54, 490, 34, 130);
      } else if (landmark.type === 'arch') {
        ctx.strokeStyle = '#a78b6b';
        ctx.lineWidth = 28;
        ctx.beginPath();
        ctx.arc(screenX + 80, 590, 70, Math.PI, Math.PI * 2);
        ctx.stroke();
        ctx.lineWidth = 1;
      } else if (landmark.type === 'obelisk') {
        ctx.fillStyle = '#94a3b8';
        ctx.beginPath();
        ctx.moveTo(screenX + 40, 620);
        ctx.lineTo(screenX + 65, 390);
        ctx.lineTo(screenX + 90, 620);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = '#f97316';
        ctx.fillRect(screenX + 62, 448, 6, 48);
      }
    });
    ctx.restore();

    if (this.gameStarted) {
      this.npcs.forEach((npc, index) => {
        const screenX = npc.x - this.cameraX;
        const screenY = npc.y - this.cameraY;
        const idleOffset = Math.sin(this.ambientTime * 2 + index * 1.7) * 2;
        if (this.npcImage.complete && this.npcImage.naturalWidth > 0) {
          ctx.drawImage(this.npcImage, screenX - 31, screenY - 40 + idleOffset, 104, 138);
        } else {
          ctx.fillStyle = npc.color;
          ctx.beginPath();
          ctx.arc(screenX + npc.width / 2, screenY + npc.height / 2 + idleOffset, npc.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#1c2735';
        ctx.fillRect(screenX - 4, screenY - 5 + idleOffset, npc.width + 8, 6);
      });

      this.enemies.forEach((enemy) => {
        if (!enemy.alive) return;
        const screenX = enemy.x - this.cameraX;
        const screenY = enemy.y - this.cameraY;
        if (this.enemyImage.complete && this.enemyImage.naturalWidth > 0 && enemy.hitFlash <= 0) {
          ctx.drawImage(this.enemyImage, screenX - 34, screenY - 36, 112, 112);
        } else {
          ctx.fillStyle = enemy.hitFlash > 0 ? '#ffffff' : enemy.color;
          ctx.beginPath();
          ctx.arc(screenX + enemy.width / 2, screenY + enemy.height / 2, enemy.width / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#111827';
        ctx.fillRect(screenX - 4, screenY - 10, enemy.width + 8, 6);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(screenX - 4, screenY - 10, (enemy.width + 8) * (enemy.health / 56), 6);
      });

      this.player.draw(ctx, this.cameraX, this.cameraY);
    }

    if (this.currentArea === 'forest') {
      ctx.fillStyle = 'rgba(90, 120, 130, 0.18)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    if (!this.gameStarted) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }

  loop(timestamp) {
    const dt = Math.min((timestamp - (this.lastTime || timestamp)) / 1000, 0.031);
    this.lastTime = timestamp;
    this.update(dt);
    this.render();
    requestAnimationFrame(this.loop);
  }
}
