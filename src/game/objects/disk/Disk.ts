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
  onDragEnd: (disk: Disk) => void;
}

/**
 * This method represents a disk to put over a tower
 */
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
    onDragEnd,
  }: IDiskProps) {
    super(scene, x, y, textureKey);

    scene.physics.add.existing(this);

    this._diskType = diskType;
    this._towerOwner = towerOwner;

    this._currentPosition = { x, y };

    this.setTint(tint); // Little hack to have different colors of disks (because there is limited colors)
    this.setScale(scaleX, 0.6);
    this.setBodySize(this.width - 60, this.height);

    this._setUpEvents(onDragEnd);
  }

  /**
   * This method prepares the events to allow use the pointer to move a disk
   * @param onDragEnd callback of drag end event
   */
  private _setUpEvents(onDragEnd: (disk: Disk) => void) {
    this.enableInteraction();

    // Update sprite position using the pointer
    this.on(
      Phaser.Input.Events.DRAG,
      (_: unknown, dragX: number, dragY: number) => {
        this.x = dragX;
        this.y = dragY;
      }
    );

    // Is necessary a callback to process large logic of collisions
    this.on(Phaser.Input.Events.DRAG_END, () => {
      onDragEnd(this);
    });
  }

  /**
   * This method enable the interaction for the sprite
   */
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
