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
    const newUpButton = new IconButton({
      scene: this.scene,
      x,
      y,
      angle: 0,
      pointerDownEvent: pointerDownUpEvent,
    });

    this.add(newUpButton, true);

    const newDownButton = new IconButton({
      scene: this.scene,
      x,
      y: y + 12,
      angle: 180,
      pointerDownEvent: pointerDownDownEvent,
    });

    this.add(newDownButton, true);

    const newLabel = this.scene.add
      .text(x + 70, newDownButton.getCenter().y - 5, text)
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(15)
      .setColor('white')
      .setStroke('black', 2.5)
      .setOrigin(0.5);

    this.add(newLabel, true);
  }
}
