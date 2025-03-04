// Основной класс игры
class Game {
    constructor() {
        // Настройки игры
        this.settings = {
            totalMandarins: 100,
            mandarinTypes: ['orange', 'green'],
            mandarinSpeed: 2.8,
            spawnInterval: 2000, // в миллисекундах
            eatingTime: 3000 // в миллисекундах
        };
        
        // Добавляем отладочный режим
        this.debug = false; // Установите в true для отображения отладочной информации
        
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
        
        // Добавляем переменные для отслеживания текущего токена
        this.currentTokenName = null;
        this.tokenShaking = false;
        this.lastTimestamp = null; // Для расчета deltaTime
        
        // Список названий мемкоинов
        this.memecoinNames = [
            "PEPE", "DOGE", "SHIB", "FLOKI", "WOJAK", 
            "TURBO", "MEME", "BONK", "WIF", "MOG",
            "SLERF", "BOME", "BRETT", "TOSHI", "COQ",
            "MILADY", "TRUMP", "HARAMBE", "MOON", "TENDIES",
            "CHAD", "CUMMIES", "DOBO", "ELON", "GIGA",
            "HODL", "LAMBO", "MOON", "PUMP", "REKT",
            "SAFEMOON", "SATS", "TENDIES", "WAGMI", "WENLAMBO",
            "WOJAK", "YOLO", "ZYZZ", "APE", "BASED",
            "BULL", "CHAD", "COPE", "CRAB", "DEFI",
            "DIAMOND", "FOMO", "FUD", "GWEI", "HODL"
        ];
        
        // Массив для отслеживания использованных названий
        this.usedMemecoinNames = [];
        
        // Массив для объектов мемкоинов
        this.memecoins = [];
        
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
            { name: 'splash', src: 'assets/images/splash.png' },
            { name: 'poop', src: 'assets/images/poop.png' },
            { name: 'pumpfun', src: 'assets/images/pumpfun.png' }
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
        this.state.currentScreen = 'game';
        this.state.mandarinsLeft = this.settings.totalMandarins;
        this.state.score = 0;
        this.state.correctMandarins = 0;
        this.state.wrongMandarins = 0;
        this.state.totalWaitTime = 0;
        this.state.isRunning = true;
        
        // Сброс текущего токена и анимации
        this.currentTokenName = null;
        this.tokenShaking = false;
        this.lastTimestamp = null; // Сброс временной метки для deltaTime
        
        // Обновление отображения статистики
        this.updateStatsDisplay();
        
        // Очистка массивов объектов
        this.mandarins = [];
        this.devils = [];
        
        // Создание чертей
        this.devils.push(new Devil(this, 0));
        this.devils.push(new Devil(this, 1));
        
        // Позиционирование чертей
        this.devils[0].x = this.dom.canvas.width * 0.25;
        this.devils[1].x = this.dom.canvas.width * 0.75;
        
        // Создание конвейера
        this.conveyor = new Conveyor(this);
        this.conveyor.updateBranches();
        
        // Очистка массива эффектов
        this.effects = [];
        
        // Сброс списка использованных названий мемкоинов
        this.usedMemecoinNames = [];
        this.memecoins = [];
        
        // Запуск игрового цикла
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
        
        console.log("Игра запущена!");
    }
    
    spawnMandarin() {
        if (this.state.mandarinsLeft <= 0) return;
        
        // Уменьшаем счетчик оставшихся мандаринок
        this.state.mandarinsLeft--;
        
        // Обновляем отображение
        this.updateStatsDisplay();
        
        // Создаем новую мандаринку
        const type = this.settings.mandarinTypes[Math.floor(Math.random() * this.settings.mandarinTypes.length)];
        const mandarin = new Mandarin(this, type);
        
        // Добавляем мандаринку в массив
        this.mandarins.push(mandarin);
        
        console.log("Создана новая мандаринка типа:", type);
    }
    
