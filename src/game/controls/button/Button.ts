import { GameObjects, Scene } from 'phaser';

interface IButtonProps {
  scene: Scene;
  x: number;
  y: number;
  text: string;
  name: string;
  onPointerDownEvent: () => void;
}

export class Button extends GameObjects.Sprite {
  constructor({ scene, x, y, text, name, onPointerDownEvent }: IButtonProps) {
    super(scene, x, y, 'button');

    this.name = name;

    this.setScrollFactor(0, 0);
    this.setScale(2, 1.5);

    // Add text
    scene.add.text(this.getCenter().x, y + 7, text);

    this.enableInteraction();
    this._setUpEvents(onPointerDownEvent);
  }

  private _setUpEvents(onPointerDownEvent: () => void) {
    const frames = this.scene.anims.get('button-state').frames;

    this.on(
      Phaser.Input.Events.POINTER_OVER,
      () => {
        const textureKey = frames[1].textureFrame;
        this.setFrame(textureKey);
      },
      this
    )
      .on(
        Phaser.Input.Events.POINTER_OUT,
        () => {
          const textureKey = frames[0].textureFrame;
          this.setFrame(textureKey);
        },
        this
      )
      // Event to start a new game
      .on(
        Phaser.Input.Events.POINTER_DOWN,
        () => {
          const textureKey = frames[2].textureFrame;
          this.setFrame(textureKey);

          onPointerDownEvent();
        },
        this
      );
  }

  enableInteraction() {
    this.setInteractive({ useHandCursor: true });
  }
}