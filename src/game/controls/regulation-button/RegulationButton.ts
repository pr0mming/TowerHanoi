import { GameObjects, Scene } from 'phaser';

// Controls
import { IconButton } from '@game/controls/regulation-button/IconButton';

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

/**
 * This class represents a button with arrows next to
 */
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

    // Arrow down
    const newDownButton = new IconButton({
      scene: this.scene,
      x: newLabel.getRightCenter().x + 20,
      y,
      angle: 180,
      pointerDownEvent: pointerDownDownEvent,
    });

    this.add(newDownButton, true);

    // Arrow up
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
