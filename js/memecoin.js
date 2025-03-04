// Класс для объектов мемкоинов, выпадающих из чертей
class Memecoin {
    constructor(game, x, y, name) {
        this.game = game;
        this.x = x;
        this.y = y;
        this.name = name;
        
        // Размеры объекта
        this.width = 40;
        this.height = 40;
        
        // Физика падения
        this.fallSpeed = 2;
        this.bounceHeight = 20;
        this.bounceCount = 3;
        this.currentBounce = 0;
        this.isFalling = true;
        this.groundY = this.game.dom.canvas.height * 0.8; // Позиция "земли"
        
        // Флаг для отслеживания столкновения с нижней панелью
        this.hitPanel = false;
        
        // Анимация
        this.rotation = 0;
        this.rotationSpeed = 0.05;
        this.scale = 1;
        this.opacity = 1;
        this.fadeOutSpeed = 0.01;
        this.isFadingOut = false;
        this.lifeTime = 5000; // Время жизни в миллисекундах
        this.elapsedTime = 0;
        
        // Изображение
        this.image = this.game.resources.images.poop;
    }
    
    update(deltaTime) {
        // Обновление времени жизни
        this.elapsedTime += deltaTime;
        if (this.elapsedTime >= this.lifeTime) {
            this.isFadingOut = true;
        }
        
        // Обработка падения и отскоков
        if (this.isFalling) {
            this.y += this.fallSpeed;
            
            // Проверка достижения нижней панели
            const panelY = this.game.dom.canvas.height - this.game.dom.canvas.height * 0.15;
            
            if (this.y >= panelY - this.height / 2 && !this.hitPanel) {
                // Мемкоин достиг нижней панели
                this.hitPanel = true;
                
                // Обновляем текущий токен в игре и запускаем анимацию тряски
                console.log("Мемкоин достиг панели:", this.name);
                this.game.setCurrentToken(this.name);
                
                // Продолжаем падение за панель
                this.fallSpeed = 1; // Замедляем падение за панелью
            }
            
            // Проверка выхода за пределы экрана
            if (this.y > this.game.dom.canvas.height + this.height) {
                console.log("Мемкоин вышел за пределы экрана");
                return false; // Удаляем мемкоин
            }
        } else if (this.currentBounce <= this.bounceCount) {
            // Подъем при отскоке
            const bounceStrength = this.bounceHeight / (this.currentBounce * 1.5);
            this.y -= this.fallSpeed * 0.8;
            
            if (this.y <= this.groundY - bounceStrength) {
                this.isFalling = true;
            }
        }
        
        // Вращение
        this.rotation += this.rotationSpeed;
        
        // Затухание только если мемкоин не достиг панели
        if (this.isFadingOut && !this.hitPanel) {
            this.opacity -= this.fadeOutSpeed;
            if (this.opacity <= 0) {
                this.opacity = 0;
                return false; // Объект удаляется
            }
        }
        
        return true; // Объект остается
    }
    
    draw(ctx) {
        ctx.save();
        
        // Применение прозрачности
        ctx.globalAlpha = this.opacity;
        
        // Если мемкоин достиг панели, рисуем его только если он выше нижней границы экрана
        if (this.hitPanel) {
            const panelY = this.game.dom.canvas.height - this.game.dom.canvas.height * 0.15;
            
            // Рисуем только часть мемкоина, которая видна над панелью
            if (this.y < panelY) {
                // Перемещение в позицию объекта
                ctx.translate(this.x, this.y);
                
                // Вращение
                ctx.rotate(this.rotation);
                
                // Отрисовка изображения
                if (this.image && this.image.complete) {
                    ctx.drawImage(
                        this.image,
                        -this.width / 2,
                        -this.height / 2,
                        this.width,
                        this.height
                    );
                } else {
                    // Запасной вариант - рисуем коричневый круг
                    ctx.fillStyle = '#8B4513';
                    ctx.beginPath();
                    ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                    ctx.fill();
                }
                
                // Отрисовка текста с названием мемкоина
                ctx.rotate(-this.rotation); // Отменяем вращение для текста
                ctx.fillStyle = '#FFFFFF';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                // Добавляем тень для лучшей читаемости
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 4;
                ctx.shadowOffsetX = 1;
                ctx.shadowOffsetY = 1;
                
                // Рисуем текст над объектом с символом $
                ctx.fillText(`$${this.name}`, 0, -this.height / 2 - 10);
            }
        } else {
            // Обычная отрисовка для мемкоинов, не достигших панели
            // Перемещение в позицию объекта
            ctx.translate(this.x, this.y);
            
            // Вращение
            ctx.rotate(this.rotation);
            
            // Отрисовка изображения
            if (this.image && this.image.complete) {
                ctx.drawImage(
                    this.image,
                    -this.width / 2,
                    -this.height / 2,
                    this.width,
                    this.height
                );
            } else {
                // Запасной вариант - рисуем коричневый круг
                ctx.fillStyle = '#8B4513';
                ctx.beginPath();
                ctx.arc(0, 0, this.width / 2, 0, Math.PI * 2);
                ctx.fill();
            }
            
            // Отрисовка текста с названием мемкоина
            ctx.rotate(-this.rotation); // Отменяем вращение для текста
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Добавляем тень для лучшей читаемости
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 4;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // Рисуем текст над объектом с символом $
            ctx.fillText(`$${this.name}`, 0, -this.height / 2 - 10);
        }
        
        ctx.restore();
    }
} 