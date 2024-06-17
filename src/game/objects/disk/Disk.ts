import { Physics, Scene } from 'phaser';

// Interfaces
import { IObjectPosition } from '@src/game/common/interfaces/IObjectPosition';

interface IDiskProps {
  scene: Scene;
  x: number;
  y: number;
  textureKey: string;
  scaleX: number;
  tint: number;
  diskType: number;
  towerOwner: number;
  onDragLeave: (disk: Disk) => void;
}

export class Disk extends Physics.Arcade.Image {
  private readonly _diskType: number;
  private _towerOwner: number;

  private _currentPosition: IObjectPosition;

  constructor({
    scene,
    x,
    y,
    textureKey,
    scaleX,
    tint,
    diskType,
    towerOwner,
    onDragLeave,
  }: IDiskProps) {
    super(scene, x, y, textureKey);

    scene.physics.add.existing(this);

    this._diskType = diskType;
    this._towerOwner = towerOwner;

    this._currentPosition = { x, y };

    this.setTint(tint);
    this.setScale(scaleX, 0.6);
    this.setBodySize(this.width - 60, this.height);

    this._setUpEvents(onDragLeave);
  }

  private _setUpEvents(onDragLeave: (disk: Disk) => void) {
    this.enableInteraction();

    this.on(
      Phaser.Input.Events.DRAG,
      (_: unknown, dragX: number, dragY: number) => {
        this.x = dragX;
        this.y = dragY;
      }
    );

    this.on(Phaser.Input.Events.DRAG_END, () => {
      onDragLeave(this);
    });
  }

  enableInteraction() {
    this.setInteractive({
      useHandCursor: true,
      pixelPerfect: true,
      draggable: true,
    });
  }

  public get diskType(): number {
    return this._diskType;
  }

  public get towerOwner(): number {
    return this._towerOwner;
  }

  public set towerOwner(v: number) {
    this._towerOwner = v;
  }

  public get currentPosition() {
    return this._currentPosition;
  }
  public set currentPosition(value: IObjectPosition) {
    this._currentPosition = value;
  }
}
