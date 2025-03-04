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
    
    // Метод для обновления ответвлений (вызывается при старте игры)
    updateBranches() {
        this.branches = [];
        
        // Для каждого перекрестка создаем ответвление к соответствующему черту
        for (let i = 0; i < this.crossroads.length; i++) {
            const crossroad = this.crossroads[i];
            const devil = this.game.devils[i];
            
            if (devil) {
                this.branches.push({
                    startX: crossroad.x,
                    startY: this.y,
                    endX: devil.x,
                    endY: devil.y - devil.height / 2, // Верхняя точка черта
                    width: 30 // Ширина ответвления
                });
            }
        }
    }
    
    update(deltaTime) {
        // Анимация движения конвейера (меняем направление обратно)
        this.offset = (this.offset + this.speed) % 50; // Положительное значение для движения слева направо
    }
    
    draw(ctx) {
        // Отрисовка конвейера
        if (this.conveyorImage && this.conveyorImage.complete) {
            try {
                // Используем метод с повторяющимися изображениями
                const imgWidth = this.conveyorImage.width;
                
                // Вычисляем начальную позицию с учетом смещения
                // Добавляем дополнительный сегмент слева для предотвращения появления черного прямоугольника
                const startX = (this.offset % imgWidth) - imgWidth;
                
                // Рисуем сегменты конвейера, начиная с дополнительного сегмента слева
                for (let x = startX; x < this.game.dom.canvas.width; x += imgWidth) {
                    ctx.drawImage(
                        this.conveyorImage,
                        x,
                        this.y - this.height / 2,
                        imgWidth,
                        this.height
                    );
                }
                
                // Добавляем обводку для лучшей видимости
                ctx.strokeStyle = '#333';
                ctx.lineWidth = 2;
                ctx.strokeRect(0, this.y - this.height / 2, this.game.dom.canvas.width, this.height);
            } catch (e) {
                console.error('Ошибка при отрисовке конвейера:', e);
                
                // Запасной вариант - просто рисуем прямоугольник
                ctx.fillStyle = '#555';
                ctx.fillRect(0, this.y - this.height / 2, this.game.dom.canvas.width, this.height);
            }
        } else {
            // Если изображение не загружено, рисуем простой прямоугольник
            ctx.fillStyle = '#555';
            ctx.fillRect(0, this.y - this.height / 2, this.game.dom.canvas.width, this.height);
            
            // Выводим сообщение в консоль
            console.warn('Изображение конвейера не загружено или не готово к отрисовке');
        }
        
        /* Временно убираем отрисовку ответвлений
        // Отрисовка ответвлений от перекрестков к чертям
        for (const branch of this.branches) {
            if (this.conveyorImage && this.conveyorImage.complete) {
                try {
                    // Рисуем вертикальное ответвление
                    const imgWidth = this.conveyorImage.width;
                    const imgHeight = this.conveyorImage.height || this.height;
                    
                    // Вычисляем количество сегментов для заполнения ответвления
                    const branchLength = branch.endY - branch.startY;
                    const segmentsCount = Math.ceil(branchLength / imgHeight);
                    
                    // Рисуем сегменты ответвления с анимацией
                    // Используем то же смещение, что и для основного конвейера, но в вертикальном направлении
                    const startY = branch.startY + (this.offset % imgHeight);
                    
                    for (let i = -1; i < segmentsCount; i++) {
                        const y = startY + i * imgHeight;
                        if (y < branch.endY && y + imgHeight > branch.startY) {
                            ctx.drawImage(
                                this.conveyorImage,
                                branch.startX - branch.width / 2,
                                y,
                                branch.width,
                                imgHeight
                            );
                        }
                    }
                    
                    // Добавляем обводку для лучшей видимости
                    ctx.strokeStyle = '#333';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.moveTo(branch.startX - branch.width / 2, branch.startY);
                    ctx.lineTo(branch.startX - branch.width / 2, branch.endY);
                    ctx.lineTo(branch.startX + branch.width / 2, branch.endY);
                    ctx.lineTo(branch.startX + branch.width / 2, branch.startY);
                    ctx.stroke();
                } catch (e) {
                    console.error('Ошибка при отрисовке ответвления:', e);
                    
                    // Запасной вариант - просто рисуем прямоугольник
                    ctx.fillStyle = '#555';
                    ctx.fillRect(
                        branch.startX - branch.width / 2,
                        branch.startY,
                        branch.width,
                        branch.endY - branch.startY
                    );
                }
            } else {
                // Если изображение не загружено, рисуем простой прямоугольник
                ctx.fillStyle = '#555';
                ctx.fillRect(
                    branch.startX - branch.width / 2,
                    branch.startY,
                    branch.width,
                    branch.endY - branch.startY
                );
            }
        }
        */
        
        // Отрисовка перекрестков
        for (let i = 0; i < this.crossroads.length; i++) {
            const crossroad = this.crossroads[i];
            
            // Если перекресток под курсором, рисуем подсветку
            if (i === this.hoveredCrossroadIndex) {
                ctx.save();
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.beginPath();
                ctx.arc(
                    crossroad.x,
                    this.y,
                    crossroad.width / 2,
                    0,
                    Math.PI * 2
                );
                ctx.fill();
                ctx.restore();
            }
            
            // Отрисовка изображения перекрестка
            if (this.crossroadImage && this.crossroadImage.complete) {
                ctx.drawImage(
                    this.crossroadImage,
                    crossroad.x - crossroad.visualWidth / 2,
                    this.y - crossroad.visualHeight / 2,
                    crossroad.visualWidth,
                    crossroad.visualHeight
                );
            } else {
                // Если изображение не загружено, рисуем простой круг
                ctx.fillStyle = '#777';
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
} 