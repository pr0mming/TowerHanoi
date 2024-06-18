import { IGameInitialData } from '../interfaces/IGameInitialData';

// Important function to know parameters when the game starts (the user can modify it in the game)
export const getInitialGameData = (): IGameInitialData => {
  return {
    speed: 50,
    attemps: 0,
    disksAmmount: 6,
    towersAmmount: 3,
  };
};
