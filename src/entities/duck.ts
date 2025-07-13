import type { GameObj } from "kaplay";
import k from "../kaplayCtx";
import gameManager from "../gameManager";
import { COLORS } from "../constants";

export default function makeDuck(duckId: string, speed: number) {
  const startingPos = [
    k.vec2(80, k.center().y + 40),
    k.vec2(k.center().x, k.center().y + 40),
    k.vec2(200, k.center().y + 40),
  ];

  const flyDirection = [k.vec2(-1, -1), k.vec2(1, -1), k.vec2(1, -1)];

  const chosenPosIndex = k.randi(startingPos.length);
  const chosenFlyDirectionIndex = k.randi(flyDirection.length);

  return k.add([
    k.sprite("duck", { anim: "flight-style" }),
    k.area({ shape: new k.Rect(k.vec2(0), 24, 24) }),
    k.body(),
    k.anchor("center"),
    k.pos(startingPos[chosenPosIndex]),
    k.state("fly", ["fly", "shot", "fall"]),
    k.timer(),
    k.offscreen({ destroy: true, distance: 100 }),
    {
      flyTimer: 0,
      timeBeforeEscaping: 5,
      duckId,
      flyDirection: null,
      speed,
      quackingSound: null,
      flappingSound: null,

      setBehavior(this: GameObj) {
        this.flyDirection = flyDirection[chosenFlyDirectionIndex];

        if (this.flyDirection.x < 0) this.flipX = true;
        this.quackingSound = k.play("quacking", { volume: 0.5, loop: true });
        this.flappingSound = k.play("flapping", { speed: 2, loop: true });

        this.onStateUpdate("fly", () => {
          // TODO: implement
        });

        this.onStateEnter("shot", () => {
          // TODO: implement
        });

        this.onStateEnter("fall", () => {
          // TODO: implement
        });

        this.onStateUpdate("fall", async () => {
          // TODO: implement
        });

        this.onClick(() => {
          if (gameManager.nbBulletsLeft < 0) return;
          gameManager.currentScore += 100;
          this.play("shot");
          this.enterState("shot");
        });

        const sky = k.get("sky")[0];
        this.loop(1, () => {
          this.flyTimer += 1;
          if (this.flyTimer === this.timeBeforeEscaping) {
            sky.color = k.Color.fromHex(COLORS.BEIGE);
          }
        });

        this.onExitScreen(() => {
          this.quackingSound.stop();
          this.flappingSound.stop();
          sky.color = k.Color.fromHex(COLORS.BLUE);
          gameManager.nbBulletsLeft = 3;
          gameManager.enterState("duck-escaped");
        });
      },
    },
  ]);
}
