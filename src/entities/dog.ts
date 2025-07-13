import gameManager from "../gameManager";
import k from "../kaplayCtx";
import type { GameObj, Vec2 } from "kaplay";

export default function makeDog(position: Vec2) {
  const sniffingSound = k.play("dog-sniffing", { volume: 2 });
  sniffingSound.stop();

  const barkingSound = k.play("dog-barking");
  barkingSound.stop();

  const laughingSound = k.play("dog-laughing");
  laughingSound.stop();

  return k.add([
    k.sprite("dog"),
    k.pos(position),
    k.state("search", ["search", "sniff", "detect", "jump", "drop"]),
    k.z(2),
    {
      speed: 15,
      searchForDucks(this: GameObj) {
        let nbSniffs = 0;

        this.onStateEnter("search", () => {
          this.play("search");
          k.wait(2, () => {
            this.enterState("sniff");
          });
        });
        this.onStateUpdate("search", () => {
          this.move(this.speed, 0);
        });

        this.onStateEnter("sniff", () => {
          nbSniffs++;
          this.play("sniff");
          sniffingSound.play();
          k.wait(2, () => {
            sniffingSound.stop();
            if (nbSniffs === 2) {
              this.enterState("detect");
              return;
            }
            this.enterState("search");
          });
        });

        this.onStateEnter("detect", () => {
          barkingSound.play();
          this.play("detect");
          k.wait(1, () => {
            barkingSound.stop();
            this.enterState("jump");
          });
        });

        this.onStateEnter("jump", () => {
          barkingSound.play();
          this.play("jump");
          k.wait(0.5, () => {
            barkingSound.stop();
            this.z = 0;
            this.enterState("drop");
          });
        });

        this.onStateUpdate("jump", () => {
          this.move(100, -50);
        });

        this.onStateEnter("drop", async () => {
          await k.tween(
            this.pos.y,
            125,
            0.5,
            (newY) => (this.pos.y = newY),
            k.easings.linear
          );
          gameManager.enterState("round-start", true);
        });
      },
      async slideUpAndDown(this: GameObj) {
        await k.tween(
          this.pos.y,
          90,
          0.4,
          (newY) => (this.pos.y = newY),
          k.easings.linear
        );
        await k.wait(1);
        await k.tween(
          this.pos.y,
          125,
          0.4,
          (newY) => (this.pos.y = newY),
          k.easings.linear
        );
      },
      async catchFallenDuck(this: GameObj) {
        this.play("catch");
        k.play("successful-hunt");
        await this.slideUpAndDown();
        gameManager.enterState("hunt-end", true);
      },
      async mockPlayer(this: GameObj) {
        laughingSound.play();
        this.play("mock");
        await this.slideUpAndDown();
        gameManager.enterState("hunt-end", true);
      },
    },
  ]);
}
