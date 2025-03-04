// Класс конвейера
class Conveyor {
    constructor(game) {
        this.game = game;
        
        // Позиция и размеры
        this.y = this.game.dom.canvas.height * 0.4;
        this.height = 40; // Увеличиваем высоту конвейера
        
        // Два перекрестка вместо одного с увеличенной зоной клика
        this.crossroads = [
            {
                x: this.game.dom.canvas.width * 0.25,
                width: 80,
                height: 80,
                visualWidth: 50,
                visualHeight: 50
            },
            {
                x: this.game.dom.canvas.width * 0.75,
                width: 80,
                height: 80,
                visualWidth: 50,
                visualHeight: 50
            }
        ];
        
        // Добавляем ответвления от перекрестков к чертям
        this.branches = [];
        
        // Добавим состояние наведения для перекрестков
        this.hoveredCrossroadIndex = -1;
        
        // Изображения
        this.conveyorImage = this.game.resources.images.conveyor;
        this.crossroadImage = this.game.resources.images.crossroad;
        
        // Проверка загрузки изображения конвейера
        if (!this.conveyorImage) {
            console.warn('Изображение конвейера не загружено!');
        } else {
            console.log('Изображение конвейера загружено:', this.conveyorImage);
            
            // Добавим обработчик для проверки загрузки изображения
            if (!this.conveyorImage.complete) {
                this.conveyorImage.onload = () => {
                    console.log('Изображение конвейера загружено полностью:', 
                                this.conveyorImage.width, 'x', this.conveyorImage.height);
                };
                
                this.conveyorImage.onerror = (e) => {
                    console.error('Ошибка загрузки изображения конвейера:', e);
                };
            } else {
                console.log('Изображение конвейера уже загружено:', 
                            this.conveyorImage.width, 'x', this.conveyorImage.height);
            }
        }
        
        // Анимация конвейера
        this.offset = 0;
        this.speed = 1.4; // Уменьшено на 30% с 2
        
        // Добавим обработчик движения мыши
        this.game.dom.canvas.addEventListener('mousemove', (event) => {
            const rect = this.game.dom.canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            this.hoveredCrossroadIndex = this.isCrossroadClicked(x, y);
        });
        
        // Добавим обработчик ухода мыши с канваса
        this.game.dom.canvas.addEventListener('mouseout', () => {
            this.hoveredCrossroadIndex = -1;
        });
    }
    
    // Метод для обновления ответвлений от перекрестков к чертям
    updateBranches() {
        this.branches = [];
        
        // Для каждого перекрестка создаем ответвление к соответствующему черту
        for (let i = 0; i < this.crossroads.length && i < this.game.devils.length; i++) {
            const crossroad = this.crossroads[i];
            const devil = this.game.devils[i];
            
            this.branches.push({
                startX: crossroad.x,
                startY: crossroad.y,
                endX: devil.x,
                endY: devil.y - devil.height / 2
            });
        }
    }
    
    update(deltaTime) {
        // Анимация движения конвейера (меняем направление обратно)
        this.offset = (this.offset + this.speed) % 50; // Положительное значение для движения слева направо
    }
    
    draw(ctx) {
        // Отрисовка конвейера
        if (this.conveyorImage && this.conveyorImage.complete) {
            // Отрисовка повторяющегося изображения конвейера
            const patternWidth = this.conveyorImage.width;
            
            // Вычисляем количество повторений изображения
            const repeats = Math.ceil(this.game.dom.canvas.width / patternWidth) + 1;
            
            // Отрисовка с учетом смещения для анимации
            for (let i = 0; i < repeats; i++) {
                const x = i * patternWidth - this.offset;
                ctx.drawImage(this.conveyorImage, x, this.y - this.height / 2, patternWidth, this.height);
            }
        } else {
            // Запасной вариант - рисуем серую линию
            ctx.fillStyle = '#888888';
            ctx.fillRect(0, this.y - this.height / 2, this.game.dom.canvas.width, this.height);
        }
        
        // Отрисовка перекрестков
        for (let i = 0; i < this.crossroads.length; i++) {
            const crossroad = this.crossroads[i];
            
            if (this.crossroadImage && this.crossroadImage.complete) {
                // Отрисовка изображения перекрестка
                ctx.drawImage(
                    this.crossroadImage,
                    crossroad.x - crossroad.visualWidth / 2,
                    this.y - crossroad.visualHeight / 2,
                    crossroad.visualWidth,
                    crossroad.visualHeight
                );
            } else {
                // Запасной вариант - рисуем красный круг
                ctx.fillStyle = '#FF0000';
                ctx.beginPath();
                ctx.arc(
                    crossroad.x,
                    this.y,
                    crossroad.visualWidth / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
            }
        }
        
        // Отрисовка ответвлений от перекрестков к чертям
        if (this.branches && this.branches.length > 0) {
            for (const branch of this.branches) {
                ctx.strokeStyle = '#888888';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(branch.startX, branch.startY);
                ctx.lineTo(branch.endX, branch.endY);
                ctx.stroke();
            }
        }
    }
    
    isCrossroadClicked(x, y) {
        // Проверка клика на любом из перекрестков
        for (let i = 0; i < this.crossroads.length; i++) {
            const crossroad = this.crossroads[i];
            if (
                x >= crossroad.x - crossroad.width / 2 &&
                x <= crossroad.x + crossroad.width / 2 &&
                y >= this.y - crossroad.height / 2 &&
                y <= this.y + crossroad.height / 2
            ) {
                return i; // Возвращаем индекс перекрестка
            }
        }
        return -1; // Не попали ни в один перекресток
    }
    
    // Метод для получения ближайшего перекрестка к мандаринке
    getClosestCrossroadIndex(mandarinX) {
        let closestIndex = 0;
        let minDistance = Math.abs(mandarinX - this.crossroads[0].x);
        
        for (let i = 1; i < this.crossroads.length; i++) {
            const distance = Math.abs(mandarinX - this.crossroads[i].x);
            if (distance < minDistance) {
                minDistance = distance;
                closestIndex = i;
            }
        }
        
        return closestIndex;
    }
    
    // Метод для добавления перекрестка
    addCrossroad(x) {
        const crossroad = {
            x: x,
            y: this.y,
            width: 40,
            height: 40,
            visualWidth: 30,
            visualHeight: 30
        };
        
        this.crossroads.push(crossroad);
        console.log(`Добавлен перекресток на позиции (${x}, ${this.y})`);
        return crossroad;
    }
} 