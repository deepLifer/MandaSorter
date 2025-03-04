// Класс черта
class Devil {
    constructor(game) {
        this.game = game;
        
        // Позиция и размеры
        this.x = this.game.dom.canvas.width / 2;
        this.y = this.game.dom.canvas.height * 0.7;
        this.width = 100;
        this.height = 120;
        
        // Состояние
        this.canEat = true;
        this.isWaiting = true;
        this.isEating = false;
        this.isRejecting = false;
        this.eatingTimer = 0;
        this.rejectingTimer = 0;
        
        // Желаемый тип мандаринки
        this.desiredType = this.getRandomType();
        
        // Изображения
        this.devilImage = this.game.resources.images.devil;
        this.toiletImage = this.game.resources.images.toilet;
        this.bubbleImage = this.game.resources.images.bubble;
        this.desiredMandarinImage = this.desiredType === 'orange' 
            ? this.game.resources.images.orangeMandarin 
            : this.game.resources.images.greenMandarin;
    }
    
    update(deltaTime) {
        // Обновление таймеров
        if (this.isEating) {
            this.eatingTimer += deltaTime;
            if (this.eatingTimer >= this.game.settings.eatingTime) {
                this.finishEating();
            }
        }
        
        if (this.isRejecting) {
            this.rejectingTimer += deltaTime;
            if (this.rejectingTimer >= 1000) { // 1 секунда на отбрасывание
                this.finishRejecting();
            }
        }
    }
    
    draw(ctx) {
        // Отрисовка унитаза
        ctx.drawImage(
            this.toiletImage,
            this.x - 60,
            this.y - 40,
            120,
            80
        );
        
        // Отрисовка черта с анимацией
        if (this.isEating) {
            // Анимация поедания: увеличиваем размер и слегка меняем позицию
            const scale = 1 + 0.1 * Math.sin(this.eatingTimer / 200);
            ctx.drawImage(
                this.devilImage,
                this.x - this.width / 2 * scale,
                this.y - this.height / 2 * scale,
                this.width * scale,
                this.height * scale
            );
        } else if (this.isRejecting) {
            // Анимация отбрасывания: поворачиваем черта
            const angle = 0.1 * Math.sin(this.rejectingTimer / 50);
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(angle);
            ctx.drawImage(
                this.devilImage,
                -this.width / 2,
                -this.height / 2,
                this.width,
                this.height
            );
            ctx.restore();
        } else {
            // Обычная отрисовка
            ctx.drawImage(
                this.devilImage,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
        
        // Отрисовка пузыря желания, если черт не ест и не отбрасывает
        if (!this.isEating && !this.isRejecting) {
            // Пузырь
            ctx.drawImage(
                this.bubbleImage,
                this.x + 50,
                this.y - 80,
                60,
                60
            );
            
            // Желаемая мандаринка
            ctx.drawImage(
                this.desiredMandarinImage,
                this.x + 50,
                this.y - 80,
                40,
                40
            );
        }
    }
    
    eat(mandarin) {
        this.isEating = true;
        this.isWaiting = false;
        this.canEat = false;
        this.eatingTimer = 0;
    }
    
    reject(mandarin) {
        this.isRejecting = true;
        this.rejectingTimer = 0;
    }
    
    finishEating() {
        this.isEating = false;
        this.canEat = true;
        this.isWaiting = true;
        
        // Смена желаемого типа мандаринки
        this.desiredType = this.getRandomType();
        this.desiredMandarinImage = this.desiredType === 'orange' 
            ? this.game.resources.images.orangeMandarin 
            : this.game.resources.images.greenMandarin;
    }
    
    finishRejecting() {
        this.isRejecting = false;
    }
    
    getRandomType() {
        return this.game.settings.mandarinTypes[
            Math.floor(Math.random() * this.game.settings.mandarinTypes.length)
        ];
    }
} 