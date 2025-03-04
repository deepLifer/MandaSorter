// Класс конвейера
class Conveyor {
    constructor(game) {
        this.game = game;
        
        // Позиция и размеры
        this.y = this.game.dom.canvas.height * 0.4;
        this.height = 30;
        this.crossroadX = this.game.dom.canvas.width / 2;
        this.crossroadWidth = 50;
        this.crossroadHeight = 50;
        
        // Изображения
        this.conveyorImage = this.game.resources.images.conveyor;
        this.crossroadImage = this.game.resources.images.crossroad;
        
        // Анимация конвейера
        this.offset = 0;
        this.speed = 2;
    }
    
    update(deltaTime) {
        // Анимация движения конвейера
        this.offset = (this.offset + this.speed) % 50; // 50 - размер повторяющегося паттерна
    }
    
    draw(ctx) {
        // Отрисовка конвейера
        const pattern = ctx.createPattern(this.conveyorImage, 'repeat-x');
        ctx.save();
        ctx.translate(-this.offset, 0);
        ctx.fillStyle = pattern;
        ctx.fillRect(0, this.y - this.height / 2, this.game.dom.canvas.width + this.offset, this.height);
        ctx.restore();
        
        // Отрисовка перекрестка
        ctx.drawImage(
            this.crossroadImage,
            this.crossroadX - this.crossroadWidth / 2,
            this.y - this.crossroadHeight / 2,
            this.crossroadWidth,
            this.crossroadHeight
        );
    }
    
    isCrossroadClicked(x, y) {
        return (
            x >= this.crossroadX - this.crossroadWidth / 2 &&
            x <= this.crossroadX + this.crossroadWidth / 2 &&
            y >= this.y - this.crossroadHeight / 2 &&
            y <= this.y + this.crossroadHeight / 2
        );
    }
} 