export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 30;
    this.height = 50;
    this.vx = 0;
    this.vy = 0;
    this.speed = 240;
    this.runSpeed = 360;
    this.jumpForce = 570;
    this.gravity = 1200;
    this.onGround = false;
    this.facing = 1;
    this.direction = { x: 1, y: 0 };
    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.attackCooldown = 0;
    this.attackSwing = 0;
    this.jumpBuffer = 0;
    this.isAttacking = false;
    this.sprite = new Image();
    this.sprite.src = './assets/player.svg';
    this.isRunning = false;
    this.inventory = {
      healthPotion: 2,
      staminaPotion: 1,
      coins: 40,
      relics: 0
    };
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.health = 100;
    this.stamina = 100;
    this.onGround = false;
    this.attackCooldown = 0;
    this.attackSwing = 0;
    this.isAttacking = false;
    this.direction = { x: 1, y: 0 };
  }

  update(dt, input, world) {
    const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const moveY = (input.down ? 1 : 0) - (input.up ? 1 : 0);
    const running = input.run && this.stamina > 0;
    this.isRunning = running;

    const length = Math.hypot(moveX, moveY) || 1;
    const normalizedX = moveX / length;
    const normalizedY = moveY / length;
    if (moveX !== 0 || moveY !== 0) {
      this.direction = { x: normalizedX, y: normalizedY };
      if (moveX !== 0) this.facing = Math.sign(moveX);
    }

    const targetSpeed = running ? this.runSpeed : this.speed;
    this.vx = moveX * targetSpeed;

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.attackSwing > 0) this.attackSwing -= dt;
    this.isAttacking = this.attackSwing > 0;

    if (running && (moveX !== 0 || moveY !== 0)) {
      this.stamina = Math.max(0, this.stamina - 25 * dt);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + 18 * dt);
    }

    this.x += normalizedX * targetSpeed * dt;
    this.y += normalizedY * targetSpeed * dt;
    this.x = Math.max(40, Math.min(this.x, world.width - this.width - 40));
    this.y = Math.max(40, Math.min(this.y, world.height - this.height - 40));
  }

  attack(enemies, game) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 0.45;
    this.attackSwing = 0.18;
    this.isAttacking = true;

    const range = 70;
    const attackX = this.x + this.direction.x * 42;
    const attackY = this.y + this.direction.y * 42;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - attackX;
      const dy = enemy.y - attackY;
      if (Math.hypot(dx, dy) <= range) {
        enemy.takeDamage(18, this.direction.x || this.facing);
        game.showNotification(`Hit ${enemy.name}!`);
        if (!enemy.alive) {
          game.addXp?.(enemy.reward || 10);
        }
      }
    }
  }

  draw(ctx, cameraX, cameraY) {
    const screenX = this.x - cameraX;
    const screenY = this.y - cameraY;
    const color = '#f1c27d';
    if (this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.drawImage(this.sprite, screenX - 48, screenY - 44, 138, 160);
    } else {
    ctx.fillStyle = 'rgba(2, 6, 23, 0.35)';
    ctx.beginPath();
    ctx.ellipse(screenX + this.width / 2, screenY + this.height - 2, 20, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#1a2333';
    ctx.beginPath();
    ctx.arc(screenX + this.width / 2, screenY + this.height / 2, 18, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(screenX + this.width / 2, screenY + this.height / 2 - 3, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#0c1220';
    ctx.beginPath();
    ctx.arc(screenX + this.width / 2 + this.direction.x * 8, screenY + this.height / 2 - 6 + this.direction.y * 8, 3, 0, Math.PI * 2);
    ctx.fill();
    }

    if (this.isAttacking) {
      ctx.fillStyle = 'rgba(255, 200, 120, 0.4)';
      const swingX = screenX + this.width / 2 + this.direction.x * 42;
      const swingY = screenY + this.height / 2 + this.direction.y * 42;
      ctx.beginPath();
      ctx.arc(swingX, swingY, 16, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}
