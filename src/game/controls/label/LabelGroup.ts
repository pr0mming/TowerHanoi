import { GameObjects, Scene } from 'phaser';

// Interfaces
import { IGameInitialData } from '@src/game/common/interfaces/IGameInitialData';

// Controls
import { Label } from '@src/game/controls/label/Label';

interface ILabelGroupProps {
  scene: Scene;
  gameData: IGameInitialData;
}

/**
 * This class represents an array of labels
 */
export class LabelGroup extends GameObjects.Group {
  private _gameData: IGameInitialData;

  constructor({ scene, gameData }: ILabelGroupProps) {
    super(scene);

    this._gameData = gameData;

    this.classType = Label;

    this._setUp();
  }

  private _setUp() {
    const style = {
      font: '15px BitBold',
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2.5,
    };

    const attempsLabel = new Label({
      scene: this.scene,
      x: 50,
      y: 22,
      text: `MOVEMENTS: ${this._gameData.attemps}`,
      nameKey: 'ATTEMPS',
    }).setStyle(style);

    this.add(attempsLabel, true);

    const timeLabel = new Label({
      scene: this.scene,
      x: 230,
      y: 22,
      text: 'TIME: 00:00:00',
      nameKey: 'TIME',
    }).setStyle(style);

    this.add(timeLabel, true);
  }

  /**
   * This method shows a little message when the user wins or is solved the game
   * @param text
   */
  showEndGameLabel(text: string) {
    const stWin = new Label({
      scene: this.scene,
      x: this.scene.cameras.main.centerX,
      y: 120,
      text: text,
      nameKey: 'END_TEXT',
    })
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(20)
      .setColor('white')
      .setStroke('black', 2.5)
      .setAlpha(0)
      .setOrigin(0.5);

    this.add(stWin, true);

    this.scene.tweens.add({
      targets: stWin,
      props: {
        alpha: 1,
      },
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  setTextByKey(keyName: string, value: string) {
    const _label = this.getMatching('name', keyName)[0];

    if (_label) {
      (_label as GameObjects.Text).setText(value);
    }
  }
}
