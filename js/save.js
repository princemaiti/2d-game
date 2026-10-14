export class SaveSystem {
  constructor(game) {
    this.game = game;
    this.key = 'the-last-ember-save';
  }

  saveGame() {
    const state = {
      player: {
        x: this.game.player.x,
        y: this.game.player.y,
        health: this.game.player.health,
        stamina: this.game.player.stamina,
        inventory: this.game.player.inventory
      },
      currentMissionId: this.game.quests.currentMissionId,
      missions: this.game.quests.missions,
      npcs: this.game.npcs.map((npc) => ({
        id: npc.id,
        talked: npc.talked,
        relationship: npc.relationship || 0
      })),
      unlockedAreas: this.game.unlockedAreas,
      world: { area: this.game.currentArea },
      storyProgress: this.game.storyProgress || 0,
      time: Date.now()
    };

    localStorage.setItem(this.key, JSON.stringify(state));
    this.game.showNotification('Game saved.');
  }

  loadGame() {
    const raw = localStorage.getItem(this.key);
    if (!raw) {
      this.game.showNotification('No save found.');
      return false;
    }

    try {
      const state = JSON.parse(raw);
      if (!state) return false;

      this.game.player.x = state.player.x || 260;
      this.game.player.y = state.player.y || 520;
      this.game.player.health = state.player.health || 100;
      this.game.player.stamina = state.player.stamina || 100;
      this.game.player.inventory = state.player.inventory || this.game.player.inventory;
      this.game.quests.currentMissionId = state.currentMissionId || 0;
      this.game.quests.missions = state.missions || this.game.quests.missions;
      this.game.unlockedAreas = state.unlockedAreas || ['village'];
      this.game.storyProgress = state.storyProgress || 0;

      this.game.npcs.forEach((npc) => {
        const saved = (state.npcs || []).find((entry) => entry.id === npc.id);
        if (saved) {
          npc.talked = !!saved.talked;
          npc.relationship = saved.relationship || 0;
        }
      });

      this.game.syncMissionHud();
      this.game.showNotification('Save loaded.');
      return true;
    } catch {
      this.game.showNotification('Save file was corrupted.');
      return false;
    }
  }
}
