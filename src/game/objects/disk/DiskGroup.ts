import { Physics, Scene } from 'phaser';
import { Disk } from './Disk';

interface IDiskGroupProps {
  scene: Scene;
  world: Physics.Arcade.World;
  diskNumber: number;
  onDragLeave: (disk: Disk) => void;
}

export class DiskGroup extends Physics.Arcade.Group {
  private readonly _DISK_NUMBER: number;

  private readonly _INITIAL_X_AXIS_POSIION: number;
  private readonly _INITIAL_Y_AXIS_POSIION: number;
  private readonly _INITIAL_DISK_X_AXIS_SCALE: number;

  private readonly _DISK_TEXTURES: string[];

  constructor({ scene, world, diskNumber, onDragLeave }: IDiskGroupProps) {
    super(world, scene);

    this.classType = Disk;

    this._DISK_NUMBER = diskNumber;

    this._INITIAL_X_AXIS_POSIION = 140;
    this._INITIAL_Y_AXIS_POSIION = 490;
    this._INITIAL_DISK_X_AXIS_SCALE = 0.9;

    this._DISK_TEXTURES = [
      'pieceGreen',
      'pieceYellow',
      'pieceViolet',
      'pieceBlue',
      'pieceRed',
      'pieceBrown',
    ];

    this._setUp(onDragLeave);
  }

  private _setUp(onDragLeave: (disk: Disk) => void) {
    for (
      let i = 0,
        scaleX = this._INITIAL_DISK_X_AXIS_SCALE,
        y = this._INITIAL_Y_AXIS_POSIION;
      i < this._DISK_NUMBER;
      i++, scaleX -= 0.1, y -= 33
    ) {
      const { textureKey, tint } = this._getDiskTextureKey(i);

      const newDisk = new Disk({
        scene: this.scene,
        x: this._INITIAL_X_AXIS_POSIION,
        y,
        textureKey,
        scaleX,
        tint,
        diskType: i,
        towerOwner: 0,
        onDragLeave,
      });

      this.add(newDisk, true);
    }
  }

  private _getDiskTextureKey(index: number) {
    if (index >= this._DISK_TEXTURES.length) {
      const indexTmp = Phaser.Math.RND.between(
        0,
        this._DISK_TEXTURES.length - 1
      );

      return {
        textureKey: this._DISK_TEXTURES[indexTmp],
        tint: Math.random() * 0xffffff,
      };
    }

    return { textureKey: this._DISK_TEXTURES[index], tint: 0xffffff };
  }

  getByType(type: number): Disk {
    const [disk] = this.getMatching('diskType', type);

    return disk as Disk;
  }

  setInteractive(enable: boolean) {
    this.getChildren().forEach((disk) => {
      const _disk = disk as Disk;

      if (enable) {
        _disk.enableInteraction();
      } else {
        _disk.disableInteractive();
      }
    });
  }
}
