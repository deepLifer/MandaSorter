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
        
        // Убираем сообщение о создании мандаринки
        // console.log(`Создана мандаринка типа ${this.type} на позиции (${this.x}, ${this.y})`);
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
                console.log(`Мандаринка достигла перекрестка и начинает падение к черту ${this.targetDevilIndex}`);
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
                
                if (!devil) {
                    console.error(`Черт с индексом ${this.targetDevilIndex} не найден`);
                    return false; // Удаляем мандаринку
                }
                
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
                // Убираем сообщение о выходе за пределы экрана
                // console.log(`Мандаринка вышла за пределы экрана и будет удалена`);
                return false; // Удаляем мандаринку
            }
        }
        // Обычное движение по конвейеру
        else {
            // Движение вправо
            this.x += this.speed;
            
            // Проверка выхода за пределы экрана
            if (this.x > this.game.dom.canvas.width) {
                // Убираем сообщение о выходе за правый край экрана
                // console.log(`Мандаринка вышла за правый край экрана и будет удалена`);
                return false; // Удаляем мандаринку
            }
        }
        
        return true; // Мандаринка остается активной
    }
    
    draw(ctx) {
        // Отрисовка мандаринки
        if (this.image && this.image.complete) {
            ctx.drawImage(
                this.image,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Запасной вариант - рисуем цветной круг
            ctx.fillStyle = this.type === 'orange' ? '#FFA500' : '#00FF00';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.width / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    drop(crossroadIndex) {
        // Если мандаринка уже падает или движется к перекрестку, ничего не делаем
        if (this.isDropping || this.isMovingToCrossroad) {
            return false;
        }
        
        // Получаем перекресток
        const crossroad = this.game.conveyor.crossroads[crossroadIndex];
        if (!crossroad) {
            return false;
        }
        
        // Получаем соответствующего черта
        const devil = this.game.devils[crossroadIndex];
        if (!devil) {
            return false;
        }
        
        // Проверяем, не проехала ли мандаринка перекресток
        const distanceToCrossroad = crossroad.x - this.x;
        
        // Мандаринка может повернуть к перекрестку, если она:
        // 1. Еще не доехала до перекрестка (distanceToCrossroad > 0)
        // 2. Проехала перекресток, но не слишком далеко (distanceToCrossroad < 0 && Math.abs(distanceToCrossroad) < maxAllowedDistance)
        const maxAllowedDistance = this.width * 2; // Увеличиваем допустимое расстояние
        
        if (distanceToCrossroad > 0 || (distanceToCrossroad < 0 && Math.abs(distanceToCrossroad) < maxAllowedDistance)) {
            // Мандаринка может повернуть к перекрестку
            this.isMovingToCrossroad = true;
            this.targetX = crossroad.x;
            this.targetDevilIndex = crossroadIndex;
            
            return true;
        } else {
            return false;
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