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
        this.speedX = this.game.settings.mandarinSpeed;
        this.speedY = 0;
        
        // Состояние
        this.isMovingToPoint = false;
        this.isDropping = false;
        this.targetX = 0;
        this.targetY = 0;
        this.callback = null;
        
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
                console.log(`Мандаринка достигла перекрестка и начинает падение к черту ${this.targetDevilIndex}`);
            } else {
                // Движение к перекрестку
                this.x += Math.sign(dx) * this.speedX;
            }
        }
        // Если мандаринка падает
        else if (this.isDropping) {
            // Движение вниз
            this.y += this.speedX;
            
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
            this.x += this.speedX;
            
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

    // Метод для перемещения мандаринки к указанной точке
    moveToPoint(targetX, targetY, callback) {
        // Если мандаринка уже находится в точке назначения, сразу вызываем callback
        if (Math.abs(this.x - targetX) < 5 && Math.abs(this.y - targetY) < 5) {
            this.x = targetX;
            this.y = targetY;
            if (callback) callback();
            return;
        }
        
        // Сохраняем текущее состояние движения
        this.originalPath = {
            x: this.x,
            y: this.y,
            speedX: this.speedX,
            speedY: this.speedY
        };
        
        // Устанавливаем новую цель
        this.targetX = targetX;
        this.targetY = targetY;
        this.callback = callback;
        
        // Останавливаем движение по конвейеру
        this.speedX = 0;
        
        // Устанавливаем флаг, что мандаринка движется к точке
        this.isMovingToPoint = true;
        
        console.log(`Мандаринка ${this.type} начала движение к точке (${targetX}, ${targetY})`);
    }

    // Метод для обновления движения к точке
    updateMovementToPoint(deltaTime) {
        if (!this.isMovingToPoint) return;
        
        // Вычисляем направление к цели
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если мандаринка достигла цели
        if (distance < 5) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isMovingToPoint = false;
            
            console.log(`Мандаринка ${this.type} достигла точки (${this.targetX}, ${this.targetY})`);
            
            // Вызываем callback, если он есть
            if (this.callback) {
                const callbackToExecute = this.callback;
                this.callback = null; // Очищаем callback перед вызовом, чтобы избежать повторного вызова
                callbackToExecute();
            }
            
            return;
        }
        
        // Вычисляем скорость движения к цели
        const speed = this.game.settings.mandarinSpeed; // Используем ту же скорость, что и при обычном движении
        const moveX = (dx / distance) * speed;
        const moveY = (dy / distance) * speed;
        
        // Перемещаем мандаринку
        this.x += moveX;
        this.y += moveY;
    }

    // Метод для падения мандаринки к черту
    dropTo(targetX, targetY, callback) {
        // Сохраняем текущее состояние движения
        this.originalPath = {
            x: this.x,
            y: this.y,
            speedX: this.speedX,
            speedY: this.speedY
        };
        
        // Устанавливаем новую цель
        this.targetX = targetX;
        this.targetY = targetY;
        this.callback = callback;
        
        // Останавливаем движение по конвейеру
        this.speedX = 0;
        this.speedY = 0;
        
        // Устанавливаем флаг, что мандаринка падает
        this.isDropping = true;
        
        // Устанавливаем начальную скорость падения
        this.dropSpeedY = 0;
        this.gravity = 0.2;
        
        console.log(`Мандаринка ${this.type} начала падение к точке (${targetX}, ${targetY})`);
    }

    // Метод для обновления падения
    updateDropping(deltaTime) {
        if (!this.isDropping) return;
        
        // Вычисляем направление к цели
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Если мандаринка достигла цели
        if (distance < 5) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.isDropping = false;
            
            console.log(`Мандаринка ${this.type} достигла точки (${this.targetX}, ${this.targetY})`);
            
            // Вызываем callback, если он есть
            if (this.callback) {
                const callbackToExecute = this.callback;
                this.callback = null; // Очищаем callback перед вызовом, чтобы избежать повторного вызова
                callbackToExecute();
            }
            
            return;
        }
        
        // Увеличиваем скорость падения (гравитация)
        this.dropSpeedY += this.gravity;
        
        // Вычисляем скорость движения к цели по X
        const speed = this.game.settings.mandarinSpeed;
        const moveX = (dx / distance) * speed;
        
        // Перемещаем мандаринку
        this.x += moveX;
        this.y += this.dropSpeedY;
    }

    // Обновляем метод update для вызова новых методов
    update(deltaTime) {
        // Если мандаринка движется к точке
        if (this.isMovingToPoint) {
            this.updateMovementToPoint(deltaTime);
            return;
        }
        
        // Если мандаринка падает
        if (this.isDropping) {
            this.updateDropping(deltaTime);
            return;
        }
        
        // Обычное движение по конвейеру
        this.x += this.speedX;
        this.y += this.speedY;
        
        // Проверка выхода за границы экрана
        if (this.x > this.game.dom.canvas.width + this.width) {
            // Удаляем мандаринку, если она вышла за правую границу
            const index = this.game.mandarins.indexOf(this);
            if (index !== -1) {
                this.game.mandarins.splice(index, 1);
                this.game.state.wrongMandarins++;
            }
        }
    }
} 