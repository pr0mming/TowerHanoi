import { GameObjects, Scene, Time } from 'phaser';
import { IGameInitialData } from '../common/interfaces/IGameInitialData';
import { ButtonGroup } from '../controls/button/ButtonGroup';
import { RegulationButtonGroup } from '../controls/regulation-button/RegulationButton';
import { TowerGroup } from '../objects/tower/TowerGroup';
import { DiskGroup } from '../objects/disk/DiskGroup';
import { Disk } from '../objects/disk/Disk';
import { Tower } from '../objects/tower/Tower';
import { IGameInstruction } from '../common/interfaces/IGameInstruction';
import { GameRulesManager } from '../managers/GameRulesManager';
import { getInitialGameData } from '../common/functions/getInitialGameData';

export class Game extends Scene {
  private _gameData!: IGameInitialData;

  private _solve: IGameInstruction[] = [];

  private _gameRulesManager!: GameRulesManager;

  private _buttonsGroup!: ButtonGroup;
  private _towerGroup!: TowerGroup;
  private _diskGroup!: DiskGroup;

  private _labels!: GameObjects.Group;

  private _elapsedSeconds: number;
  private _stopWatch?: Time.TimerEvent;

  constructor() {
    super('Game');

    this._elapsedSeconds = 0;
  }

  init(gameData: IGameInitialData) {
    this._gameData = gameData;
  }

  create() {
    this.cameras.main.setBounds(0, 0, 900, 600);

    this._gameRulesManager = new GameRulesManager({
      scene: this,
      gameData: this._gameData,
    });

    //Crear botones

    this._buttonsGroup = new ButtonGroup({
      scene: this,
    });

    this._buttonsGroup.addButton({
      x: 250,
      y: 540,
      text: 'Solve',
      name: 'SOLVE',
      onPointerDownEvent: () => {
        this.clickSolve();
      },
    });

    this._buttonsGroup.addButton({
      x: 400,
      y: 540,
      text: 'Restart',
      name: 'RESTART',
      onPointerDownEvent: () => {
        this._gameData = getInitialGameData();
        this.scene.restart(this._gameData);
      },
    });

    //Crear controles de juego

    this.setUpLabels();

    const regulationBtnGroup = new RegulationButtonGroup({
      scene: this,
    });

    regulationBtnGroup.addButton({
      x: 550,
      y: 22,
      text: 'PIECES: ' + this._gameData.disksAmmount,
      pointerDownUpEvent: () => {
        this._gameRulesManager.upDisksAmmount();
      },
      pointerDownDownEvent: () => {
        this._gameRulesManager.downDisksAmmount();
      },
    });

    regulationBtnGroup.addButton({
      x: 720,
      y: 22,
      text: 'SPEED: ' + this._gameData.speed,
      pointerDownUpEvent: () => {
        this._gameRulesManager.upSpeed();
      },
      pointerDownDownEvent: () => {
        this._gameRulesManager.downSpeed();
      },
    });

    //Crear elementos de juego

    this._towerGroup = new TowerGroup({
      scene: this,
      world: this.physics.world,
      towersNumber: 3,
    });

    //Mapear posiciones

    /*
            pieza 3 ->    --
            pieza 2 ->   ----
            pieza 1 ->  ------
            pieza 0 -> --------
        */

    /*
              |        |        |
            tower 0  tower 1  tower 2
        */

    this._diskGroup = new DiskGroup({
      scene: this,
      world: this.physics.world,
      diskNumber: 6,
      onDragLeave: (disk: Disk) => {
        this.validateHanoi(disk);
      },
    });

    this.input.on(Phaser.Input.Events.DRAG_START, () => {
      if (this._stopWatch === undefined || this._stopWatch?.paused) {
        this._setUpTimer();
      }

      //this._buttonSolve.inputEnabled = false;
    });
  }

