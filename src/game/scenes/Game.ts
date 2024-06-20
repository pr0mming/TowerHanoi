import { Scene, Time } from 'phaser';

// Interfaces
import { IGameInitialData } from '@game/common/interfaces/IGameInitialData';
import { IGameInstruction } from '@game/common/interfaces/IGameInstruction';

// Controls
import { ButtonGroup } from '@game/controls/button/ButtonGroup';
import { RegulationButtonGroup } from '@game/controls/regulation-button/RegulationButton';
import { LabelGroup } from '@game/controls/label/LabelGroup';

// Objects
import { Disk } from '@game/objects/disk/Disk';
import { Tower } from '@game/objects/tower/Tower';
import { DiskGroup } from '@game/objects/disk/DiskGroup';
import { TowerGroup } from '@game/objects/tower/TowerGroup';

// Managers
import { GameRulesManager } from '@game/managers/GameRulesManager';

// Helpers
import { getInitialGameData } from '@game/common/functions/getInitialGameData';

/**
 * This class represents the whole game
 */
export class Game extends Scene {
  private _gameData!: IGameInitialData;

  private _gameRulesManager!: GameRulesManager;

  private _labelGroup!: LabelGroup;
  private _buttonsGroup!: ButtonGroup;
  private _towerGroup!: TowerGroup;
  private _diskGroup!: DiskGroup;

  private _elapsedSeconds: number = 0; // It's used to keep the seconds elapsed (Idk if there is a better approach)
  private _stopWatch?: Time.TimerEvent;

  constructor() {
    super('Game');
  }

  init(gameData: IGameInitialData) {
    this._gameData = gameData;
    this._elapsedSeconds = 0;
  }

  create() {
    this.cameras.main.setBounds(0, 0, 900, 600);

    // Create control buttons

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
        this.scene.restart(gameData);
      },
    });

    // Create labels

    this._labelGroup = new LabelGroup({
      scene: this,
      gameData: this._gameData,
    });

    // Create regulation buttons

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

    // Game objects

    // disk 3 ->    --
    // disk 2 ->   ----
    // disk 1 ->  ------
    // disk 0 -> --------

    //   |        |        |
    // tower 0  tower 1  tower 2

    this._towerGroup = new TowerGroup({
      scene: this,
      world: this.physics.world,
      diskNumber: this._gameData.disksAmmount,
      towersNumber: this._gameData.towersAmmount,
    });

    this._diskGroup = new DiskGroup({
      scene: this,
      world: this.physics.world,
      diskNumber: this._gameData.disksAmmount,
      onDragEnd: (disk: Disk) => {
        this.validateHanoi(disk);
      },
    });

    // Add game rules logic
    this._gameRulesManager = new GameRulesManager({
      scene: this,
      gameData: this._gameData,
      diskGroup: this._diskGroup,
      towerGroup: this._towerGroup,
    });

    this.input.on(Phaser.Input.Events.DRAG_START, () => {
      if (this._elapsedSeconds === 0) {
        this.restartStopwatch();

        this.input.removeListener(Phaser.Input.Events.DRAG_START);
      }
    });

    // Prepare timer to reuse
    this.setUpTimer();
  }

  /**
   * This method to prepares the stopwatch instance
   */
  setUpTimer() {
    this._stopWatch = new Phaser.Time.TimerEvent({
      delay: 1000,
      callback: () => {
        const elapsedSeconds = this._elapsedSeconds;

        // Show time format
        const hours = Math.floor(elapsedSeconds / 3600);
        const minutes = Math.floor((elapsedSeconds % 3600) / 60);
        const seconds = elapsedSeconds % 60;

        const timeFormat =
          String(hours).padStart(2, '0') +
          ':' +
          String(minutes).padStart(2, '0') +
          ':' +
          String(seconds).padStart(2, '0');

        this._labelGroup.setTextByKey('TIME', `TIME: ${timeFormat}`);

        this._elapsedSeconds++;
      },
      loop: true,
      callbackScope: this,
    });
  }

  restartStopwatch() {
    if (this._stopWatch) this.time.addEvent(this._stopWatch);
  }

  validateHanoi(disk: Disk) {
    if (
      !this.physics.overlap(
        disk,
        this._towerGroup,
        (_, tower) => {
          // Calculate x, y position and set the sprite visually

          const { x, y } = this._gameRulesManager.computeDiskPosition(
            disk,
            tower as Tower,
          );

          disk.x = x;
          disk.y = y;

          this._gameData.attemps++;

          this._labelGroup.setTextByKey(
            'ATTEMPS',
            'MOVEMENTS: ' + this._gameData.attemps,
          );

          // Check if user has won

          if (this._gameRulesManager.hasFinished()) {
            this._buttonsGroup.getByName('SOLVE').disableInteractive();
            this._diskGroup.setInteractive(false);

            if (this._stopWatch) this._stopWatch.paused = true;

            this._labelGroup.showEndGameLabel('YOU WON!');
          }
        },
        (_, tower) => {
          return this._gameRulesManager.isDiskOverlaped(disk, tower as Tower);
        },
        this,
      )
    ) {
      // Put back the sprite where it was (invalid movement case)

      disk.x = disk.currentPosition.x;
      disk.y = disk.currentPosition.y;
    }
  }

  /**
   * This method dispatch the logic to solve the game from any position
   */
  handleSolveClick() {
    // Disable buttons while is solving
    this._diskGroup.setInteractive(false);
    this._buttonsGroup.setInteractive(false);

    // Get set of instructions array
    const instructions: IGameInstruction[] = [];
    this._gameRulesManager.getSolutionInstructions(0, 0, 2, 1, instructions);

    if (this._elapsedSeconds === 0) {
      this.restartStopwatch();
    }

    // Put sprites visually
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
          // Recall again for the next instruction ...
          this.processGameInstruction(instructions, index + 1);
        },
      });

      this._gameData.attemps++;

      this._labelGroup.setTextByKey(
        'ATTEMPS',
        'MOVEMENTS: ' + this._gameData.attemps,
      );
    } else {
      // Has finished

      this._buttonsGroup.getByName('RESTART').enableInteraction();

      if (this._stopWatch) this._stopWatch.paused = true;

      this._labelGroup.showEndGameLabel('FINISHED!');
    }
  }
}
