import { GameObjects, Scene } from 'phaser';

// Controls
import { Button } from '@game/controls/button/Button';

interface IButtonGroupProps {
  scene: Scene;
}

interface IAddButton {
  x: number;
  y: number;
  text: string;
  name: string;
  onPointerDownEvent: () => void;
}

/**
 * This class represents an array of buttons
 */
export class ButtonGroup extends GameObjects.Group {
  constructor({ scene }: IButtonGroupProps) {
    super(scene);

    // Add animations to make hover effect
    scene.anims.create({
      key: 'button-state',
      frames: scene.anims.generateFrameNumbers('button'),
      frameRate: 6,
    });
  }

  addButton({ x, y, text, name, onPointerDownEvent }: IAddButton) {
    const newButton = new Button({
      scene: this.scene,
      x,
      y,
      text,
      name,
      onPointerDownEvent,
    });

    this.add(newButton, true);
  }

  getByName(name: string) {
    const [button] = this.getMatching('name', name);

    return button as Button;
  }

  /**
   * This method is to disable or enable the drag event for all the buttons
   * @param enable `true` to enable, otherwise it will disable the event
   */
  setInteractive(enable: boolean) {
    this.getChildren().forEach((button) => {
      const _button = button as Button;

      if (enable) {
        _button.enableInteraction();
      } else {
        _button.disableInteractive();
      }
    });
  }
}
