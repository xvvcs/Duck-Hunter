import { COLORS, FONT_CONFIG } from "./constants";
import k from "./kaplayCtx";
import gameManager from "./gameManager";
import { formatScore } from "./utils";
import makeDog from "./entities/dog";
import makeDuck from "./entities/duck";

// Loads

// Fonts
k.loadFont("nes-font", "./fonts/nintendo-nes-font/nintendo-nes-font.ttf");

// Sprites
k.loadSprite("menu", "./graphics/menu.png");
k.loadSprite("background", "./graphics/background.png");
k.loadSprite("cursor", "./graphics/cursor.png");
k.loadSprite("text-box", "./graphics/text-box.png");
k.loadSprite("dog", "./graphics/dog.png", {
  sliceX: 4,
  sliceY: 3,
  anims: {
    search: { from: 0, to: 3, speed: 6, loop: true },
    sniff: { from: 4, to: 5, speed: 4, loop: true },
    detect: 6,
    jump: { from: 7, to: 8, speed: 6 },
    catch: 9,
    mock: { from: 10, to: 11, loop: true },
  },
});
k.loadSprite("duck", "./graphics/duck.png", {
  sliceX: 8,
  sliceY: 1,
  anims: {
    "flight-diagonal": { from: 0, to: 2, loop: true },
    "flight-side": { from: 3, to: 5, loop: true },
    shot: 6,
    fall: 7,
  },
});

// Sounds
k.loadSound("gun-shot", "./sounds/gun-shot.wav");
k.loadSound("ui-appear", "./sounds/ui-appear.wav");
k.loadSound("dog-sniffing", "./sounds/sniffing.wav");
k.loadSound("dog-barking", "./sounds/barking.wav");
k.loadSound("dog-laughing", "./sounds/laughing.wav");
k.loadSound("successful-hunt", "./sounds/successful-hunt.wav");
k.loadSound("quacking", "./sounds/quacking.wav");
k.loadSound("flapping", "./sounds/flapping.ogg");
k.loadSound("main-menu-music", "./sounds/main-menu-bg.wav");
k.loadSound("game-music", "./sounds/game-bg.wav");
k.loadSound("fall", "./sounds/fall.wav");
k.loadSound("impact", "./sounds/impact.wav");
k.loadSound("bonus-score", "./sounds/bonus.wav");

// Main menu scene
k.scene("main-menu", () => {
  const mainMenuMusic = k.play("main-menu-music", { volume: 0.5, loop: true });
  k.add([k.sprite("menu")]);

  k.add([
    k.text("CLICK TO START", FONT_CONFIG.NES_FONT),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 40),
  ]);

  k.add([
    k.text("MADE BY XVVCS", FONT_CONFIG.NES_FONT),
    k.color(COLORS.GRAY),
    k.anchor("center"),
    k.pos(k.width() - 200, k.height() - 10),
    k.opacity(0.5),
  ]);

  let highScore: number = k.getData("high-score") || 0;

  k.add([
    k.text(
      `TOP SCORE: ${
        String(k.getData("name")).toUpperCase() || "---"
      } ${formatScore(highScore)}`,
      FONT_CONFIG.NES_FONT
    ),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 60),
    k.color(COLORS.RED),
    k.opacity(0.5),
  ]);

  k.onClick(() => {
    mainMenuMusic.stop();
    k.go("game");
  });
});

