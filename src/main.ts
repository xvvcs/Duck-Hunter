import { COLORS } from "./constants";
import k from "./kaplayCtx";
import gameManager from "./gameManager";
import { formatScore } from "./utils";

// Loads
k.loadSprite("menu", "./graphics/menu.png");
k.loadFont("nes-font", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");
k.loadSprite("background", "./graphics/background.png");
k.loadSprite("cursor", "./graphics/cursor.png");
k.loadSound("gun-shot", "./sounds/gun-shot.wav");

// Main menu scene
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

// Game scene
k.scene("game", () => {
  k.setCursor("none");
  k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLUE), "sky"]);
  k.add([k.sprite("background"), k.pos(0, -10), k.z(1)]);

  const score = k.add([
    k.text(formatScore(0), { font: "nes-font", size: 8 }),
    k.pos(192, 197),
    k.z(2),
    k.color(COLORS.WHITE),
  ]);

  const roundCount = k.add([
    k.text("1", { font: "nes-font", size: 8 }),
    k.pos(42, 181),
    k.z(2),
    k.color(COLORS.RED),
  ]);

  const duckIcons = k.add([k.pos(95, 198)]);
  let duckIconPosX = 1;
  for (let i = 0; i < 10; i++) {
    duckIcons.add([k.rect(7, 9), k.pos(duckIconPosX, 0), `duck-icon-${i}`]);
    duckIconPosX += 8;
  }

  const bulletUIMask = k.add([
    k.rect(0, 8),
    k.pos(25, 198),
    k.z(2),
    k.color([0, 0, 0]),
  ]);

  const cursor = k.add([
    k.sprite("cursor"),
    k.anchor("center"),
    k.pos(),
    k.z(3),
  ]);

  k.onClick(() => {
    if (gameManager.state === "hunt-start" && !gameManager.isGamePaused) {
      if (gameManager.nbBulletsLeft > 0) k.play("gun-shot", { volume: 0.5 });
      gameManager.nbBulletsLeft--;
    }
  });

  k.onUpdate(() => {
    score.text = formatScore(gameManager.currentScore);
    switch (gameManager.nbBulletsLeft) {
      case 1:
        bulletUIMask.width = 15;
        break;
      case 2:
        bulletUIMask.width = 8;
        break;
      case 3:
        bulletUIMask.width = 0;
        break;
      default:
        bulletUIMask.width = 22;
    }
    cursor.moveTo(k.mousePos());
  });
});

// Game over scene
k.scene("game-over", () => {});

k.go("main-menu");
