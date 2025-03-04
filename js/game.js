// Основной класс игры
class Game {
    constructor() {
        // Настройки игры
        this.settings = {
            totalMandarins: 100,
            mandarinTypes: ['orange', 'green'],
            mandarinSpeed: 2,
            spawnInterval: 2000, // в миллисекундах
            eatingTime: 3000 // в миллисекундах
        };
        
        // Состояние игры
        this.state = {
            currentScreen: 'start',
            mandarinsLeft: this.settings.totalMandarins,
            score: 0,
            correctMandarins: 0,
            wrongMandarins: 0,
            totalWaitTime: 0,
            isRunning: false
        };
        
        // Элементы DOM
        this.dom = {
            startScreen: document.getElementById('start-screen'),
            howToPlayScreen: document.getElementById('how-to-play-screen'),
            gameScreen: document.getElementById('game-screen'),
            resultsScreen: document.getElementById('results-screen'),
            canvas: document.getElementById('game-canvas'),
            startButton: document.getElementById('start-button'),
            howToPlayButton: document.getElementById('how-to-play-button'),
            backToMenuButton: document.getElementById('back-to-menu-button'),
            playAgainButton: document.getElementById('play-again-button'),
            menuButton: document.getElementById('menu-button'),
            mandarinsLeftDisplay: document.getElementById('mandarins-left'),
            scoreDisplay: document.getElementById('score'),
            timerDisplay: document.getElementById('timer'),
            totalMandarinsDisplay: document.getElementById('total-mandarins'),
            correctMandarinsDisplay: document.getElementById('correct-mandarins'),
            wrongMandarinsDisplay: document.getElementById('wrong-mandarins'),
            totalWaitTimeDisplay: document.getElementById('total-wait-time')
        };
        
        // Инициализация канваса
        this.ctx = this.dom.canvas.getContext('2d');
        this.resizeCanvas();
        
        // Игровые объекты
        this.conveyor = null;
        this.devil = null;
        this.mandarins = [];
        
        // Ресурсы
        this.resources = {
            images: {},
            loaded: false,
            toLoad: 0,
            loaded: 0
        };
        
        // Привязка методов
        this.update = this.update.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // Инициализация игры
        this.init();
    }
    
    init() {
        // Загрузка ресурсов
        this.loadResources();
        
        // Добавление обработчиков событий
        window.addEventListener('resize', () => this.resizeCanvas());
        this.dom.startButton.addEventListener('click', () => this.startGame());
        this.dom.howToPlayButton.addEventListener('click', () => this.showScreen('howToPlay'));
        this.dom.backToMenuButton.addEventListener('click', () => this.showScreen('start'));
        this.dom.playAgainButton.addEventListener('click', () => this.startGame());
        this.dom.menuButton.addEventListener('click', () => this.showScreen('start'));
        this.dom.canvas.addEventListener('click', this.handleClick);
    }
    
    loadResources() {
        const imagesToLoad = [
            { name: 'background', src: 'assets/images/background.png' },
            { name: 'conveyor', src: 'assets/images/conveyor.png' },
            { name: 'orangeMandarin', src: 'assets/images/orange-mandarin.png' },
            { name: 'greenMandarin', src: 'assets/images/green-mandarin.png' },
            { name: 'devil', src: 'assets/images/devil.png' },
            { name: 'toilet', src: 'assets/images/toilet.png' },
            { name: 'crossroad', src: 'assets/images/crossroad.png' },
            { name: 'bubble', src: 'assets/images/bubble.png' }
        ];
        
        this.resources.toLoad = imagesToLoad.length;
        
        imagesToLoad.forEach(img => {
            const image = new Image();
            image.src = img.src;
            image.onload = () => {
                this.resources.images[img.name] = image;
                this.resources.loaded++;
                
                if (this.resources.loaded === this.resources.toLoad) {
                    this.resources.loaded = true;
                    this.showScreen('start');
                }
            };
        });
    }
    
    resizeCanvas() {
        this.dom.canvas.width = window.innerWidth;
        this.dom.canvas.height = window.innerHeight;
        
        // Перерисовка, если игра запущена
        if (this.state.isRunning) {
            this.draw();
        }
    }
    
    showScreen(screenName) {
        // Скрыть все экраны
        this.dom.startScreen.classList.add('hidden');
        this.dom.howToPlayScreen.classList.add('hidden');
        this.dom.gameScreen.classList.add('hidden');
        this.dom.resultsScreen.classList.add('hidden');
        
        // Показать нужный экран
        switch (screenName) {
            case 'start':
                this.dom.startScreen.classList.remove('hidden');
                this.state.currentScreen = 'start';
                break;
            case 'howToPlay':
                this.dom.howToPlayScreen.classList.remove('hidden');
                this.state.currentScreen = 'howToPlay';
                break;
            case 'game':
                this.dom.gameScreen.classList.remove('hidden');
                this.state.currentScreen = 'game';
                break;
            case 'results':
                this.updateResultsScreen();
                this.dom.resultsScreen.classList.remove('hidden');
                this.state.currentScreen = 'results';
                break;
        }
    }
    