    update(timestamp) {
        if (!this.state.isRunning) return;
        
        // Расчет deltaTime
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Обновление конвейера
        this.conveyor.update(deltaTime);
        
        // Обновление чертей
        for (const devil of this.devils) {
            devil.update(deltaTime);
            
            // Обновление общего времени ожидания
            if (devil.isWaiting) {
                this.state.totalWaitTime += deltaTime;
                this.updateStatsDisplay();
            }
        }
        
        // Обновление мандаринок
        this.mandarins = this.mandarins.filter(mandarin => {
            // Обновляем позицию мандаринки
            const isActive = mandarin.update(deltaTime);
            
            // Проверка на съедание мандаринки
            if (mandarin.isDropping && !mandarin.isEaten) {
                const devilIndex = mandarin.targetDevilIndex;
                const devil = this.devils[devilIndex];
                
                // Проверка столкновения с чертом
                if (
                    Math.abs(mandarin.x - devil.x) < 50 &&
                    Math.abs(mandarin.y - devil.y) < 50 &&
                    devil.canEat
                ) {
                    // Проверка типа мандаринки
                    if (mandarin.type === devil.desiredType) {
                        // Правильная мандаринка
                        devil.eat(mandarin);
                        mandarin.isEaten = true;
                        this.state.score += 10;
                        this.state.correctMandarins++;
                    } else {
                        // Неправильная мандаринка
                        devil.reject(mandarin);
                        this.state.wrongMandarins++;
                        
                        // Создаем эффект отбрасывания
                        const splash = {
                            x: devil.x,
                            y: devil.y,
                            width: 100,
                            height: 100,
                            opacity: 1,
                            fadeSpeed: 0.05,
                            update: function(dt) {
                                this.opacity -= this.fadeSpeed;
                                return this.opacity > 0;
                            },
                            draw: (ctx) => {
                                ctx.globalAlpha = splash.opacity;
                                ctx.drawImage(
                                    this.resources.images.splash,
                                    splash.x - splash.width / 2,
                                    splash.y - splash.height / 2,
                                    splash.width,
                                    splash.height
                                );
                                ctx.globalAlpha = 1;
                            }
                        };
                        
                        this.effects.push(splash);
                    }
                    
                    this.updateStatsDisplay();
                }
            }
            
            return isActive;
        });
        
        // Обновление эффектов
        this.effects = this.effects.filter(effect => effect.update(deltaTime));
        
        // Обновление мемкоинов
        this.memecoins = this.memecoins.filter(memecoin => memecoin.update(deltaTime));
        
        // Проверка окончания игры
        if (this.state.mandarinsLeft === 0 && this.mandarins.length === 0) {
            this.endGame();
            return;
        }
        
        // Отрисовка
        this.draw();
        
        // Запрос следующего кадра
        requestAnimationFrame(this.update);
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
        
        // Отрисовка мемкоинов
        this.memecoins.forEach(memecoin => memecoin.draw(this.ctx));
        
        // Отрисовка нижней панели (серый прямоугольник)
        const panelHeight = this.dom.canvas.height * 0.15;
        const panelY = this.dom.canvas.height - panelHeight;
        
        this.ctx.fillStyle = '#333333'; // Серый цвет
        this.ctx.fillRect(0, panelY, this.dom.canvas.width, panelHeight);
        
        // Отрисовка логотипа
        if (this.resources.images.pumpfun && this.resources.images.pumpfun.complete) {
            const logoWidth = panelHeight * 1.5; // Ширина логотипа в 1.5 раза больше высоты
            const logoHeight = panelHeight * 0.8; // Высота логотипа 80% от высоты панели
            const logoY = panelY + (panelHeight - logoHeight) / 2; // Центрирование по вертикали
            
            this.ctx.drawImage(
                this.resources.images.pumpfun,
                20, // Отступ слева
                logoY,
                logoWidth,
                logoHeight
            );
        }
        
        // Отрисовка текстового блока с названием токена
        this.ctx.font = '24px Cornerita';
        this.ctx.fillStyle = '#FFFFFF';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        
        // Заголовок "King of the hill"
        this.ctx.fillText(
            'King of the hill',
            this.dom.canvas.width / 2,
            panelY + panelHeight * 0.3
        );
        
        // Название последнего токена
        console.log("Текущий токен в draw:", this.currentTokenName); // Отладочный вывод
        
        if (this.currentTokenName) {
            // Если токен трясется, применяем смещение
            let tokenX = this.dom.canvas.width / 2;
            if (this.tokenShaking) {
                tokenX += Math.sin(Date.now() / 30) * 5; // Тряска влево-вправо
            }
            
            this.ctx.font = '32px Cornerita';
            this.ctx.fillStyle = '#FFFFFF';
            this.ctx.fillText(
                this.currentTokenName,
                tokenX,
                panelY + panelHeight * 0.7
            );
        } else {
            // Если токен еще не установлен, показываем заглушку
            this.ctx.font = '32px Cornerita';
            this.ctx.fillStyle = '#888888'; // Серый цвет для заглушки
            this.ctx.fillText(
                '$???',
                this.dom.canvas.width / 2,
                panelY + panelHeight * 0.7
            );
        }
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
    
    // Метод для получения случайного неиспользованного названия мемкоина
    getRandomMemecoinName() {
        // Фильтруем только неиспользованные названия
        const availableNames = this.memecoinNames.filter(name => !this.usedMemecoinNames.includes(name));
        
        // Если все названия использованы, сбрасываем список использованных
        if (availableNames.length === 0) {
            this.usedMemecoinNames = [];
            return this.memecoinNames[Math.floor(Math.random() * this.memecoinNames.length)];
        }
        
        // Выбираем случайное название из доступных
        const randomName = availableNames[Math.floor(Math.random() * availableNames.length)];
        
        // Добавляем в список использованных
        this.usedMemecoinNames.push(randomName);
        
        return randomName;
    }
    
    // Метод для создания нового объекта мемкоина
    createMemecoin(x, y) {
        const name = this.getRandomMemecoinName();
        console.log("Создаем мемкоин с названием:", name);
        const memecoin = new Memecoin(this, x, y, name);
        this.memecoins.push(memecoin);
    }
    
    // Метод для установки текущего токена и запуска анимации тряски
    setCurrentToken(tokenName) {
        console.log("Устанавливаем текущий токен:", tokenName); // Отладочный вывод
        
        if (!tokenName) {
            console.error("Попытка установить пустое имя токена");
            return;
        }
        
        // Добавляем символ $ перед названием (если его еще нет)
        this.currentTokenName = tokenName.startsWith('$') ? tokenName : `$${tokenName}`;
        
        // Запускаем анимацию тряски
        this.tokenShaking = true;
        
        // Останавливаем тряску через 500 мс
        setTimeout(() => {
            this.tokenShaking = false;
        }, 500);
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    const game = new Game();
}); 