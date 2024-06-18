import { Physics, Scene } from 'phaser';

// Objects
import { Disk } from '@game/objects/disk/Disk';

interface IDiskGroupProps {
  scene: Scene;
  world: Physics.Arcade.World;
  diskNumber: number;
  onDragEnd: (disk: Disk) => void;
}

/**
 * This class represents the array fo disks
 */
export class DiskGroup extends Physics.Arcade.Group {
  private readonly _DISK_NUMBER: number;

  private readonly _INITIAL_X_AXIS_POSIION: number;
  private readonly _INITIAL_Y_AXIS_POSIION: number;
  private readonly _INITIAL_DISK_X_AXIS_SCALE: number;

  private readonly _DISK_TEXTURES: string[];

  constructor({ scene, world, diskNumber, onDragEnd }: IDiskGroupProps) {
    super(world, scene);

    this.classType = Disk;

    this._DISK_NUMBER = diskNumber;

    this._INITIAL_X_AXIS_POSIION = 140;
    this._INITIAL_Y_AXIS_POSIION = 490;
    this._INITIAL_DISK_X_AXIS_SCALE = 0.9;

    // Array of texture keys taken from preloader
    this._DISK_TEXTURES = [
      'pieceGreen',
      'pieceYellow',
      'pieceViolet',
      'pieceBlue',
      'pieceRed',
      'pieceBrown',
    ];

    this._setUp(onDragEnd);
  }

  private _setUp(onDragEnd: (disk: Disk) => void) {
    // It places all the disks on the first tower
    // It starts from the bigger disk (bottom) to the smaller one (top) using the y axis
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
        diskType: i, // It's to detect any invalid movement
        towerOwner: 0, // 0 of [0, 1, 2]
        onDragEnd,
      });

      this.add(newDisk, true);
    }
  }

  /**
   * This method returns a representation of a disk (texture)
   * It returns a texture based on the array fo textures, but if the index exceeds the limit it uses a random tint + color
   * @param index position of the array fo textures
   * @returns a config with the texture and tint to use
   */
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

  /**
   * This method returns a disk (sprite) using the type
   * @param type is the index used to place each disk, it's just a index
   * @returns a sprite of disk
   */
  getByType(type: number): Disk {
    const [disk] = this.getMatching('diskType', type);

    return disk as Disk;
  }

  /**
   * This method is to disable or enable the drag event for all the disks
   * @param enable `true` to enable, otherwise it will disable the event
   */
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
