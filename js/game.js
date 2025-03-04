// Основной класс игры
class Game {
    constructor() {
        // Настройки игры
        this.settings = {
            totalMandarins: 10,
            mandarinTypes: ['orange', 'green'],
            mandarinSpeed: 4,
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
        this.devils = []; // Массив чертей вместо одного
        this.mandarins = [];
        
        // Ресурсы
        this.resources = {
            images: {},
            loaded: false,
            toLoad: 0,
            loaded: 0
        };
        
        // Добавляем массив для эффектов
        this.effects = [];
        
        // Добавляем объект для звуков
        this.sounds = {
            loaded: false,
            toLoad: 0,
            loaded: 0,
            audio: {}
        };
        
        // Привязка методов
        this.update = this.update.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // Предзагрузка шрифта
        this.loadFont('Cornerita', 'assets/fonts/Cornerita.ttf');
        
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
            { name: 'bubble', src: 'assets/images/bubble.png' },
            { name: 'splash', src: 'assets/images/splash.png' }
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
    
    loadSounds() {
        const soundsToLoad = [
            { name: 'correct', src: 'assets/sounds/correct.mp3' },
            { name: 'wrong', src: 'assets/sounds/wrong.mp3' },
            { name: 'eat', src: 'assets/sounds/eat.mp3' },
            { name: 'reject', src: 'assets/sounds/reject.mp3' },
            { name: 'click', src: 'assets/sounds/click.mp3' }
        ];
        
        this.sounds.toLoad = soundsToLoad.length;
        
        soundsToLoad.forEach(sound => {
            const audio = new Audio();
            audio.src = sound.src;
            audio.oncanplaythrough = () => {
                this.sounds.audio[sound.name] = audio;
                this.sounds.loaded++;
                
                if (this.sounds.loaded === this.sounds.toLoad) {
                    this.sounds.loaded = true;
                }
            };
        });
    }
    
    resizeCanvas() {
        this.dom.canvas.width = window.innerWidth;
        this.dom.canvas.height = window.innerHeight;
        
        // Перерисовка, если игра запущена
        if (this.state.isRunning && this.conveyor) {
            // Обновляем позиции перекрестков
            this.conveyor.crossroads[0].x = this.dom.canvas.width * 0.25;
            this.conveyor.crossroads[1].x = this.dom.canvas.width * 0.75;
            
            // Обновляем позиции чертей
            if (this.devils.length >= 2) {
                this.devils[0].x = this.dom.canvas.width * 0.25;
                this.devils[1].x = this.dom.canvas.width * 0.75;
            }
            
            // Обновляем ответвления
            this.conveyor.updateBranches();
            
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
        
        // Создание двух чертей
        this.devils = [];
        
        // Первый черт (слева)
        const devil1 = new Devil(this, 0);
        devil1.x = this.dom.canvas.width * 0.25; // 25% от ширины экрана
        this.devils.push(devil1);
        
        // Второй черт (справа)
        const devil2 = new Devil(this, 1);
        devil2.x = this.dom.canvas.width * 0.75; // 75% от ширины экрана
        this.devils.push(devil2);
        
        this.mandarins = [];
        
        // Обновляем ответвления конвейера
        this.conveyor.updateBranches();
        
        // Очистка массива эффектов
        this.effects = [];
        
        // Запуск игрового цикла
        this.lastTime = performance.now();
        requestAnimationFrame(this.update);
        
        // Запуск спавна мандаринок с проверкой окончания игры
        this.spawnInterval = setInterval(() => {
            if (this.state.mandarinsLeft > 0) {
                this.spawnMandarin();
            } else if (this.mandarins.length === 0) {
                // Если мандаринки закончились и на конвейере их нет
                this.endGame();
            }
        }, this.settings.spawnInterval);
        
        // Показ игрового экрана
        this.showScreen('game');
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
    
    update(currentTime) {
        // Вычисление deltaTime
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // Обновление игровых объектов
        this.conveyor.update(deltaTime);
        
        // Обновление всех чертей
        for (const devil of this.devils) {
            devil.update(deltaTime);
            
            // Обновляем общее время ожидания, если черт ждет
            if (devil.isWaiting) {
                this.state.totalWaitTime += deltaTime;
            }
        }
        
        // Обновление мандаринок
        this.mandarins.forEach(mandarin => mandarin.update(deltaTime));
        
        // Удаление мандаринок, вышедших за пределы экрана
        this.mandarins = this.mandarins.filter(mandarin => {
            if (mandarin.x > this.dom.canvas.width) {
                return false; // Удаляем мандаринку
            }
            return true;
        });
        
        // Обновление эффектов
        this.effects = this.effects.filter(effect => effect.update(deltaTime));
        
        // Проверка окончания игры
        if (this.state.mandarinsLeft === 0 && this.mandarins.length === 0 && this.state.isRunning) {
            this.endGame();
        }
        
        // Обновление отображения статистики
        this.updateStatsDisplay();
        
        // Отрисовка
        this.draw();
        
        // Продолжение игрового цикла
        if (this.state.isRunning) {
            requestAnimationFrame(this.update);
        }
    }
    
    draw() {
        // Очистка канваса
        this.ctx.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
        
        // Вместо отрисовки фонового изображения, заполним канвас цветом
        this.ctx.fillStyle = '#000000'; // Черный фон
        this.ctx.fillRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
        
        /*
        // Закомментируем отрисовку фона
        this.ctx.drawImage(
            this.resources.images.background,
            0, 0,
            this.dom.canvas.width, this.dom.canvas.height
        );
        */
        
        // Отрисовка конвейера
        this.conveyor.draw(this.ctx);
        
        // Отрисовка всех чертей
        for (const devil of this.devils) {
            devil.draw(this.ctx);
        }
        
        // Отрисовка мандаринок
        this.mandarins.forEach(mandarin => mandarin.draw(this.ctx));
        
        // Отрисовка эффектов
        this.effects.forEach(effect => effect.draw(this.ctx));
    }
    
    handleClick(event) {
        if (this.state.currentScreen !== 'game' || !this.state.isRunning) return;
        
        // Получение координат клика
        const rect = this.dom.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Проверка клика на перекрестке
        const crossroadIndex = this.conveyor.isCrossroadClicked(x, y);
        if (crossroadIndex !== -1) {
            // Поиск ближайшей мандаринки к перекрестку
            const crossroadX = this.conveyor.crossroads[crossroadIndex].x;
            let closestMandarin = null;
            let minDistance = Infinity;
            
            this.mandarins.forEach(mandarin => {
                if (mandarin.y === this.conveyor.y && !mandarin.isDropping && !mandarin.isMovingToCrossroad) {
                    const distance = Math.abs(mandarin.x - crossroadX);
                    
                    // Проверяем, не проехала ли мандаринка перекресток
                    const maxAllowedDistance = mandarin.width / 2 + this.conveyor.crossroads[crossroadIndex].width / 4;
                    
                    if (distance < minDistance && distance < 100 && 
                        !(mandarin.x > crossroadX && distance > maxAllowedDistance)) {
                        minDistance = distance;
                        closestMandarin = mandarin;
                    }
                }
            });
            
            if (closestMandarin) {
                closestMandarin.drop(crossroadIndex);
            }
        }
    }
    
    updateStatsDisplay() {
        this.dom.mandarinsLeftDisplay.textContent = `Осталось: ${this.state.mandarinsLeft}`;
        this.dom.scoreDisplay.textContent = `Счёт: ${this.state.score}`;
        this.dom.timerDisplay.textContent = `Время ожидания: ${(this.state.totalWaitTime / 1000).toFixed(1)}с`;
        
        // Обновляем индикатор прогресса
        const progress = (this.settings.totalMandarins - this.state.mandarinsLeft) / this.settings.totalMandarins * 100;
        document.getElementById('progress-bar').style.width = `${progress}%`;
    }
    
    updateResultsScreen() {
        this.dom.totalMandarinsDisplay.textContent = `Всего мандаринок: ${this.settings.totalMandarins}`;
        this.dom.correctMandarinsDisplay.textContent = `Правильно съедено: ${this.state.correctMandarins}`;
        this.dom.wrongMandarinsDisplay.textContent = `Неправильно направлено: ${this.state.wrongMandarins}`;
        this.dom.totalWaitTimeDisplay.textContent = `Общее время ожидания: ${(this.state.totalWaitTime / 1000).toFixed(1)}с`;
    }
    
    endGame() {
        this.state.isRunning = false;
        clearInterval(this.spawnInterval);
        this.showScreen('results');
    }
    
    playSound(name) {
        if (this.sounds.audio[name]) {
            const sound = this.sounds.audio[name];
            sound.currentTime = 0;
            sound.play();
        }
    }
    
    // Метод для загрузки шрифта
    loadFont(fontName, url) {
        const fontFace = new FontFace(fontName, `url(${url})`);
        fontFace.load().then(function(loadedFace) {
            document.fonts.add(loadedFace);
        }).catch(function(error) {
            console.error('Ошибка загрузки шрифта:', error);
        });
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    const game = new Game();
}); 