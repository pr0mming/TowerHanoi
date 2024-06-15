import { Scene } from 'phaser';
import { IGameInitialData } from '../common/interfaces/IGameInitialData';

interface GameRulesManagerProps {
  scene: Scene;
  gameData: IGameInitialData;
}

export class GameRulesManager {
  private _scene: Scene;
  private _gameData: IGameInitialData;

  private readonly _MIN_DISK_AMMOUNT: number;
  private readonly _MAX_DISK_AMMOUNT: number;

  private readonly _MIN_SPEED_AMMOUNT: number;
  private readonly _MAX_SPEED_AMMOUNT: number;

  private readonly _SPEED_INTERVAL: number;

  constructor({ scene, gameData }: GameRulesManagerProps) {
    this._scene = scene;
    this._gameData = gameData;

    this._MIN_DISK_AMMOUNT = 6;
    this._MAX_DISK_AMMOUNT = 10;

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
}
