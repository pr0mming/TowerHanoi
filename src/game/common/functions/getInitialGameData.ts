import { IGameInitialData } from '../interfaces/IGameInitialData';

export const getInitialGameData = (): IGameInitialData => {
  return {
    speed: 50,
    attemps: 0,
    disksAmmount: 6,
    towersAmmount: 3,
  };
};
