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

    //Crear botones

    this._buttonsGroup = new ButtonGroup({
      scene: this,
    });

    this._buttonsGroup.addButton({
      x: this.cameras.main.centerX - 100,
      y: 620,
      text: 'Solve',
      name: 'SOLVE',
      onPointerDownEvent: () => {
        this.handleSolveClick();
      },
    });

    this._buttonsGroup.addButton({
      x: this.cameras.main.centerX + 100,
      y: 620,
      text: 'Restart',
      name: 'RESTART',
      onPointerDownEvent: () => {
        const gameData = getInitialGameData();
        this.scene.start('Game', gameData);
      },
    });

    //Crear controles de juego

    this.setUpLabels();

    const regulationBtnGroup = new RegulationButtonGroup({
      scene: this,
    });

    regulationBtnGroup.addButton({
      x: 560,
      y: 30,
      text: 'PIECES: ' + this._gameData.disksAmmount,
      pointerDownUpEvent: () => {
        this._gameRulesManager.upDisksAmmount();
      },
      pointerDownDownEvent: () => {
        this._gameRulesManager.downDisksAmmount();
      },
    });

    regulationBtnGroup.addButton({
      x: 750,
      y: 30,
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
      diskNumber: this._gameData.disksAmmount,
      towersNumber: this._gameData.towersAmmount,
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
      diskNumber: this._gameData.disksAmmount,
      onDragLeave: (disk: Disk) => {
        this.validateHanoi(disk);
      },
    });

    this._gameRulesManager = new GameRulesManager({
      scene: this,
      gameData: this._gameData,
      diskGroup: this._diskGroup,
      towerGroup: this._towerGroup,
    });

    this.input.on(Phaser.Input.Events.DRAG_START, () => {
      if (this._stopWatch === undefined || this._stopWatch?.paused) {
        this._setUpTimer();
      }
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
          // Ubicar pieza en la torre (visualmente)

          const { x, y } = this._gameRulesManager.computeDiskPosition(
            disk,
            tower as Tower
          );

          disk.x = x;
          disk.y = y;

          this._gameData.attemps++;

          this._setLabelTextByKey(
            'ATTEMPS',
            'MOVEMENTS: ' + this._gameData.attemps
          );

          // Win?

          if (this._gameRulesManager.hasFinished()) {
            this._buttonsGroup.getByName('SOLVE').disableInteractive();
            this._diskGroup.setInteractive(false);

            if (this._stopWatch) this._stopWatch.paused = true;

            this._showEndGameLabel('WIN!');
          }
        },
        (_, tower) => {
          return this._gameRulesManager.isDiskOverlaped(disk, tower as Tower);
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
      .text(this.cameras.main.centerX, 120, text)
      .setFontFamily('"BitBold", "Tahoma"')
      .setFontSize(20)
      .setColor('white')
      .setStroke('black', 2.5)
      .setScrollFactor(0, 0)
      .setAlpha(0)
      .setOrigin(0.5);

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

  handleSolveClick() {
    this._diskGroup.setInteractive(false);
    this._buttonsGroup.setInteractive(false);

    const instructions: IGameInstruction[] = [];
    this._gameRulesManager.getSolutionInstructions(0, 0, 2, 1, instructions);

    this._setUpTimer();

    this.processGameInstruction(instructions, 0);
  }

  processGameInstruction(instructions: IGameInstruction[], index: number) {
    if (index < instructions.length) {
      const o = instructions[index];

      const disk = this._diskGroup.getByType(o.disk);
      const tower = this._towerGroup.getByIndex(o.targetTower);

      const { x, y } = this._gameRulesManager.computeDiskPosition(disk, tower);

      this.tweens.add({
        targets: disk,
        duration: this._gameData.speed,
        props: {
          x,
          y,
        },
        ease: 'Sine.easeInOut',
        onComplete: () => {
          this.processGameInstruction(instructions, index + 1);
        },
      });

      this._gameData.attemps++;

      this._setLabelTextByKey(
        'MOVEMENTS',
        'MOVEMENTS: ' + this._gameData.attemps
      );
    } else {
      this._buttonsGroup.getByName('RESTART').enableInteraction();

      this._showEndGameLabel('FINISHED!');
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
