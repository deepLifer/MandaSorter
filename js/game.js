// Базовая конфигурация игры на Phaser
const config = {
    type: Phaser.AUTO,
    width: window.innerWidth,
    height: window.innerHeight,
    parent: 'game-container',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    }
};

// Инициализация игры
const game = new Phaser.Game(config);

// Загрузка ресурсов
function preload() {
    // Здесь будет загрузка спрайтов, звуков и т.д.
    this.load.image('background', 'assets/background.png');
    this.load.image('player', 'assets/player.png');
}

// Создание игровых объектов
function create() {
    // Здесь будет создание игровых объектов
    this.add.image(0, 0, 'background').setOrigin(0, 0);
    
    // Создаем игрока
    this.player = this.physics.add.sprite(100, 100, 'player');
    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);
}

// Обновление игры
function update() {
    // Здесь будет игровая логика
}

// Обработка изменения размера окна
window.addEventListener('resize', () => {
    game.scale.resize(window.innerWidth, window.innerHeight);
}); 