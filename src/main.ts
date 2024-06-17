import { AUTO, Game } from 'phaser';

import { Boot } from '@game/Boot';
import { Preloader } from '@game/Preloader';
import { Game as TowerHanoiGame } from '@game/scenes/Game';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  width: 900,
  height: 680,
  parent: 'hanoi-container',
  backgroundColor: '#4488AA',
  antialias: true,
  physics: {
    default: 'arcade',
    //arcade: { debug: true },
  },
  scene: [Boot, Preloader, TowerHanoiGame],
};

export default new Game(config);
