import { Scene } from 'phaser';

// Intefaces
import { IGameInitialData } from '@game/common/interfaces/IGameInitialData';
import { IObjectPosition } from '../common/interfaces/IObjectPosition';
import { IGameInstruction } from '../common/interfaces/IGameInstruction';

// Objects
import { Disk } from '@game/objects/disk/Disk';
import { Tower } from '@game/objects/tower/Tower';
import { DiskGroup } from '@game/objects/disk/DiskGroup';
import { TowerGroup } from '@game/objects/tower/TowerGroup';

interface GameRulesManagerProps {
  scene: Scene;
  gameData: IGameInitialData;
  diskGroup: DiskGroup;
  towerGroup: TowerGroup;
}

/**
 * This class represents the business logic of the game (move disks and check when to win)
 */
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

    // Use these values carefully with the "getInitialGameData" helper
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

  /**
   * This method uses recursion to returns an array of instructions to place X disk in Y tower
   * @param n disk to move, it should be 0
   * @param origin origin tower, it should be 0
   * @param destination destination tower, it should be the last one (2)
   * @param auxiliary it's the support tower, normally the one in the middle (1)
   * @param instructions array of solutions, it should be empty
   */
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

  /**
   * This method returns X, Y position to put visually the disk
   * @param disk disk to move
   * @param tower destination tower
   * @returns X, Y position to move the sprite
   */
  computeDiskPosition(disk: Disk, tower: Tower): IObjectPosition {
    const x = tower.getCenter().x;
    let y = 0;

    // If the destination tower is empty put the disk in the depth
    if (tower.disks.length === 0) {
      y = tower.getBottomCenter().y - 40;
    } else {
      // Otherwise take the first disk and get an offset to put the disk
      const firstDiskTypeTarget = tower.disks[tower.disks.length - 1];

      const firstDiskTarget = this._diskGroup.getByType(firstDiskTypeTarget);

      y = firstDiskTarget.getBottomCenter().y - 50;
    }

    disk.currentPosition = { x, y }; // Keep this to get back the disk to the tower if is an invalid movement

    // Remove disk from the origin tower
    const originTower = this._towerGroup.getByIndex(disk.towerOwner);
    const firstDiskTypeOrigin = originTower.disks.pop();

    // Add disk to the destination tower
    if (firstDiskTypeOrigin !== undefined) {
      tower.disks.push(disk.diskType); // Poner la pieza en la nueva torre
      disk.towerOwner = tower.towerType; // Guarda la torre en que se puso la pieza
    }

    return { x, y };
  }

  /**
   * This method tells if the user can put a disk on a tower
   * @param disk disk to move
   * @param tower tower destination
   * @returns `true` if can move the disk, otherwise `false`
   */
  isDiskOverlaped(disk: Disk, tower: Tower) {
    const originTower = this._towerGroup.getByIndex(disk.towerOwner);

    // Improtant: this is to avoid move a disk different to the first one (the first on the top of the tower)
    if (originTower.disks[originTower.disks.length - 1] !== disk.diskType)
      return false;

    // Move if the destination tower has 0 disks or if the disk to move is smaller than the one over there
    return (
      tower.disks.length === 0 ||
      disk.diskType > tower.disks[tower.disks.length - 1]
    );
  }

  /**
   * This method checks if the game ends (when all the disks are in the last tower)
   * @returns `true` if has finished, othwerwise `false`
   */
  hasFinished() {
    const tower = this._towerGroup.getByIndex(this._towerGroup.getLength() - 1);

    const disks = tower.disks;

    // Isn't necessary validate the order of each disk because it's done by the collider
    if (disks.length < this._gameData.disksAmmount) return false;

    return true;
  }
}
