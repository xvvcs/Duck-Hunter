import k from "./kaplayCtx";

k.scene("main-menu", () => {
  k.setBackground(0, 0, 0);
});

k.scene("game", () => {});

k.scene("game-over", () => {});

k.go("main-menu");
