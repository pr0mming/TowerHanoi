import { GameObjects, Scene } from 'phaser';
import { IconButton } from './IconButton';

interface IAddButton {
  x: number;
  y: number;
  text: string;
  pointerDownUpEvent: () => void;
  pointerDownDownEvent: () => void;
}

interface IRegulationButtonGroupProps {
  scene: Scene;
}

export class RegulationButtonGroup extends GameObjects.Group {
  constructor({ scene }: IRegulationButtonGroupProps) {
    super(scene);
  }

  addButton({
    x,
    y,
    text,
    pointerDownUpEvent,
    pointerDownDownEvent,
  }: IAddButton) {
    const newLabel = this.scene.add
      .text(x, y, text)
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(15)
      .setColor('white')
      .setStroke('black', 2.5)
      .setOrigin(0.5);

    this.add(newLabel, true);

    const newDownButton = new IconButton({
      scene: this.scene,
      x: newLabel.getRightCenter().x + 20,
      y,
      angle: 180,
      pointerDownEvent: pointerDownDownEvent,
    });

    this.add(newDownButton, true);

    const newUpButton = new IconButton({
      scene: this.scene,
      x: newLabel.getRightCenter().x + 38,
      y,
      angle: 0,
      pointerDownEvent: pointerDownUpEvent,
    });

    this.add(newUpButton, true);
  }
}
