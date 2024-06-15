import { GameObjects, Scene } from 'phaser';
import { Button } from './Button';

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

export class ButtonGroup extends GameObjects.Group {
  constructor({ scene }: IButtonGroupProps) {
    super(scene);

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
