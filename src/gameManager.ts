import k from "./kaplayCtx";
import type { GameObj } from "kaplay";

function makeGameManager() {
  return k.add([
    k.state("menu", [
      "menu",
      "cutscene",
      "round-start",
      "round-end",
      "hunt-start",
      "hunt-end",
      "duck-hunted",
      "duck-escaped",
    ]),
    {
      isGamePaused: false,
      currentScore: 0,
      currentHuntNb: 0,
      currentRoundNb: 0,
      nbBulletsLeft: 3,
      nbDucksShotInRound: 0,
      praySpeed: 100,
      resetGameState(this: GameObj) {
        this.isGamePaused = false;
        this.currentScore = 0;
        this.currentHuntNb = 0;
        this.currentRoundNb = 0;
        this.nbBulletsLeft = 3;
        this.nbDucksShotInRound = 0;
        this.praySpeed = 100;
      },
    },
  ]);
}

const gameManager = makeGameManager();

export default gameManager;