    startGame() {
        // Сброс состояния игры
        this.state.mandarinsLeft = this.settings.totalMandarins;
        this.state.score = 0;
        this.state.correctMandarins = 0;
        this.state.wrongMandarins = 0;
        this.state.totalWaitTime = 0;
        this.state.isRunning = true;
        
        // Обновление отображения
        this.updateStatsDisplay();
        
        // Создание игровых объектов
        this.conveyor = new Conveyor(this);
        this.devil = new Devil(this);
        this.mandarins = [];
        
        // Показ игрового экрана
        this.showScreen('game');
        
        // Запуск игрового цикла
        this.lastTime = performance.now();
        requestAnimationFrame(this.update);
        
        // Запуск спавна мандаринок
        this.spawnInterval = setInterval(() => {
            if (this.state.mandarinsLeft > 0) {
                this.spawnMandarin();
            } else if (this.mandarins.length === 0) {
                // Если мандаринки закончились и на конвейере их нет
                this.endGame();
            }
        }, this.settings.spawnInterval);
    }
    
    spawnMandarin() {
        if (this.state.mandarinsLeft <= 0) return;
        
        // Случайный тип мандаринки
        const type = this.settings.mandarinTypes[Math.floor(Math.random() * this.settings.mandarinTypes.length)];
        
        // Создание мандаринки
        const mandarin = new Mandarin(this, type);
        this.mandarins.push(mandarin);
        
        // Уменьшение счетчика оставшихся мандаринок
        this.state.mandarinsLeft--;
        this.updateStatsDisplay();
    }
    
    update(timestamp) {
        if (!this.state.isRunning) return;
        
        // Расчет дельты времени
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;
        
        // Обновление таймера ожидания черта
        if (this.devil && this.devil.isWaiting) {
            this.state.totalWaitTime += deltaTime;
            this.updateStatsDisplay();
        }
        
        // Обновление игровых объектов
        this.conveyor.update(deltaTime);
        this.devil.update(deltaTime);
        
        // Обновление мандаринок
        for (let i = this.mandarins.length - 1; i >= 0; i--) {
            const mandarin = this.mandarins[i];
            mandarin.update(deltaTime);
            
            // Удаление мандаринок, которые вышли за пределы экрана
            if (mandarin.x > this.dom.canvas.width) {
                this.mandarins.splice(i, 1);
            }
        }
        
        // Отрисовка
        this.draw();
        
        // Продолжение игрового цикла
        requestAnimationFrame(this.update);
    }
    
    draw() {
        // Очистка канваса
        this.ctx.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
        
        // Отрисовка фона
        this.ctx.drawImage(
            this.resources.images.background,
            0, 0,
            this.dom.canvas.width, this.dom.canvas.height
        );
        
        // Отрисовка конвейера
        this.conveyor.draw(this.ctx);
        
        // Отрисовка черта
        this.devil.draw(this.ctx);
        
        // Отрисовка мандаринок
        this.mandarins.forEach(mandarin => mandarin.draw(this.ctx));
    }
    
    handleClick(event) {
        if (this.state.currentScreen !== 'game' || !this.state.isRunning) return;
        
        // Получение координат клика
        const rect = this.dom.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Проверка клика на перекрестке
        if (this.conveyor.isCrossroadClicked(x, y)) {
            // Поиск ближайшей мандаринки к перекрестку
            const crossroadX = this.conveyor.crossroadX;
            let closestMandarin = null;
            let minDistance = Infinity;
            
            this.mandarins.forEach(mandarin => {
                if (mandarin.y === this.conveyor.y && !mandarin.isDropping) {
                    const distance = Math.abs(mandarin.x - crossroadX);
                    if (distance < minDistance && distance < 50) { // 50 - примерное расстояние для взаимодействия
                        minDistance = distance;
                        closestMandarin = mandarin;
                    }
                }
            });
            
            if (closestMandarin) {
                closestMandarin.drop();
            }
        }
    }
    
    updateStatsDisplay() {
        this.dom.mandarinsLeftDisplay.textContent = `Осталось: ${this.state.mandarinsLeft}`;
        this.dom.scoreDisplay.textContent = `Счёт: ${this.state.score}`;
        this.dom.timerDisplay.textContent = `Время ожидания: ${Math.floor(this.state.totalWaitTime / 1000)}с`;
    }
    
    updateResultsScreen() {
        this.dom.totalMandarinsDisplay.textContent = `Всего мандаринок: ${this.settings.totalMandarins}`;
        this.dom.correctMandarinsDisplay.textContent = `Правильно съедено: ${this.state.correctMandarins}`;
        this.dom.wrongMandarinsDisplay.textContent = `Неправильно направлено: ${this.state.wrongMandarins}`;
        this.dom.totalWaitTimeDisplay.textContent = `Общее время ожидания: ${Math.floor(this.state.totalWaitTime / 1000)}с`;
    }
    
    endGame() {
        this.state.isRunning = false;
        clearInterval(this.spawnInterval);
        this.showScreen('results');
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    const game = new Game();
}); 