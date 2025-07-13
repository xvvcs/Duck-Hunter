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
    k.sprite("duck", { anim: "flight-side" }),
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
          if (
            this.flyTimer < this.timeBeforeEscaping &&
            (this.pos.x > k.width() + 10 || this.pos.x < -10)
          ) {
            this.flyDirection.x = -this.flyDirection.x;
            this.flipX = !this.flipX;
            const currentAnim =
              this.getCurAnim().name === "flight-side"
                ? "flight-diagonal"
                : "flight-side";
            this.play(currentAnim);
          }
          if (this.pos.y < -10 || this.pos.y > k.height() - 70) {
            this.flyDirection.y = -this.flyDirection.y;
            const currentAnim =
              this.getCurAnim().name === "flight-side"
                ? "flight-diagonal"
                : "flight-side";
            this.play(currentAnim);
          }
          this.move(k.vec2(this.flyDirection).scale(this.speed));
        });

        this.onStateEnter("shot", async () => {
          gameManager.nbDucksShotInRound++;
          this.play("shot");
          this.quackingSound.stop();
          this.flappingSound.stop();
          await k.wait(0.2);
          this.enterState("fall");
        });

        this.onStateEnter("fall", () => {
          this.fallSound = k.play("fall", { volume: 0.7 });
          this.play("fall");
        });

        this.onStateUpdate("fall", async () => {
          this.move(0, this.speed);
          if (this.pos.y > k.height() - 70) {
            this.fallSound.stop();
            k.play("impact");
            k.destroy(this);
            sky.color = k.Color.fromHex(COLORS.BLUE);
            const duckIcon = k.get(`duck-icon-${this.duckId}`, {
              recursive: true,
            })[0];
            if (duckIcon) duckIcon.color = k.Color.fromHex(COLORS.RED);

            await k.wait(1);
            gameManager.enterState("duck-hunted");
          }
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
