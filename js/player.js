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
    this.health = 100;
    this.maxHealth = 100;
    this.stamina = 100;
    this.maxStamina = 100;
    this.attackCooldown = 0;
    this.attackSwing = 0;
    this.jumpBuffer = 0;
    this.isAttacking = false;
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
  }

  update(dt, input, world) {
    const moveX = (input.right ? 1 : 0) - (input.left ? 1 : 0);
    const running = input.run && this.stamina > 0;
    this.isRunning = running;

    if (moveX !== 0) {
      this.facing = moveX;
    }

    const targetSpeed = running ? this.runSpeed : this.speed;
    this.vx = moveX * targetSpeed;

    if (input.jump && this.onGround) {
      this.vy = -this.jumpForce;
      this.onGround = false;
    }

    if (this.attackCooldown > 0) this.attackCooldown -= dt;
    if (this.attackSwing > 0) this.attackSwing -= dt;
    this.isAttacking = this.attackSwing > 0;

    if (running && moveX !== 0) {
      this.stamina = Math.max(0, this.stamina - 25 * dt);
    } else {
      this.stamina = Math.min(this.maxStamina, this.stamina + 18 * dt);
    }

    this.vy += this.gravity * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    const groundY = world.groundY ?? 620;
    if (this.y + this.height >= groundY) {
      this.y = groundY - this.height;
      this.vy = 0;
      this.onGround = true;
    } else {
      this.onGround = false;
    }

    if (this.x < 40) this.x = 40;
    if (this.x > world.width - 60) this.x = world.width - 60;

    if (this.y > world.height + 200) {
      this.health = 0;
    }
  }

  attack(enemies, game) {
    if (this.attackCooldown > 0) return;
    this.attackCooldown = 0.45;
    this.attackSwing = 0.18;
    this.isAttacking = true;

    const range = 70;
    const attackX = this.x + this.facing * 42;

    for (const enemy of enemies) {
      if (!enemy.alive) continue;
      const dx = enemy.x - attackX;
      const dy = Math.abs(enemy.y - this.y);
      if (Math.abs(dx) <= range && dy < 60) {
        enemy.takeDamage(18, this.facing);
        game.showNotification(`Hit ${enemy.name}!`);
        if (!enemy.alive) {
          game.addXp?.(enemy.reward || 10);
        }
      }
    }
  }

  draw(ctx, cameraX) {
    const screenX = this.x - cameraX;
    const color = '#f1c27d';
    ctx.fillStyle = '#1a2333';
    ctx.fillRect(screenX, this.y, this.width, this.height);

    ctx.fillStyle = color;
    ctx.fillRect(screenX + 5, this.y + 6, this.width - 10, this.height - 12);

    if (this.facing < 0) {
      ctx.fillStyle = '#0c1220';
      ctx.fillRect(screenX + 4, this.y + 18, 7, 7);
      ctx.fillRect(screenX + 19, this.y + 18, 7, 7);
    } else {
      ctx.fillStyle = '#0c1220';
      ctx.fillRect(screenX + 19, this.y + 18, 7, 7);
      ctx.fillRect(screenX + 4, this.y + 18, 7, 7);
    }

    if (this.isAttacking) {
      ctx.fillStyle = 'rgba(255, 200, 120, 0.4)';
      const swingX = this.x + this.facing * 48 - cameraX;
      ctx.fillRect(swingX, this.y + 10, 28, 28);
    }
  }
}
