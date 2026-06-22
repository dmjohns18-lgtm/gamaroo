"use client";
import { useEffect, useRef } from "react";

export default function RooAdventure() {
  const gameRef = useRef(null);

  useEffect(() => {
    let game;

    const loadPhaser = async () => {
      const Phaser = (await import("phaser")).default;

      // ─── CONFIG ───────────────────────────────────────────────────────────
      const W = 800;
      const H = 600;
      const ROO_SPEED = 160;

      const ZONES = [
        {
          id: "koala",
          x: 160,
          y: 130,
          animal: "Koala",
          emoji: "🐨",
          color: 0x7dd3fc,
          label: "Eucalyptus Tree",
          subject: "phonics",
          found: false,
        },
        {
          id: "wombat",
          x: 640,
          y: 150,
          animal: "Wombat",
          emoji: "🪨",
          color: 0xfbbf24,
          label: "Rock Formation",
          subject: "counting",
          found: false,
        },
        {
          id: "echidna",
          x: 150,
          y: 440,
          animal: "Echidna",
          emoji: "🌿",
          color: 0x86efac,
          label: "Spinifex Bush",
          subject: "shapes",
          found: false,
        },
        {
          id: "kookaburra",
          x: 640,
          y: 440,
          animal: "Kookaburra",
          emoji: "💧",
          color: 0x6ee7b7,
          label: "Billabong",
          subject: "sightwords",
          found: false,
        },
      ];

      // ─── CHALLENGES ───────────────────────────────────────────────────────
      const CHALLENGES = {
        phonics: [
          {
            question: "Which animal starts with the letter B?",
            answers: ["Bear", "Cat", "Duck", "Fish"],
            correct: 0,
          },
          {
            question: "Which word starts with the same sound as 'Sun'?",
            answers: ["Sand", "Moon", "Rock", "Tree"],
            correct: 0,
          },
          {
            question: "What letter does 'Koala' start with?",
            answers: ["K", "C", "G", "Q"],
            correct: 0,
          },
        ],
        counting: [
          { question: "Count the stars! How many are there?", count: 5 },
          { question: "Count the stars! How many are there?", count: 7 },
          { question: "Count the stars! How many are there?", count: 3 },
        ],
        shapes: [
          {
            question: "Which shape has 3 sides?",
            answers: ["Triangle", "Square", "Circle", "Rectangle"],
            correct: 0,
          },
          {
            question: "Which shape is round?",
            answers: ["Circle", "Square", "Triangle", "Rectangle"],
            correct: 0,
          },
          {
            question: "Which shape has 4 equal sides?",
            answers: ["Square", "Triangle", "Circle", "Oval"],
            correct: 0,
          },
        ],
        sightwords: [
          {
            question: "Roo says: 'I ___ a kangaroo!' Tap the missing word.",
            answers: ["am", "is", "are", "be"],
            correct: 0,
          },
          {
            question: "Which word means the same as 'look'?",
            answers: ["see", "run", "jump", "hop"],
            correct: 0,
          },
          {
            question: "Tap the word that means more than one.",
            answers: ["they", "he", "I", "she"],
            correct: 0,
          },
        ],
      };

      // ─── SPEECH ───────────────────────────────────────────────────────────
      const speak = (text, rate = 0.85) => {
        if (!window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.pitch = 1.2;
        const voices = window.speechSynthesis.getVoices();
        const preferred = voices.find(
          (v) => v.name.includes("Samantha") || v.name.includes("Google US English Female")
        );
        if (preferred) u.voice = preferred;
        window.speechSynthesis.speak(u);
      };

      // ─── MAIN SCENE ───────────────────────────────────────────────────────
      class OutbackScene extends Phaser.Scene {
        constructor() {
          super("OutbackScene");
          this.roo = null;
          this.cursors = null;
          this.wasd = null;
          this.zones = [];
          this.foundCount = 0;
          this.challengeActive = false;
          this.overlayElements = [];
          this.friendSprites = [];
          this.dpadButtons = {};
          this.dpadState = { up: false, down: false, left: false, right: false };
        }

        preload() {
          this.load.image("roo", "/roo-mascot.png");
        }

        create() {
          // ── Background ──
          this.drawBackground();

          // ── Zone landmarks ──
          this.zones = ZONES.map((z) => {
            const gfx = this.add.graphics();
            gfx.fillStyle(z.color, 0.25);
            gfx.fillCircle(z.x, z.y, 55);
            gfx.lineStyle(3, z.color, 0.8);
            gfx.strokeCircle(z.x, z.y, 55);

            const label = this.add
              .text(z.x, z.y + 68, z.label, {
                fontSize: "11px",
                color: "#5c3d1e",
                fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
                align: "center",
              })
              .setOrigin(0.5);

            const emoji = this.add
              .text(z.x, z.y, z.emoji, { fontSize: "32px" })
              .setOrigin(0.5);

            return { ...z, gfx, label, emoji, pulse: 0 };
          });

          // ── Home base ──
          const homeGfx = this.add.graphics();
          homeGfx.fillStyle(0xf97316, 0.15);
          homeGfx.fillCircle(W / 2, H / 2, 48);
          homeGfx.lineStyle(3, 0xf97316, 0.6);
          homeGfx.strokeCircle(W / 2, H / 2, 48);
          this.add
            .text(W / 2, H / 2 + 58, "Roo's Home", {
              fontSize: "11px",
              color: "#92400e",
              fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
            })
            .setOrigin(0.5);

          // ── Roo sprite ──
          this.roo = this.add.image(W / 2, H / 2, "roo").setDisplaySize(64, 80);

          // ── Input ──
          this.cursors = this.input.keyboard.createCursorKeys();
          this.wasd = this.input.keyboard.addKeys({
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
          });

          // ── D-pad ──
          this.createDpad();

          // ── Counter ──
          this.counterText = this.add
            .text(16, 16, "Friends found: 0 / 4", {
              fontSize: "14px",
              color: "#7c2d12",
              fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
              backgroundColor: "#fef3c7",
              padding: { x: 10, y: 6 },
            })
            .setDepth(10);

          // ── Intro speech ──
          setTimeout(() => {
            speak(
              "Hi! I'm Roo! My friends are hiding in the outback. Can you help me find them? Move me around to explore!"
            );
          }, 600);
        }

        drawBackground() {
          const bg = this.add.graphics();

          // Sky
          bg.fillStyle(0xfde68a, 1);
          bg.fillRect(0, 0, W, H);

          // Ground
          bg.fillStyle(0xe07a36, 0.3);
          bg.fillRect(0, H * 0.55, W, H * 0.45);

          // Paths (dirt trails)
          bg.fillStyle(0xc2693a, 0.25);
          bg.fillRect(W / 2 - 18, 0, 36, H);
          bg.fillRect(0, H / 2 - 18, W, 36);

          // Eucalyptus tree (top-left)
          bg.fillStyle(0x4ade80, 0.5);
          bg.fillEllipse(155, 100, 80, 60);
          bg.fillStyle(0x6b4c2a, 1);
          bg.fillRect(148, 100, 14, 50);

          // Rock formation (top-right)
          bg.fillStyle(0xa8a29e, 0.7);
          bg.fillEllipse(640, 130, 90, 50);
          bg.fillEllipse(660, 148, 60, 35);

          // Spinifex bush (bottom-left)
          bg.fillStyle(0x84cc16, 0.5);
          bg.fillEllipse(150, 450, 70, 40);
          bg.fillEllipse(135, 458, 40, 30);
          bg.fillEllipse(168, 455, 45, 28);

          // Billabong (bottom-right)
          bg.fillStyle(0x38bdf8, 0.45);
          bg.fillEllipse(640, 455, 100, 55);
        }

        createDpad() {
          const bx = 100;
          const by = H - 90;
          const size = 44;
          const gap = 48;
          const dirs = [
            { key: "up", dx: 0, dy: -gap, icon: "▲" },
            { key: "down", dx: 0, dy: gap, icon: "▼" },
            { key: "left", dx: -gap, dy: 0, icon: "◀" },
            { key: "right", dx: gap, dy: 0, icon: "▶" },
          ];

          dirs.forEach(({ key, dx, dy, icon }) => {
            const btn = this.add
              .text(bx + dx, by + dy, icon, {
                fontSize: "22px",
                color: "#7c2d12",
                backgroundColor: "#fef3c7cc",
                padding: { x: 10, y: 6 },
                fontFamily: "Arial",
              })
              .setOrigin(0.5)
              .setInteractive({ useHandCursor: true })
              .setDepth(20)
              .setAlpha(0.85);

            btn.on("pointerdown", () => {
              this.dpadState[key] = true;
            });
            btn.on("pointerup", () => {
              this.dpadState[key] = false;
            });
            btn.on("pointerout", () => {
              this.dpadState[key] = false;
            });

            this.dpadButtons[key] = btn;
          });
        }

        update() {
          if (this.challengeActive) return;

          const up =
            this.cursors.up.isDown ||
            this.wasd.up.isDown ||
            this.dpadState.up;
          const down =
            this.cursors.down.isDown ||
            this.wasd.down.isDown ||
            this.dpadState.down;
          const left =
            this.cursors.left.isDown ||
            this.wasd.left.isDown ||
            this.dpadState.left;
          const right =
            this.cursors.right.isDown ||
            this.wasd.right.isDown ||
            this.dpadState.right;

          let vx = 0;
          let vy = 0;
          if (left) vx = -ROO_SPEED;
          if (right) vx = ROO_SPEED;
          if (up) vy = -ROO_SPEED;
          if (down) vy = ROO_SPEED;

          // Normalize diagonal
          if (vx !== 0 && vy !== 0) {
            vx *= 0.707;
            vy *= 0.707;
          }

          this.roo.x = Phaser.Math.Clamp(
            this.roo.x + (vx * this.game.loop.delta) / 1000,
            30,
            W - 30
          );
          this.roo.y = Phaser.Math.Clamp(
            this.roo.y + (vy * this.game.loop.delta) / 1000,
            30,
            H - 80
          );

          // Flip sprite based on direction
          if (vx < 0) this.roo.setFlipX(true);
          if (vx > 0) this.roo.setFlipX(false);

          // Check zone proximity
          this.zones.forEach((zone) => {
            if (zone.found) return;
            const dist = Phaser.Math.Distance.Between(
              this.roo.x,
              this.roo.y,
              zone.x,
              zone.y
            );
            if (dist < 60) {
              this.startChallenge(zone);
            }
          });
        }

        startChallenge(zone) {
          this.challengeActive = true;
          const subject = zone.subject;
          const pool = CHALLENGES[subject];
          const challenge = Phaser.Utils.Array.GetRandom(pool);

          speak(`You found the ${zone.label}! Let's help ${zone.animal}!`);

          if (subject === "counting") {
            this.showCountingChallenge(zone, challenge);
          } else {
            this.showTapChallenge(zone, challenge);
          }
        }

        showTapChallenge(zone, challenge) {
          const elements = [];

          // Dim overlay
          const overlay = this.add.graphics().setDepth(30);
          overlay.fillStyle(0x000000, 0.45);
          overlay.fillRect(0, 0, W, H);
          elements.push(overlay);

          // Card
          const card = this.add.graphics().setDepth(31);
          card.fillStyle(0xfffbeb, 1);
          card.fillRoundedRect(W / 2 - 240, H / 2 - 180, 480, 360, 20);
          card.lineStyle(3, zone.color, 1);
          card.strokeRoundedRect(W / 2 - 240, H / 2 - 180, 480, 360, 20);
          elements.push(card);

          // Animal emoji header
          const header = this.add
            .text(W / 2, H / 2 - 148, `${zone.emoji} Help ${zone.animal}!`, {
              fontSize: "20px",
              color: "#92400e",
              fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
            })
            .setOrigin(0.5)
            .setDepth(32);
          elements.push(header);

          // Question
          const q = this.add
            .text(W / 2, H / 2 - 100, challenge.question, {
              fontSize: "16px",
              color: "#1c1917",
              fontFamily: "Arial, sans-serif",
              wordWrap: { width: 420 },
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(32);
          elements.push(q);

          // Answer buttons (2x2 grid)
          const btnW = 200;
          const btnH = 52;
          const positions = [
            { x: W / 2 - 110, y: H / 2 - 20 },
            { x: W / 2 + 110, y: H / 2 - 20 },
            { x: W / 2 - 110, y: H / 2 + 50 },
            { x: W / 2 + 110, y: H / 2 + 50 },
          ];

          const colors = [0x7dd3fc, 0x86efac, 0xfbbf24, 0xf9a8d4];

          challenge.answers.forEach((ans, i) => {
            const pos = positions[i];
            const btnGfx = this.add.graphics().setDepth(32);
            btnGfx.fillStyle(colors[i], 1);
            btnGfx.fillRoundedRect(
              pos.x - btnW / 2,
              pos.y - btnH / 2,
              btnW,
              btnH,
              12
            );
            elements.push(btnGfx);

            const btnText = this.add
              .text(pos.x, pos.y, ans, {
                fontSize: "17px",
                color: "#1c1917",
                fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
              })
              .setOrigin(0.5)
              .setDepth(33)
              .setInteractive({
                hitArea: new Phaser.Geom.Rectangle(
                  -btnW / 2,
                  -btnH / 2,
                  btnW,
                  btnH
                ),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                useHandCursor: true,
              });

            btnText.on("pointerdown", () => {
              this.clearOverlay(elements);
              if (i === challenge.correct) {
                this.onCorrect(zone);
              } else {
                this.onWrong(zone, challenge);
              }
            });

            elements.push(btnText);
          });

          this.overlayElements = elements;
          speak(challenge.question);
        }

        showCountingChallenge(zone, challenge) {
          const elements = [];
          const count = challenge.count;

          // Dim overlay
          const overlay = this.add.graphics().setDepth(30);
          overlay.fillStyle(0x000000, 0.45);
          overlay.fillRect(0, 0, W, H);
          elements.push(overlay);

          // Card
          const card = this.add.graphics().setDepth(31);
          card.fillStyle(0xfffbeb, 1);
          card.fillRoundedRect(W / 2 - 240, H / 2 - 200, 480, 400, 20);
          card.lineStyle(3, zone.color, 1);
          card.strokeRoundedRect(W / 2 - 240, H / 2 - 200, 480, 400, 20);
          elements.push(card);

          const header = this.add
            .text(W / 2, H / 2 - 168, `${zone.emoji} Help ${zone.animal}!`, {
              fontSize: "20px",
              color: "#92400e",
              fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
            })
            .setOrigin(0.5)
            .setDepth(32);
          elements.push(header);

          const q = this.add
            .text(W / 2, H / 2 - 125, challenge.question, {
              fontSize: "16px",
              color: "#1c1917",
              fontFamily: "Arial, sans-serif",
              align: "center",
            })
            .setOrigin(0.5)
            .setDepth(32);
          elements.push(q);

          // Stars to count
          const starRow = [];
          const startX = W / 2 - ((count - 1) * 44) / 2;
          for (let i = 0; i < count; i++) {
            const star = this.add
              .text(startX + i * 44, H / 2 - 60, "⭐", { fontSize: "30px" })
              .setOrigin(0.5)
              .setDepth(32);
            elements.push(star);
            starRow.push(star);
          }

          // Number answer buttons
          const wrong1 = count === 1 ? 2 : count - 1;
          const wrong2 = count === 10 ? 9 : count + 1;
          const wrong3 = count <= 2 ? count + 2 : count - 2;
          const options = Phaser.Utils.Array.Shuffle([
            count,
            wrong1,
            wrong2,
            wrong3,
          ]);
          const correctIdx = options.indexOf(count);

          const positions = [
            { x: W / 2 - 150, y: H / 2 + 60 },
            { x: W / 2 - 50, y: H / 2 + 60 },
            { x: W / 2 + 50, y: H / 2 + 60 },
            { x: W / 2 + 150, y: H / 2 + 60 },
          ];
          const colors = [0x7dd3fc, 0x86efac, 0xfbbf24, 0xf9a8d4];

          options.forEach((num, i) => {
            const pos = positions[i];
            const btnGfx = this.add.graphics().setDepth(32);
            btnGfx.fillStyle(colors[i], 1);
            btnGfx.fillRoundedRect(pos.x - 38, pos.y - 28, 76, 56, 12);
            elements.push(btnGfx);

            const numText = this.add
              .text(pos.x, pos.y, String(num), {
                fontSize: "26px",
                fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
                color: "#1c1917",
              })
              .setOrigin(0.5)
              .setDepth(33)
              .setInteractive({
                hitArea: new Phaser.Geom.Rectangle(-38, -28, 76, 56),
                hitAreaCallback: Phaser.Geom.Rectangle.Contains,
                useHandCursor: true,
              });

            numText.on("pointerdown", () => {
              this.clearOverlay(elements);
              if (i === correctIdx) {
                this.onCorrect(zone);
              } else {
                this.onWrong(zone, challenge);
              }
            });

            elements.push(numText);
          });

          this.overlayElements = elements;
          speak(challenge.question);
        }

        clearOverlay(elements) {
          elements.forEach((el) => el.destroy());
          this.overlayElements = [];
        }

        onCorrect(zone) {
          // Mark zone found
          const zoneData = this.zones.find((z) => z.id === zone.id);
          if (zoneData) zoneData.found = true;
          this.foundCount++;

          // Update zone visually
          zone.gfx.clear();
          zone.gfx.fillStyle(0x86efac, 0.5);
          zone.gfx.fillCircle(zone.x, zone.y, 55);
          zone.gfx.lineStyle(3, 0x16a34a, 1);
          zone.gfx.strokeCircle(zone.x, zone.y, 55);

          // Checkmark
          this.add
            .text(zone.x, zone.y - 12, "✓", {
              fontSize: "28px",
              color: "#15803d",
            })
            .setOrigin(0.5)
            .setDepth(5);

          // Update counter
          this.counterText.setText(`Friends found: ${this.foundCount} / 4`);

          // Speech
          const lines = [
            `Amazing! You found ${zone.animal}! Great job!`,
            `Wonderful! ${zone.animal} is safe now! You are so smart!`,
            `Hooray! ${zone.animal} says thank you! Keep going!`,
            `Yes! ${zone.animal} is coming home! You are a great helper!`,
          ];
          speak(lines[this.foundCount - 1] || `You found ${zone.animal}!`);

          // Celebration burst
          this.showStarBurst(zone.x, zone.y);

          setTimeout(() => {
            this.challengeActive = false;
            if (this.foundCount === 4) {
              setTimeout(() => this.showWinScreen(), 800);
            }
          }, 1200);
        }

        onWrong(zone, challenge) {
          speak("Hmm, try again! You can do it!");

          // Flash red briefly then re-show challenge
          const flash = this.add.graphics().setDepth(35);
          flash.fillStyle(0xff4444, 0.2);
          flash.fillRect(0, 0, W, H);
          this.time.delayedCall(400, () => {
            flash.destroy();
            if (zone.subject === "counting") {
              this.showCountingChallenge(zone, challenge);
            } else {
              this.showTapChallenge(zone, challenge);
            }
          });
        }

        showStarBurst(cx, cy) {
          for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const star = this.add
              .text(cx, cy, "⭐", { fontSize: "20px" })
              .setOrigin(0.5)
              .setDepth(40);
            this.tweens.add({
              targets: star,
              x: cx + Math.cos(angle) * 70,
              y: cy + Math.sin(angle) * 70,
              alpha: 0,
              duration: 700,
              ease: "Power2",
              onComplete: () => star.destroy(),
            });
          }
        }

        showWinScreen() {
          this.challengeActive = true;

          const overlay = this.add.graphics().setDepth(50);
          overlay.fillStyle(0x000000, 0.55);
          overlay.fillRect(0, 0, W, H);

          const card = this.add.graphics().setDepth(51);
          card.fillStyle(0xfffbeb, 1);
          card.fillRoundedRect(W / 2 - 240, H / 2 - 180, 480, 360, 24);
          card.lineStyle(4, 0xf97316, 1);
          card.strokeRoundedRect(W / 2 - 240, H / 2 - 180, 480, 360, 24);

          this.add
            .text(W / 2, H / 2 - 120, "🎉", { fontSize: "60px" })
            .setOrigin(0.5)
            .setDepth(52);

          this.add
            .text(W / 2, H / 2 - 40, "You did it!", {
              fontSize: "34px",
              color: "#92400e",
              fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
            })
            .setOrigin(0.5)
            .setDepth(52);

          this.add
            .text(
              W / 2,
              H / 2 + 20,
              "All of Roo's friends\nare safe at home!",
              {
                fontSize: "18px",
                color: "#78350f",
                fontFamily: "Arial, sans-serif",
                align: "center",
              }
            )
            .setOrigin(0.5)
            .setDepth(52);

          // Star burst celebration
          for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const star = this.add
              .text(W / 2, H / 2, "⭐", { fontSize: "22px" })
              .setOrigin(0.5)
              .setDepth(53);
            this.tweens.add({
              targets: star,
              x: W / 2 + Math.cos(angle) * 200,
              y: H / 2 + Math.sin(angle) * 160,
              alpha: 0,
              duration: 1200,
              ease: "Power2",
              delay: i * 60,
              onComplete: () => star.destroy(),
            });
          }

          // Play again
          const playAgainGfx = this.add.graphics().setDepth(52);
          playAgainGfx.fillStyle(0xf97316, 1);
          playAgainGfx.fillRoundedRect(W / 2 - 110, H / 2 + 80, 220, 52, 14);

          const playAgainBtn = this.add
            .text(W / 2, H / 2 + 106, "Play Again!", {
              fontSize: "20px",
              color: "#fff",
              fontFamily: "Arial Rounded MT Bold, Arial, sans-serif",
            })
            .setOrigin(0.5)
            .setDepth(53)
            .setInteractive({ useHandCursor: true });

          playAgainBtn.on("pointerdown", () => {
            window.speechSynthesis.cancel();
            this.scene.restart();
            // Reset zone found state
            ZONES.forEach((z) => (z.found = false));
          });

          speak(
            "Amazing work! You found all of Roo's friends! You are a superstar! Want to play again?"
          );
        }
      }

      // ─── PHASER GAME ──────────────────────────────────────────────────────
      game = new Phaser.Game({
        type: Phaser.AUTO,
        width: W,
        height: H,
        backgroundColor: "#fde68a",
        parent: gameRef.current,
        scene: [OutbackScene],
        scale: {
          mode: Phaser.Scale.FIT,
          autoCenter: Phaser.Scale.CENTER_BOTH,
        },
      });
    };

    loadPhaser();

    return () => {
      window.speechSynthesis?.cancel();
      game?.destroy(true);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-amber-50">
      <div className="mb-3 text-center">
        <h1 className="text-2xl font-bold text-orange-800" style={{ fontFamily: "Arial Rounded MT Bold, Arial, sans-serif" }}>
          Roo's Outback Adventure
        </h1>
        <p className="text-sm text-orange-600 mt-1">
          Help Roo find her friends! Move with arrow keys or the on-screen buttons.
        </p>
      </div>
      <div ref={gameRef} className="rounded-2xl overflow-hidden shadow-lg" />
    </div>
  );
}
