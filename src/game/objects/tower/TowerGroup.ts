import { Physics, Scene } from 'phaser';

// Objects
import { Tower } from '@game/objects/tower/Tower';

interface ITowerGroupProps {
  scene: Scene;
  world: Physics.Arcade.World;
  diskNumber: number;
  towersNumber: number;
}

export class TowerGroup extends Physics.Arcade.Group {
  private readonly _INITIAL_X_AXIS_POSIION: number;
  private readonly _INITIAL_Y_AXIS_POSIION: number;

  private readonly _INTERVAL_X_AXIS_OFFSET: number;
  private readonly _TOWERS_NUMBER: number;

  constructor({ scene, world, diskNumber, towersNumber }: ITowerGroupProps) {
    super(world, scene);

    this.classType = Tower;

    this._INITIAL_X_AXIS_POSIION = 140;
    this._INITIAL_Y_AXIS_POSIION = 350;

    this._INTERVAL_X_AXIS_OFFSET = 300;
    this._TOWERS_NUMBER = towersNumber;

    this._setUp(diskNumber);
  }

  private _setUp(diskNumber: number) {
    for (
      let i = 0, x = this._INITIAL_X_AXIS_POSIION;
      i < this._TOWERS_NUMBER;
      i++, x += this._INTERVAL_X_AXIS_OFFSET
    ) {
      const newTower = new Tower({
        scene: this.scene,
        x,
        y: this._INITIAL_Y_AXIS_POSIION,
        towerType: i,
        disks: i === 0 ? Array.from(Array(diskNumber).keys()) : [],
      });

      this.add(newTower, true);
    }
  }

  getByIndex(index: number): Tower {
    const children = this.getChildren();

    return children[index] as Tower;
  }
}
