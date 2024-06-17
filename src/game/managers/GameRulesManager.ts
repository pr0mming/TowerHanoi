import { Scene } from 'phaser';
import { IGameInitialData } from '../common/interfaces/IGameInitialData';
import { Disk } from '../objects/disk/Disk';
import { Tower } from '../objects/tower/Tower';
import { DiskGroup } from '../objects/disk/DiskGroup';
import { TowerGroup } from '../objects/tower/TowerGroup';
import { IObjectPosition } from '../common/interfaces/IObjectPosition';
import { IGameInstruction } from '../common/interfaces/IGameInstruction';

interface GameRulesManagerProps {
  scene: Scene;
  gameData: IGameInitialData;
  diskGroup: DiskGroup;
  towerGroup: TowerGroup;
}

export class GameRulesManager {
  private _scene: Scene;
  private _gameData: IGameInitialData;

  private _diskGroup: DiskGroup;
  private _towerGroup: TowerGroup;

  private readonly _MIN_DISK_AMMOUNT: number;
  private readonly _MAX_DISK_AMMOUNT: number;

  private readonly _MIN_SPEED_AMMOUNT: number;
  private readonly _MAX_SPEED_AMMOUNT: number;

  private readonly _SPEED_INTERVAL: number;

  constructor({
    scene,
    gameData,
    diskGroup,
    towerGroup,
  }: GameRulesManagerProps) {
    this._scene = scene;
    this._gameData = gameData;

    this._diskGroup = diskGroup;
    this._towerGroup = towerGroup;

    this._MIN_DISK_AMMOUNT = 3;
    this._MAX_DISK_AMMOUNT = 8;

    this._MIN_SPEED_AMMOUNT = 5;
    this._MAX_SPEED_AMMOUNT = 200;

    this._SPEED_INTERVAL = 10;
  }

  upDisksAmmount() {
    const newValue = this._gameData.disksAmmount + 1;

    if (newValue <= this._MAX_DISK_AMMOUNT) {
      this._gameData.disksAmmount = newValue;
      this._scene.scene.start('Game', this._gameData);
    }
  }

  downDisksAmmount() {
    const newValue = this._gameData.disksAmmount - 1;

    if (newValue >= this._MIN_DISK_AMMOUNT) {
      this._gameData.disksAmmount = newValue;
      this._scene.scene.start('Game', this._gameData);
    }
  }

  upSpeed() {
    const newValue = this._gameData.speed + this._SPEED_INTERVAL;

    if (newValue <= this._MAX_SPEED_AMMOUNT) {
      this._gameData.speed = newValue;
      this._scene.scene.start('Game', this._gameData);
    }
  }

  downSpeed() {
    const newValue = this._gameData.speed - this._SPEED_INTERVAL;

    if (newValue >= this._MIN_SPEED_AMMOUNT) {
      this._gameData.speed = newValue;
      this._scene.scene.start('Game', this._gameData);
    }
  }

  getSolutionInstructions(
    n: number,
    origin: number,
    destination: number,
    auxiliary: number,
    instructions: IGameInstruction[]
  ) {
    if (n == this._gameData.disksAmmount - 1) {
      instructions.push({
        disk: n,
        originTower: origin,
        targetTower: destination,
      });
    } else {
      this.getSolutionInstructions(
        n + 1,
        origin,
        auxiliary,
        destination,
        instructions
      );

      instructions.push({
        disk: n,
        originTower: origin,
        targetTower: destination,
      });

      this.getSolutionInstructions(
        n + 1,
        auxiliary,
        destination,
        origin,
        instructions
      );
    }
  }

  computeDiskPosition(disk: Disk, tower: Tower): IObjectPosition {
    const x = tower.getCenter().x;
    let y = 0;

    if (tower.disks.length === 0) {
      y = tower.getBottomCenter().y - 40;
    } else {
      const firstDiskTypeTarget = tower.disks[tower.disks.length - 1];

      const firstDiskTarget = this._diskGroup.getByType(firstDiskTypeTarget);

      y = firstDiskTarget.getBottomCenter().y - 50;
    }

    disk.currentPosition = { x, y }; // Guardar posición actual

    const originTower = this._towerGroup.getByIndex(disk.towerOwner);
    const firstDiskTypeOrigin = originTower.disks.pop(); // Eliminar primera pieza de la torre antigua

    if (firstDiskTypeOrigin !== undefined) {
      tower.disks.push(disk.diskType); // Poner la pieza en la nueva torre
      disk.towerOwner = tower.towerType; // Guarda la torre en que se puso la pieza
    }

    return { x, y };
  }

  isDiskOverlaped(disk: Disk, tower: Tower) {
    const originTower = this._towerGroup.getByIndex(disk.towerOwner);

    if (originTower.disks[originTower.disks.length - 1] !== disk.diskType)
      return false;

    return (
      tower.disks.length === 0 ||
      disk.diskType > tower.disks[tower.disks.length - 1]
    );
  }

  hasFinished() {
    const tower = this._towerGroup.getByIndex(this._towerGroup.getLength() - 1);

    const disks = tower.disks;

    if (disks.length < this._gameData.disksAmmount) return false;

    return true;
  }
}
