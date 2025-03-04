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
        
        // Изображение
        this.image = this.type === 'orange' 
            ? this.game.resources.images.orangeMandarin 
            : this.game.resources.images.greenMandarin;
    }
    
    update(deltaTime) {
        if (this.isDropping) {
            // Если мандаринка падает
            this.y += this.dropSpeed;
            
            // Проверка на достижение черта
            if (this.y >= this.game.devil.y) {
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
    
    drop() {
        if (!this.isDropping) {
            this.isDropping = true;
        }
    }
    
    reachDevil() {
        // Проверка, может ли черт принять мандаринку
        if (this.game.devil.canEat) {
            // Проверка, правильная ли мандаринка
            if (this.type === this.game.devil.desiredType) {
                // Правильная мандаринка
                this.game.devil.eat(this);
                this.game.state.correctMandarins++;
                this.game.state.score += 10;
            } else {
                // Неправильная мандаринка
                this.game.devil.reject(this);
                this.game.state.wrongMandarins++;
            }
        } else {
            // Черт занят, отбрасывает мандаринку
            this.game.devil.reject(this);
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