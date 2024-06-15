import { Scene } from 'phaser';
import { getInitialGameData } from './common/functions/getInitialGameData';

/**
 * The Preloader of the game, I put here all the required assets to use in the next scenes
 */
export class Preloader extends Scene {
  constructor() {
    super('Preloader');
  }

  preload() {
    // Little label to show loading process
    this.add
      .text(
        this.cameras.main.centerX,
        this.cameras.main.centerY,
        'LOADING GAME ...'
      )
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(15)
      .setColor('white')
      .setStroke('black', 2.5)
      .setOrigin(0.5, 0.5);

    this.load.spritesheet('button', 'game/images/button.png', {
      frameWidth: 80,
      frameHeight: 20,
    });
    this.load.image('tower', 'game/images/tower.png');

    this.load.image('pieceGreen', 'game/images/green.png');
    this.load.image('pieceYellow', 'game/images/yellow.png');
    this.load.image('pieceViolet', 'game/images/violet.png');
    this.load.image('pieceBlue', 'game/images/blue.png');
    this.load.image('pieceRed', 'game/images/red.png');
    this.load.image('pieceBrown', 'game/images/brown.png');

    this.load.image('iconDrop', 'game/images/iconupdown.png');
  }

  create() {
    const initialGameData = getInitialGameData();

    this.scene.start('Game', initialGameData);
  }
}
