// Класс мандаринки
class Mandarin {
    constructor(game, type) {
        this.game = game;
        this.type = type; // 'orange' или 'green'
        
        // Позиция и размеры
        this.x = -50; // Начальная позиция за пределами экрана
        this.y = this.game.conveyor.y; // Позиция на конвейере
        this.width = 40;
        this.height = 40;
        
        // Скорость движения
        this.speed = this.game.settings.mandarinSpeed;
        
        // Состояние
        this.isDropping = false;
        this.isEaten = false; // Флаг, указывающий, что мандаринка съедена
        this.targetDevilIndex = undefined; // Индекс черта, к которому направляется мандаринка
        
        // Добавляем новые состояния
        this.isMovingToCrossroad = false;
        this.targetX = 0; // Целевая позиция X при движении к перекрестку
        
        // Изображение
        this.image = this.type === 'orange' 
            ? this.game.resources.images.orangeMandarin 
            : this.game.resources.images.greenMandarin;
        
        console.log(`Создана мандаринка типа ${this.type} на позиции (${this.x}, ${this.y})`);
    }
    
    update(deltaTime) {
        // Если мандаринка движется к перекрестку
        if (this.isMovingToCrossroad) {
            // Вычисляем направление движения
            const dx = this.targetX - this.x;
            const distance = Math.abs(dx);
            
            // Если мандаринка достигла перекрестка
            if (distance < 5) {
                this.x = this.targetX;
                this.isMovingToCrossroad = false;
                this.isDropping = true;
                console.log(`Мандаринка достигла перекрестка и начинает падение`);
            } else {
                // Движение к перекрестку
                this.x += Math.sign(dx) * this.speed;
            }
        }
        // Если мандаринка падает
        else if (this.isDropping) {
            // Движение вниз
            this.y += this.speed;
            
            // Проверка столкновения с чертом
            if (this.targetDevilIndex !== undefined) {
                const devil = this.game.devils[this.targetDevilIndex];
                
                // Проверяем, достигла ли мандаринка черта
                if (Math.abs(this.x - devil.x) < 50 && Math.abs(this.y - devil.y) < 50 && !this.isEaten) {
                    console.log(`Мандаринка достигла черта ${this.targetDevilIndex}`);
                    
                    // Проверка, может ли черт принять мандаринку
                    if (devil.canEat) {
                        // Проверка, правильная ли мандаринка
                        if (this.type === devil.desiredType) {
                            // Правильная мандаринка
                            devil.eat(this);
                            this.isEaten = true;
                            this.game.state.correctMandarins++;
                            this.game.state.score += 10;
                        } else {
                            // Неправильная мандаринка
                            devil.reject(this);
                            this.game.state.wrongMandarins++;
                        }
                        
                        // Обновление отображения
                        this.game.updateStatsDisplay();
                        return false; // Удаляем мандаринку
                    }
                }
            }
            
            // Проверка выхода за пределы экрана
            if (this.y > this.game.dom.canvas.height) {
                console.log(`Мандаринка вышла за пределы экрана и будет удалена`);
                return false; // Удаляем мандаринку
            }
        }
        // Обычное движение по конвейеру
        else {
            // Движение вправо
            this.x += this.speed;
            
            // Проверка выхода за пределы экрана
            if (this.x > this.game.dom.canvas.width) {
                console.log(`Мандаринка вышла за правый край экрана и будет удалена`);
                return false; // Удаляем мандаринку
            }
        }
        
        return true; // Мандаринка остается активной
    }
    
    draw(ctx) {
        if (!this.image || !this.image.complete) {
            // Если изображение не загружено, рисуем заглушку
            ctx.fillStyle = this.type === 'orange' ? '#FFA500' : '#00FF00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
            return;
        }
        
        // Отрисовка изображения
        ctx.drawImage(
            this.image,
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
        
        // Отладочная информация
        if (this.game.debug) {
            ctx.fillStyle = 'white';
            ctx.font = '10px Arial';
            ctx.fillText(`x: ${Math.round(this.x)}, y: ${Math.round(this.y)}`, this.x, this.y - 20);
            ctx.fillText(`type: ${this.type}`, this.x, this.y - 10);
        }
    }
    
    // Обновляем метод drop
    drop(crossroadIndex) {
        if (!this.isDropping && !this.isMovingToCrossroad) {
            const crossroad = this.game.conveyor.crossroads[crossroadIndex];
            
            // Проверяем, не проехала ли мандаринка перекресток
            const distancePassed = Math.abs(this.x - crossroad.x);
            const maxAllowedDistance = this.width / 2 + crossroad.width / 4;
            
            if (distancePassed <= maxAllowedDistance) {
                // Мандаринка достаточно близко к перекрестку
                this.isMovingToCrossroad = true;
                this.targetX = crossroad.x; // Используем targetX вместо targetCrossroadX
                this.targetDevilIndex = crossroadIndex;
                
                console.log(`Мандаринка начинает движение к перекрестку ${crossroadIndex} на позиции ${crossroad.x}`);
            }
            // Если мандаринка уже проехала перекресток, ничего не делаем
        }
    }
    
    createEffect(type) {
        // Создаем эффект в зависимости от типа (correct/wrong)
        const effect = {
            x: this.x,
            y: this.y,
            size: this.width * 2,
            alpha: 1,
            color: type === 'correct' ? '#00ff00' : '#ff0000',
            update: function(deltaTime) {
                this.size += deltaTime * 0.1;
                this.alpha -= deltaTime * 0.002;
                return this.alpha > 0;
            },
            draw: function(ctx) {
                ctx.globalAlpha = this.alpha;
                ctx.fillStyle = this.color;
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }
        };
        
        // Добавляем эффект в массив эффектов в игре
        this.game.effects.push(effect);
    }
    
    reachDevil() {
        // Получаем черта, к которому направляется мандаринка
        const devil = this.game.devils[this.targetDevilIndex];
        
        // Проверка, может ли черт принять мандаринку
        if (devil.canEat) {
            // Проверка, правильная ли мандаринка
            if (this.type === devil.desiredType) {
                // Правильная мандаринка
                this.createEffect('correct');
                devil.eat(this);
                this.game.state.correctMandarins++;
                this.game.state.score += 10;
            } else {
                // Неправильная мандаринка
                this.createEffect('wrong');
                devil.reject(this);
                this.game.state.wrongMandarins++;
            }
        } else {
            // Черт занят, отбрасывает мандаринку
            this.createEffect('wrong');
            devil.reject(this);
            this.game.state.wrongMandarins++;
        }
        
        // Обновление отображения
        this.game.updateStatsDisplay();
        
        // Удаление мандаринки из массива
        const index = this.game.mandarins.indexOf(this);
        if (index !== -1) {
            this.game.mandarins.splice(index, 1);
        }
    }
} 