  private _setUpTimer() {
    this._elapsedSeconds = 0;

    this._stopWatch = this.time.addEvent({
      delay: 1000,
      callback: () => {
        const elapsedSeconds = this._elapsedSeconds;

        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;

        const timeFormat =
          String(hours).padStart(2, '0') +
          ':' +
          String(minutes).padStart(2, '0') +
          ':' +
          String(seconds).padStart(2, '0');

        this._setLabelTextByKey('TIME', `TIME: ${timeFormat}`);

        this._elapsedSeconds++;
      },
      loop: true,
      callbackScope: this,
    });
  }

  validateHanoi(disk: Disk) {
    if (
      !this.physics.overlap(
        disk,
        this._towerGroup,
        (_, tower) => {
          const _tower = tower as Tower;

          // Ubicar pieza en la torre (visualmente)

          disk.x = _tower.getCenter().x;

          if (_tower.disks.length === 0) {
            disk.y = _tower.getBottomCenter().y - 40;
          } else {
            const firstDiskTypeTarget = _tower.disks[_tower.disks.length - 1];

            const firstDiskTarget =
              this._diskGroup.getByType(firstDiskTypeTarget);

            disk.y = firstDiskTarget.getBottomCenter().y - 50;
          }

          disk.currentPosition = { x: disk.x, y: disk.y }; // Guardar posición actual

          const originTower = this._towerGroup.getByIndex(disk.towerOwner);
          const firstDiskTypeOrigin = originTower.disks.pop(); // Eliminar primera pieza de la torre antigua

          if (firstDiskTypeOrigin !== undefined) {
            _tower.disks = [..._tower.disks, firstDiskTypeOrigin]; // Poner la pieza en la nueva torre
            disk.towerOwner = _tower.towerType; // Guarda la torre en que se puso la pieza
          }

          this._gameData.attemps++;

          this._setLabelTextByKey(
            'ATTEMPS',
            'MOVEMENTS: ' + this._gameData.attemps
          );

          // Win?

          if (this.winUser()) {
            this._buttonsGroup.getByName('SOLVE').disableInteractive();
            this._diskGroup.setInteractive(false);

            this._showEndGameLabel('WIN!');
          }
        },
        (_, tower) => {
          const _tower = tower as Tower;

          return (
            _tower.disks.length === 0 ||
            disk.diskType > _tower.disks[_tower.disks.length - 1]
          );
        },
        this
      )
    ) {
      //Volver a la posición anterior en caso de no poner la ficha en una torre

      disk.x = disk.currentPosition.x;
      disk.y = disk.currentPosition.y;
    }
  }

  private _showEndGameLabel(text: string) {
    if (this._stopWatch) this._stopWatch.paused = true;

    const stWin = this.add
      .text(400, 50, text)
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(15)
      .setColor('white')
      .setStroke('black', 2.5)
      .setScrollFactor(0, 0)
      .setAlpha(0);

    this.tweens.add({
      targets: stWin,
      props: {
        alpha: 1,
      },
      ease: 'Sine.easeInOut',
      yoyo: true,
      repeat: -1,
    });
  }

  recursionHanoi(
    n: number,
    origin: number,
    destination: number,
    auxiliary: number
  ) {
    if (n == this._gameData.disksAmmount - 1) {
      this._solve.push({
        disk: n,
        originTower: origin,
        targetTower: destination,
      });
    } else {
      this.recursionHanoi(n + 1, origin, auxiliary, destination);

      this._solve.push({
        disk: n,
        originTower: origin,
        targetTower: destination,
      });

      this.recursionHanoi(n + 1, auxiliary, destination, origin);
    }
  }

  winUser() {
    const tower = this._towerGroup.getByIndex(this._towerGroup.getLength() - 1);

    const disks = tower.disks;

    if (disks.length === this._gameData.disksAmmount) return true;

    return false;
  }

