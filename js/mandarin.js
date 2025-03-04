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
        
        // Состояние
        this.isDropping = false;
        this.dropSpeed = 5;
        this.targetDevilIndex = undefined; // Индекс черта, к которому направляется мандаринка
        
        // Добавляем новые состояния
        this.isMovingToCrossroad = false;
        this.targetCrossroadX = 0;
        
        // Изображение
        this.image = this.type === 'orange' 
            ? this.game.resources.images.orangeMandarin 
            : this.game.resources.images.greenMandarin;
    }
    
    update(deltaTime) {
        if (this.isMovingToCrossroad) {
            // Если мандаринка движется к центру перекрестка
            const moveSpeed = this.game.settings.mandarinSpeed;
            
            // Определяем направление движения
            if (this.x < this.targetCrossroadX) {
                this.x += moveSpeed;
                if (this.x >= this.targetCrossroadX) {
                    this.x = this.targetCrossroadX;
                    this.isMovingToCrossroad = false;
                    this.isDropping = true;
                }
            } else if (this.x > this.targetCrossroadX) {
                this.x -= moveSpeed;
                if (this.x <= this.targetCrossroadX) {
                    this.x = this.targetCrossroadX;
                    this.isMovingToCrossroad = false;
                    this.isDropping = true;
                }
            } else {
                // Если мандаринка уже в центре перекрестка
                this.isMovingToCrossroad = false;
                this.isDropping = true;
            }
        } else if (this.isDropping) {
            // Если мандаринка падает
            this.y += this.dropSpeed;
            
            // Если targetDevilIndex не определен, определяем ближайшего черта
            if (this.targetDevilIndex === undefined) {
                this.targetDevilIndex = this.game.conveyor.getClosestCrossroadIndex(this.x);
            }
            
            // Получаем черта, к которому направляется мандаринка
            const devil = this.game.devils[this.targetDevilIndex];
            
            // Проверка на достижение черта
            if (this.y >= devil.y) {
                this.reachDevil();
            }
        } else {
            // Движение по конвейеру
            this.x += this.game.settings.mandarinSpeed;
        }
    }
    
    draw(ctx) {
        ctx.drawImage(
            this.image,
            this.x - this.width / 2,
            this.y - this.height / 2,
            this.width,
            this.height
        );
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
                this.targetCrossroadX = crossroad.x;
                this.targetDevilIndex = crossroadIndex;
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