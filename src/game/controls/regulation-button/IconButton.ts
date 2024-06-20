import { GameObjects, Scene } from 'phaser';

interface IIconButtonProps {
  scene: Scene;
  x: number;
  y: number;
  angle: number;
  pointerDownEvent: () => void;
}

/**
 * This class represetns an icon button (arrow)
 */
export class IconButton extends GameObjects.Image {
  constructor({ scene, x, y, angle, pointerDownEvent }: IIconButtonProps) {
    super(scene, x, y, 'iconDrop');

    this.setAngle(angle);
    this.setScale(0.07, 0.07);
    this.setInteractive({ useHandCursor: true });

    this._setUpEvents(pointerDownEvent);
  }

  private _setUpEvents(pointerDownEvent: () => void) {
    this.on(
      Phaser.Input.Events.POINTER_DOWN,
      () => {
        pointerDownEvent();
      },
      this,
    );
  }
}
