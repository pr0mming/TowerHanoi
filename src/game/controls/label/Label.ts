import { GameObjects, Scene } from 'phaser';

interface ILabelProps {
  scene: Scene;
  x: number;
  y: number;
  text: string;
  nameKey: string;
}

export class Label extends GameObjects.Text {
  constructor({ scene, x, y, text, nameKey }: ILabelProps) {
    super(scene, x, y, text, {});

    this.name = nameKey;
  }
}
