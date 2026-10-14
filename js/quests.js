export class QuestSystem {
  constructor() {
    this.missions = [
      {
        id: 'elder-warning',
        title: 'The Elder\'s Warning',
        description: 'Speak with Elder Rowan and learn what is wrong in the forest.',
        objective: 'Talk to Elder Rowan in Stoneford Village.',
        location: 'Stoneford Village',
        targetArea: 'village',
        targetX: 420,
        targetY: 560,
        status: 'active',
        rewards: ['10 coins', 'Village trust']
      },
      {
        id: 'forest-scare',
        title: 'Forest Scare',
        description: 'Investigate the danger in the Whispering Forest and defeat the creatures stalking the path.',
        objective: 'Travel to the Whispering Forest and clear the creatures.',
        location: 'Whispering Forest',
        targetArea: 'forest',
        targetX: 2050,
        targetY: 570,
        status: 'locked',
        rewards: ['25 coins', 'A potion']
      },
      {
        id: 'return-to-village',
        title: 'Return to Stoneford',
        description: 'Report the forest threat back to Elder Rowan and secure the village.',
        objective: 'Return to Elder Rowan with news from the forest.',
        location: 'Stoneford Village',
        targetArea: 'village',
        targetX: 420,
        targetY: 560,
        status: 'locked',
        rewards: ['Village trust', 'A healing tonic']
      }
    ];
    this.currentMissionId = 0;
  }

  getCurrentMission() {
    return this.missions[this.currentMissionId] || this.missions[0];
  }

  unlockNext() {
    if (this.currentMissionId < this.missions.length - 1) {
      this.currentMissionId += 1;
      const mission = this.getCurrentMission();
      mission.status = 'active';
      return mission;
    }
    return this.getCurrentMission();
  }

  setMissionStatus(id, status) {
    const mission = this.missions.find((item) => item.id === id);
    if (mission) mission.status = status;
  }

  toJSON() {
    return this.missions;
  }
}
