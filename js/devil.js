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
        this.originalY = this.y; // Сохраняем исходную позицию Y для анимации
        
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
        
        // Параметры анимации тряски
        this.isShaking = false;
        this.shakeDirection = 1; // 1 - вверх, -1 - вниз
        this.shakeAmount = 10; // Амплитуда тряски в пикселях
        this.shakeTimer = 0; // Таймер для отслеживания времени тряски
        this.shakeDuration = 500; // Длительность одного движения (вверх или вниз) в мс
        
        // Желаемый тип мандаринки
        this.wantedMandarinType = this.getRandomType();
        
        // Изображения
        this.devilImage = this.game.resources.images.devil;
        this.toiletImage = this.game.resources.images.toilet;
        this.bubbleImage = this.game.resources.images.bubble;
        this.desiredMandarinImage = this.wantedMandarinType === 'orange' 
            ? this.game.resources.images.orangeMandarin 
            : this.game.resources.images.greenMandarin;
        
        console.log(`Создан черт ${this.index}, который хочет мандаринку типа ${this.wantedMandarinType}`);
    }
    
    update(deltaTime) {
        // Обновление таймеров
        if (this.isEating) {
            this.eatingTimer += deltaTime;
            
            // Обновление анимации тряски
            if (this.isShaking) {
                this.shakeTimer += deltaTime;
                
                // Если прошло 0.5 секунды, меняем направление тряски
                if (this.shakeTimer >= this.shakeDuration) {
                    this.shakeDirection *= -1; // Меняем направление
                    this.shakeTimer = 0; // Сбрасываем таймер
                    
                    // Если направление вниз и мы уже сделали полный цикл (вверх-вниз)
                    if (this.shakeDirection === -1 && this.eatingTimer >= this.game.settings.eatingTime / 2) {
                        // Возвращаем черта на исходную позицию
                        this.y = this.originalY;
                        this.isShaking = false;
                    }
                }
                
                // Обновляем позицию черта в зависимости от направления тряски
                if (this.isShaking) {
                    const shakeProgress = this.shakeTimer / this.shakeDuration; // От 0 до 1
                    const offset = this.shakeAmount * this.shakeDirection * Math.sin(shakeProgress * Math.PI);
                    this.y = this.originalY + offset;
                }
            }
            
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
        // Отрисовка унитаза под чертом (всегда на фиксированной позиции)
        if (this.toiletImage && this.toiletImage.complete) {
            // Унитаз должен быть немного шире черта и располагаться под ним
            const toiletWidth = this.width * 1.2;
            const toiletHeight = this.height * 0.6;
            const toiletX = this.x - toiletWidth / 2;
            const toiletY = this.originalY + this.height / 2 - toiletHeight / 3; // Используем originalY вместо this.y
            
            ctx.drawImage(
                this.toiletImage,
                toiletX,
                toiletY,
                toiletWidth,
                toiletHeight
            );
        }
        
        // Отрисовка черта (с учетом анимации тряски)
        if (this.devilImage && this.devilImage.complete) {
            ctx.drawImage(
                this.devilImage,
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        } else {
            // Запасной вариант - рисуем черный прямоугольник
            ctx.fillStyle = '#000000';
            ctx.fillRect(
                this.x - this.width / 2,
                this.y - this.height / 2,
                this.width,
                this.height
            );
        }
        
        // Отрисовка пузыря с желаемым типом мандаринки только если черт не ест
        if (!this.isEating) {
            this.drawBubble(ctx);
        }
        
        // Отрисовка индикатора ожидания
        if (this.isWaiting) {
            this.drawWaitingIndicator(ctx);
        }
    }
    
    eat(mandarin) {
        this.isEating = true;
        this.isWaiting = false;
        this.canEat = false;
        this.eatingTimer = 0;
        
        // Запускаем анимацию тряски, если тип мандаринки совпадает с желаемым
        if (mandarin.type === this.desiredType) {
            this.isShaking = true;
            this.shakeDirection = 1; // Начинаем движение вверх
            this.shakeTimer = 0;
        }
        
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
        this.waitTimer = 0;
        this.isShaking = false;
        this.y = this.originalY; // Возвращаем черта на исходную позицию
        
        // Генерируем новый тип мандаринки, который хочет черт
        this.generateNewWantedType();
    }
    
    finishRejecting() {
        this.isRejecting = false;
    }
    
    getRandomType() {
        return this.game.settings.mandarinTypes[
            Math.floor(Math.random() * this.game.settings.mandarinTypes.length)
        ];
    }
    
    drawBubble(ctx) {
        // Размеры и позиция пузыря
        const bubbleWidth = 70;
        const bubbleHeight = 60;
        const bubbleX = this.x + 50;
        const bubbleY = this.y - 80; // Используем текущую позицию черта
        const cornerRadius = 10; // Радиус скругления углов
        
        // Рисуем прямоугольник со скругленными краями
        ctx.save();
        
        // Полупрозрачный фон
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        
        // Неоновая обводка
        ctx.shadowColor = '#8A2BE2'; // Фиолетово-синий цвет
        ctx.shadowBlur = 10;
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#4B0082'; // Индиго для обводки
        
        // Рисуем скругленный прямоугольник
        ctx.beginPath();
        ctx.moveTo(bubbleX + cornerRadius, bubbleY);
        ctx.lineTo(bubbleX + bubbleWidth - cornerRadius, bubbleY);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY, bubbleX + bubbleWidth, bubbleY + cornerRadius);
        ctx.lineTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight - cornerRadius);
        ctx.quadraticCurveTo(bubbleX + bubbleWidth, bubbleY + bubbleHeight, bubbleX + bubbleWidth - cornerRadius, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + cornerRadius, bubbleY + bubbleHeight);
        ctx.quadraticCurveTo(bubbleX, bubbleY + bubbleHeight, bubbleX, bubbleY + bubbleHeight - cornerRadius);
        ctx.lineTo(bubbleX, bubbleY + cornerRadius);
        ctx.quadraticCurveTo(bubbleX, bubbleY, bubbleX + cornerRadius, bubbleY);
        ctx.closePath();
        
        // Заливка и обводка
        ctx.fill();
        ctx.stroke();
        
        // Добавляем хвостик пузыря
        ctx.beginPath();
        ctx.moveTo(bubbleX + 15, bubbleY + bubbleHeight);
        ctx.lineTo(bubbleX + 5, bubbleY + bubbleHeight + 15);
        ctx.lineTo(bubbleX + 25, bubbleY + bubbleHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        ctx.restore();
        
        // Желаемая мандаринка в центре пузыря
        const mandarinSize = 40;
        
        // Проверяем, что изображение загружено
        if (this.desiredMandarinImage && this.desiredMandarinImage.complete) {
            ctx.drawImage(
                this.desiredMandarinImage,
                bubbleX + (bubbleWidth - mandarinSize) / 2,
                bubbleY + (bubbleHeight - mandarinSize) / 2,
                mandarinSize,
                mandarinSize
            );
        } else {
            // Запасной вариант - рисуем цветной круг
            ctx.fillStyle = this.wantedMandarinType === 'orange' ? '#FFA500' : '#00FF00';
            ctx.beginPath();
            ctx.arc(
                bubbleX + bubbleWidth / 2,
                bubbleY + bubbleHeight / 2,
                mandarinSize / 2,
                0,
                Math.PI * 2
            );
            ctx.fill();
        }
    }
    
    drawWaitingIndicator(ctx) {
        const waitTimeSeconds = (this.waitTimer / 1000).toFixed(1);
        ctx.font = '32px Cornerita';
        ctx.fillStyle = waitTimeSeconds > 5 ? '#ff0000' : '#ffffff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Рисуем таймер под унитазом, используя originalY
        ctx.fillText(`${waitTimeSeconds}с`, this.x, this.originalY + this.height / 2 + 50);
    }

    // Метод для поедания мандаринки
    eatMandarin(mandarin) {
        // Устанавливаем состояние "ест"
        this.isEating = true;
        this.eatingTimer = 0;
        
        // Запускаем анимацию тряски
        this.isShaking = true;
        this.shakeTimer = 0;
        
        // Создаем эффект правильной мандаринки
        this.game.effects.push({
            x: this.x,
            y: this.y,
            size: 40,
            alpha: 1,
            color: '#00ff00', // Зеленый цвет для правильной мандаринки
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
        });
        
        // Создаем мемкоин
        this.createMemecoin();
        
        // Сбрасываем флаг ожидания
        this.isWaiting = false;
        
        // Генерируем новый тип мандаринки, который хочет черт
        this.generateNewWantedType();
    }

    // Метод для создания мемкоина
    createMemecoin() {
        // Выбираем случайное название мемкоина
        let tokenName;
        
        // Если все названия уже использованы, сбрасываем список использованных
        if (this.game.usedMemecoinNames.length >= this.game.memecoinNames.length) {
            this.game.usedMemecoinNames = [];
        }
        
        // Выбираем случайное неиспользованное название
        do {
            tokenName = this.game.memecoinNames[Math.floor(Math.random() * this.game.memecoinNames.length)];
        } while (this.game.usedMemecoinNames.includes(tokenName));
        
        // Добавляем название в список использованных
        this.game.usedMemecoinNames.push(tokenName);
        
        // Устанавливаем текущее название токена
        this.game.currentTokenName = tokenName;
        
        // Запускаем эффект тряски для токена
        this.game.tokenShaking = true;
        setTimeout(() => {
            this.game.tokenShaking = false;
        }, 500);
        
        // Создаем объект мемкоина
        const memecoin = new Memecoin(this.game, this.x, this.y, tokenName);
        
        // Добавляем мемкоин в массив
        this.game.memecoins.push(memecoin);
    }

    // Метод для генерации нового типа мандаринки
    generateNewWantedType() {
        // Выбираем случайный тип мандаринки
        this.wantedMandarinType = this.game.settings.mandarinTypes[
            Math.floor(Math.random() * this.game.settings.mandarinTypes.length)
        ];
        
        // Обновляем изображение желаемой мандаринки
        this.desiredMandarinImage = this.wantedMandarinType === 'orange' 
            ? this.game.resources.images.orangeMandarin 
            : this.game.resources.images.greenMandarin;
        
        console.log(`Черт ${this.index} теперь хочет мандаринку типа ${this.wantedMandarinType}`);
    }

    // Метод для отбрасывания неправильной мандаринки
    rejectMandarin(mandarin) {
        // Создаем эффект неправильной мандаринки
        this.game.effects.push({
            x: this.x,
            y: this.y,
            size: 40,
            alpha: 1,
            color: '#ff0000', // Красный цвет для неправильной мандаринки
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
        });
    }
} 