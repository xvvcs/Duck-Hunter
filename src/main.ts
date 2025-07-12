import { COLORS } from "./constants";
import k from "./kaplayCtx";
import { formatScore } from "./utils";

// Loads
k.loadSprite("menu", "./graphics/menu.png");
k.loadFont("nes-font", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");
k.loadSprite("background", "./graphics/background.png");

k.scene("main-menu", () => {
  k.add([k.sprite("menu")]);

  k.add([
    k.text("CLICK TO START", { font: "nes-font", size: 8 }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 40),
  ]);

  k.add([
    k.text("MADE BY XVVCS", {
      font: "nes-font",
      size: 6,
    }),
    k.color(COLORS.GRAY),
    k.anchor("center"),
    k.pos(k.width() - 200, k.height() - 10),
    k.opacity(0.5),
  ]);

  let highScore: number = k.getData("high-score") || 0;

  k.add([
    k.text(`TOP SCORE: ${formatScore(highScore)}`, {
      font: "nes-font",
      size: 8,
    }),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 60),
    k.color(COLORS.RED),
    k.opacity(0.5),
  ]);

  k.onClick(() => {
    k.go("game");
  });
});

k.scene("game", () => {
  k.setCursor("none");
  k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLUE), "sky"]);
  k.add([k.sprite("background"), k.pos(0, -10), k.z(1)]);
});

k.scene("game-over", () => {});

k.go("main-menu");
