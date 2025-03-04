// Класс черта
class Devil {
    constructor(game, index = 0) {
        this.game = game;
        this.index = index; // Индекс черта
        
        // Позиция и размеры
        this.x = this.game.dom.canvas.width / 2; // Будет переопределено в Game.startGame
        
        // Позиционируем черта на 75% выше нижней границы унитаза
        const toiletBottom = this.game.dom.canvas.height * 0.55 + 40; // Нижняя граница унитаза
        const toiletHeight = 80; // Высота унитаза
        this.y = toiletBottom - toiletHeight * 0.75;
        
        this.width = 100;
        this.height = 120;
        
        // Состояние
        this.canEat = true;
        this.isWaiting = true;
        this.isEating = false;
        this.isRejecting = false;
        this.eatingTimer = 0;
        this.rejectingTimer = 0;
        
        // Добавляем таймер ожидания
        this.waitTimer = 0;
        
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
        
        // Обновление таймера ожидания
        if (this.isWaiting) {
            this.waitTimer += deltaTime;
        }
    }
    
    draw(ctx) {
        // Отрисовка унитаза (смещаем на 50% вниз)
        ctx.drawImage(
            this.toiletImage,
            this.x - 60,
            this.y, // Было this.y - 40, смещаем на 50% вниз
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
            // Анимация отбрасывания: поворачиваем голову
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate(Math.sin(this.rejectingTimer / 100) * 0.2);
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
        
        // Отрисовка пузыря с желаемой мандаринкой
        if (!this.isEating && !this.isRejecting) {
            // Пузырь
            ctx.drawImage(
                this.bubbleImage,
                this.x + 50, // Возвращаем исходную позицию справа от черта
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
        
        // Добавляем отрисовку таймера под чертом с увеличенным размером
        if (this.isWaiting) {
            const waitTimeSeconds = (this.waitTimer / 1000).toFixed(1);
            ctx.font = '32px Cornerita'; // Увеличиваем размер шрифта в 2 раза
            ctx.fillStyle = waitTimeSeconds > 5 ? '#ff0000' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // Рисуем таймер под чертом, смещаем ещё ниже
            ctx.fillText(`${waitTimeSeconds}с`, this.x, this.y + this.height / 2 + 50); // Увеличиваем смещение с 20 до 50
        }
    }
    
    eat(mandarin) {
        this.isEating = true;
        this.isWaiting = false;
        this.canEat = false;
        this.eatingTimer = 0;
        
        // Запускаем таймер для создания мемкоина после завершения анимации еды
        setTimeout(() => {
            // Создаем мемкоин под чертом
            console.log("Создаем мемкоин после поедания мандаринки");
            this.game.createMemecoin(this.x, this.y + this.height / 2);
        }, this.game.settings.eatingTime / 2); // Создаем мемкоин в середине анимации еды
    }
    
    reject(mandarin) {
        this.isRejecting = true;
        this.rejectingTimer = 0;
    }
    
    finishEating() {
        this.isEating = false;
        this.canEat = true;
        this.isWaiting = true;
        this.waitTimer = 0; // Сбрасываем таймер ожидания
        
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