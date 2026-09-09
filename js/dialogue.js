export class DialogueSystem {
  constructor(game) {
    this.game = game;
    this.dialogue = null;
    this.currentChoiceIndex = -1;
    this.choiceCallback = null;
  }

  openDialogue(npcId, state = {}) {
    const npc = this.game.npcs.find((entry) => entry.id === npcId);
    if (!npc) return;

    const dialogueData = this.getDialogue(npc, state);
    this.dialogue = { npc, ...dialogueData };
    this.render();
    this.game.ui.showDialogue(this.dialogue);
  }

  getDialogue(npc, state) {
    if (npc.id === 'elder') {
      if (!state.missionStarted) {
        return {
          text: 'The forest is restless. A strange light has returned, and something in the Ember still walks beneath the trees. I need you to investigate the edge of the forest and find out what is going on.',
          choices: [
            'What happened?',
            'I will help.',
            'Tell me about the Ember.'
          ]
        };
      }
      return {
        text: 'The forest is not safe. If you see the old signposts, follow the path north and drive the creatures away. Return when the danger is handled.',
        choices: [
          'I understand.',
          'I will return.'
        ]
      };
    }

    if (npc.id === 'lira') {
      return {
        text: 'I saw something glowing in the fog by the old pines. It looked like the same symbol on the relic you carry. Be careful out there.',
        choices: [
          'I will be careful.',
          'What symbol?'
        ]
      };
    }

    return {
      text: 'The valley feels wrong tonight. Something is watching the roads.',
      choices: []
    };
  }

  render() {
    if (!this.dialogue) return;
    const text = this.dialogue.text;
    const choices = this.dialogue.choices || [];
    this.game.ui.renderDialogue(this.dialogue.npc.name, text, choices);
  }

  continue() {
    if (!this.dialogue) return;

    if (this.dialogue.choices.length) {
      this.game.processDialogueChoice(this.dialogue.choices[0]);
    }

    this.game.ui.hideDialogue();
    this.dialogue = null;
  }
}