// Game scene
k.scene("game", () => {
  const gameMusic = k.play("game-music", { volume: 0.3, loop: true });
  gameMusic.stop();

  k.setCursor("none");
  k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLUE), "sky"]);
  k.add([k.sprite("background"), k.pos(0, -10), k.z(1)]);

  const score = k.add([
    k.text(formatScore(0), FONT_CONFIG.NES_FONT),
    k.pos(192, 197),
    k.z(2),
    k.color(COLORS.WHITE),
  ]);

  const roundCount = k.add([
    k.text("1", FONT_CONFIG.NES_FONT),
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

  const dog = makeDog(k.vec2(0, k.center().y));
  dog.searchForDucks();

  // Game state controllers
  const roundStartController = gameManager.onStateEnter(
    "round-start",
    async (isFirstRound: boolean) => {
      gameManager.currentRoundNb++;
      if (!isFirstRound) gameManager.praySpeed += 50;
      k.play("ui-appear");
      gameMusic.play();
      roundCount.text = String(gameManager.currentRoundNb);
      const textBox = k.add([
        k.sprite("text-box"),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 50),
        k.z(3),
      ]);
      textBox.add([
        k.text("ROUND", FONT_CONFIG.NES_FONT),
        k.anchor("center"),
        k.pos(0, -10),
      ]);
      textBox.add([
        k.text(`${gameManager.currentRoundNb}`, FONT_CONFIG.NES_FONT),
        k.anchor("center"),
        k.pos(0, 4),
      ]);

      await k.wait(2);
      k.destroy(textBox);
      gameManager.enterState("hunt-start");
    }
  );

  const roundEndController = gameManager.onStateEnter("round-end", async () => {
    if (gameManager.nbDucksShotInRound < 6) {
      k.go("game-over");
      return;
    }

    if (gameManager.nbDucksShotInRound === 10) {
      const textBox = k.add([
        k.sprite("text-box"),
        k.anchor("center"),
        k.pos(k.center().x, k.center().y - 50),
        k.z(3),
      ]);
      textBox.add([
        k.text("BONUS!", FONT_CONFIG.NES_FONT),
        k.anchor("center"),
        k.pos(0, -10),
      ]);
      textBox.add([
        k.text(`+500`, FONT_CONFIG.NES_FONT),
        k.anchor("center"),
        k.pos(0, 4),
      ]);
      k.play("bonus-score", { volume: 2 });
      gameManager.currentScore += 500;
      await k.wait(2);
      k.destroy(textBox);
    }

    gameManager.nbDucksShotInRound = 0;
    for (const duckIcon of duckIcons.children) {
      duckIcon.color = k.Color.fromHex(COLORS.WHITE);
    }
    await k.wait(2);
    gameManager.enterState("round-start");
  });
  const huntStartController = gameManager.onStateEnter("hunt-start", () => {
    gameManager.currentHuntNb++;
    const duck = makeDuck(
      String(gameManager.currentHuntNb - 1),
      gameManager.praySpeed
    );
    duck.setBehavior();
  });
  const huntEndController = gameManager.onStateEnter("hunt-end", () => {
    const bestScore = Number(k.getData("high-score"));
    if (gameManager.currentScore > bestScore) {
      k.setData("high-score", String(gameManager.currentScore));
    }

    if (gameManager.currentHuntNb <= 9) {
      gameManager.enterState("hunt-start");
      return;
    }

    gameManager.currentHuntNb = 0;
    gameManager.enterState("round-end");
  });

  const duckHuntedController = gameManager.onStateEnter("duck-hunted", () => {
    gameManager.nbBulletsLeft = 3;
    dog.catchFallenDuck();
  });
  const duckEscapedController = gameManager.onStateEnter("duck-escaped", () => {
    dog.mockPlayer();
  });

  k.onClick(() => {
    if (gameManager.state === "hunt-start" && !gameManager.isGamePaused) {
      if (gameManager.nbBulletsLeft > 0) k.play("gun-shot", { volume: 0.7 });
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

  k.onSceneLeave(() => {
    roundStartController.cancel();
    roundEndController.cancel();
    huntStartController.cancel();
    huntEndController.cancel();
    duckHuntedController.cancel();
    duckEscapedController.cancel();
    gameManager.resetGameState();
    gameMusic.stop();
  });
});

// Game over scene
k.scene("game-over", () => {
  k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLACK)]);
  k.add([
    k.text("GAME OVER!", FONT_CONFIG.NES_FONT),
    k.anchor("center"),
    k.pos(k.center()),
  ]);

  k.wait(2, () => {
    if (Number(k.getData("high-score")) < gameManager.currentScore)
      k.go("leaderboard");
    else k.go("main-menu");
  });
});

k.scene("leaderboard", () => {
  k.add([k.rect(k.width(), k.height()), k.color(COLORS.BLACK)]);
  k.add([
    k.text("ENTER YOUR NAME:", FONT_CONFIG.NES_FONT),
    k.anchor("center"),
    k.pos(k.center()),
  ]);

  let name = k.add([
    k.text("", FONT_CONFIG.NES_FONT),
    k.anchor("center"),
    k.pos(k.center().x, k.center().y + 40),
    k.textInput(true, 3),
  ]);

  k.onClick(() => {
    if (Number(k.getData("high-score")) < gameManager.currentScore)
      k.setData("name", name.text);
    k.go("main-menu");
  });
});

k.go("main-menu");
