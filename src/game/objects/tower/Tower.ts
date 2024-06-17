import { Physics, Scene } from 'phaser';

interface ITowerProps {
  scene: Scene;
  x: number;
  y: number;
  towerType: number;
  disks: number[];
}

export class Tower extends Physics.Arcade.Image {
  private readonly _towerType: number;

  private _disks: number[];

  constructor({ scene, x, y, towerType, disks: pieces }: ITowerProps) {
    super(scene, x, y, 'tower');

    scene.physics.add.existing(this);

    this._towerType = towerType;
    this._disks = pieces;

    this.setScale(0.6, 0.6);
    this.setBodySize(this.width - 60, this.height - 20);
  }

  public get disks() {
    return this._disks;
  }

  public set disks(value: number[]) {
    this._disks = value;
  }

  public get towerType() {
    return this._towerType;
  }
}
