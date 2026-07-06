
/* ==========================================================
   DeepGeet V5 - Particle Background
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  const particlesContainer = document.getElementById("particles");
  if (!particlesContainer) return;

  const canvas = document.createElement("canvas");
  canvas.id = "particleCanvas";
  canvas.style.position = "absolute";
  canvas.style.top = "0";
  canvas.style.left = "0";
  canvas.style.width = "100%";
  canvas.style.height = "100%";
  canvas.style.pointerEvents = "none";

  particlesContainer.appendChild(canvas);

  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  const mouse = {
    x: null,
    y: null,
    radius: 120
  };

  window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener("mouseout", () => {
    mouse.x = null;
    mouse.y = null;
  });

  class Particle {

    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height;
    }

    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + Math.random() * 20;

      this.size = Math.random() * 3 + 1;

      this.speedX = Math.random() * 0.6 - 0.3;
      this.speedY = Math.random() * 1.4 + 0.6;

      this.opacity = Math.random() * 0.5 + 0.2;

      this.color =
        Math.random() > 0.5
          ? "rgba(0,242,254,"
          : "rgba(255,0,127,";
    }

    update() {

      this.y -= this.speedY;
      this.x += this.speedX;

      if (mouse.x !== null) {

        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < mouse.radius) {

          const force = (mouse.radius - distance) / mouse.radius;

          this.x += (dx / distance) * force * 5;
          this.y += (dy / distance) * force * 5;
        }
      }

      if (
        this.y < -20 ||
        this.x < -20 ||
        this.x > canvas.width + 20
      ) {
        this.reset();
      }
    }

    draw() {

      ctx.save();

      ctx.beginPath();

      ctx.arc(
        this.x,
        this.y,
        this.size,
        0,
        Math.PI * 2
      );

      ctx.fillStyle = this.color + this.opacity + ")";

      ctx.shadowBlur = this.size * 3;

      ctx.shadowColor =
        this.color === "rgba(0,242,254,"
          ? "#00f2fe"
          : "#ff007f";

      ctx.fill();

      ctx.restore();
    }
  }

  const particles = [];

  for (let i = 0; i < 45; i++) {
    particles.push(new Particle());
  }

  function animate() {

    ctx.clearRect(
      0,
      0,
      canvas.width,
      canvas.height
    );

    particles.forEach(p => {
      p.update();
      p.draw();
    });

    requestAnimationFrame(animate);
  }

  animate();
});