  clickSolve() {
    this.recursionHanoi(0, 0, 2, 1);

    this._diskGroup.setInteractive(false);
    this._buttonsGroup.setInteractive(false);

    this._setUpTimer();

    const instructions = this.getInstructions();

    this._stopWatch = this.time.addEvent({
      delay: this._gameData.speed,
      callback: () => {
        const o = instructions.next();

        if (o.value) {
          const disk = this._diskGroup.getByType(o.value.disk),
            tower = this._towerGroup.getByIndex(o.value.targetTower);

          this._gameData.attemps++;

          this._setLabelTextByKey(
            'ATTEMPS',
            'MOVEMENTS: ' + this._gameData.attemps
          );

          if (tower.disks.length === 0) {
            const originTower = this._towerGroup.getByIndex(disk.towerOwner);

            const firstDiskTypeOrigin = originTower.disks.shift(); // Eliminar primera pieza de la torre antigua

            if (firstDiskTypeOrigin !== undefined) {
              tower.disks = [firstDiskTypeOrigin, ...tower.disks]; // Poner la pieza en la nueva torre
              disk.towerOwner = tower.towerType; // Guarda la torre en que se puso la pieza
            }

            // Ubicar pieza en la torre (visualmente)

            if (tower.body) {
              let diskY = 0;

              if (tower.disks.length === 0) {
                diskY = tower.body.bottom - 10;
              } else {
                const [firstDiskTypeTarget] = tower.disks;

                const firstDiskTarget =
                  this._diskGroup.getByType(firstDiskTypeTarget);

                diskY = (firstDiskTarget.body?.center.y ?? 0) - 33;
              }

              this.tweens.add({
                targets: disk,
                props: {
                  x: tower.body.center.x,
                  y: diskY,
                },
                ease: 'Sine.easeInOut',
                yoyo: true,
                repeat: -1,
              });
            }

            disk.currentPosition = { x: disk.x, y: disk.y }; // Guardar posición actual

            this._gameData.attemps++;

            this._setLabelTextByKey(
              'MOVEMENTS',
              'MOVEMENTS: ' + this._gameData.attemps
            );
          } else {
            // if (tower._pieces[0] < piece._typePiece) {
            //   this._towers.getAt(piece._typeTower)._pieces.shift(); // Eliminar primera pieza de la torre antigua
            //   tower._pieces.splice(0, 0, piece._typePiece); // Poner la pieza en la nueva torre
            //   piece._typeTower = this._towers.getIndex(tower); // Guarda la torre en que se puso la pieza
            //   // Ubicar pieza en la torre (visualmente)
            //   //piece.x = tower._standar[piece._typePiece].x;
            //   //piece.y = tower._standar[tower._pieces.length - 1].y;
            //   this.add.tween(piece).to(
            //     {
            //       x: tower._standar[piece._typePiece].x,
            //       y: tower._standar[tower._pieces.length - 1].y,
            //     },
            //     100,
            //     'Quart.easeOut',
            //     true
            //   );
            //   piece._oldPosition = { x: piece.x, y: piece.y }; // Guardar posición actual
            // } else {
            //   piece.x = piece._oldPosition.x;
            //   piece.y = piece._oldPosition.y;
            // }
          }
        } else {
          this._buttonsGroup.getByName('RESTART').enableInteraction();

          this._showEndGameLabel('FINISHED!');
        }
      },
      loop: true,
      callbackScope: this,
    });
  }

  *getInstructions() {
    for (const instruction of this._solve) {
      yield instruction;
    }
  }

  setUpLabels() {
    const style = {
      font: '15px BitBold',
      fill: 'white',
      stroke: 'black',
      strokeThickness: 2.5,
    };

    this._labels = this.add.group();

    const attempsLabel = this.add.text(
      50,
      22,
      'MOVEMENTS: ' + this._gameData.attemps,
      style
    );

    attempsLabel.name = 'ATTEMPS';
    attempsLabel.setScrollFactor(0, 0);

    this._labels.add(attempsLabel, true);

    const timeLabel = this.add.text(230, 22, 'TIME: 00:00:00', style);

    timeLabel.name = 'TIME';
    timeLabel.setScrollFactor(0, 0);

    this._labels.add(timeLabel, true);
  }

  private _setLabelTextByKey(keyName: string, value: string) {
    const _label = this._labels.getMatching('name', keyName)[0];

    if (_label) {
      (_label as GameObjects.Text).setText(value);
    }
  }
}
