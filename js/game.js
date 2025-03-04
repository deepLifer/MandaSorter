// Основной класс игры
class Game {
    constructor() {
        // Настройки игры
        this.settings = {
            totalMandarins: 20,
            mandarinTypes: ['orange', 'green'],
            mandarinSpeed: 2.8,
            spawnInterval: 2000, // в миллисекундах
            eatingTime: 3000 // в миллисекундах
        };
        
        // Отключаем отладочный режим
        this.debug = false; // Было true
        
        // Состояние игры
        this.state = {
            currentScreen: 'start',
            mandarinsLeft: this.settings.totalMandarins,
            score: 0,
            correctMandarins: 0,
            wrongMandarins: 0,
            totalWaitTime: 0,
            isRunning: false,
            gameTime: 0 // Добавляем переменную для отслеживания времени игры
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
        
        // Добавляем массив с репликами надзирателя
        this.supervisorQuotes = [
            "Работай быстрее, время - мемкоины!",
            "Мы теряем деньги, пока ты ленишься!",
            "Каждая секунда простоя - это упущенная прибыль!",
            "Черти не должны ждать, они должны есть!",
            "Быстрее сортируй мандаринки, или я найду того, кто справится лучше!",
            "Ты что, заснул? Шевелись!",
            "Мемкоины сами себя не заработают!",
            "Если черти ждут - ты плохо работаешь!",
            "Каждая правильная мандаринка - это прибыль для нашей компании!",
            "Ты слишком медленный для ада!",
            "В аду нет перерывов, только работа!",
            "Сатана следит за твоей производительностью!",
            "Твоя эффективность ниже плановой!",
            "Ускорься, или я отправлю тебя в котел с кипящей смолой!",
            "Черти голодные, а ты копаешься!",
            "Каждая ошибка - это минус к твоей премии!",
            "Ты работаешь медленнее, чем улитка в патоке!",
            "Если бы лень была талантом, ты был бы гением!",
            "Шевели пальцами быстрее, чем языком!",
            "В следующий раз я найму обезьяну - она будет работать быстрее!"
        ];
        
        // Текущая реплика надзирателя
        this.currentQuote = "";
        // Таймер для смены реплик
        this.quoteTimer = 0;
        // Интервал смены реплик (в миллисекундах)
        this.quoteInterval = 5000;
        
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
        
        // Проверяем, существует ли кнопка меню
        if (this.dom.menuButton) {
            this.dom.menuButton.addEventListener('click', () => this.showScreen('start'));
        }
        
        // Исправляем привязку обработчика кликов, чтобы сохранить контекст this
        this.dom.canvas.addEventListener('click', (event) => this.handleClick(event));
        
        console.log("Инициализация игры завершена, обработчики событий установлены");
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
            { name: 'pumpfun', src: 'assets/images/pumpfun.png' },
            { name: 'logo', src: 'assets/images/logo.png' },
            { name: 'satan', src: 'assets/images/satan.png' } // Добавляем изображение надзирателя
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
        this.state.gameTime = 0;
        
        // Скрываем старый блок статистики
        const gameStats = document.getElementById('game-stats');
        if (gameStats) {
            gameStats.style.display = 'none';
        }
        
        // Сброс игровых объектов
        this.conveyor = new Conveyor(this);
        this.devils = [];
        this.mandarins = [];
        this.effects = [];
        this.memecoins = [];
        
        // Создаем чертей
        const devilCount = 2;
        const canvasWidth = this.dom.canvas.width;
        
        // Очищаем существующие перекрестки
        this.conveyor.crossroads = [];
        
        for (let i = 0; i < devilCount; i++) {
            const devil = new Devil(this, i);
            
            // Равномерно распределяем чертей по ширине канваса
            devil.x = canvasWidth * (i + 1) / (devilCount + 1);
            
            this.devils.push(devil);
            
            // Добавляем перекресток прямо над чертом
            this.conveyor.crossroads.push({
                x: devil.x,
                y: this.conveyor.y,
                width: 40,
                height: 40,
                visualWidth: 30,
                visualHeight: 30
            });
        }
        
        // Обновляем ответвления от перекрестков к чертям
        if (typeof this.conveyor.updateBranches === 'function') {
            this.conveyor.updateBranches();
        }
        
        console.log("Игра запущена, перекрестки созданы:", this.conveyor.crossroads);
        
        // Сброс таймера для спавна мандаринок
        this.spawnTimer = 0;
        
        // Сброс таймера для смены реплик надзирателя
        this.quoteTimer = 0;
        this.currentQuote = "";
        
        // Показываем игровой экран
        this.showScreen('game');
        
        // Запускаем игровой цикл
        this.lastTimestamp = null;
        requestAnimationFrame(this.update);
    }
    
    spawnMandarin() {
        // Проверяем, остались ли мандаринки для спавна
        if (this.state.mandarinsLeft <= 0) return;
        
        // Выбираем случайный тип мандаринки
        const randomIndex = Math.floor(Math.random() * this.settings.mandarinTypes.length);
        const type = this.settings.mandarinTypes[randomIndex];
        
        // Создаем новую мандаринку
        const mandarin = new Mandarin(this, type);
        
        // Устанавливаем начальную позицию
        mandarin.x = -mandarin.width;
        mandarin.y = this.conveyor.y;
        
        // Устанавливаем скорость движения
        mandarin.speedX = this.settings.mandarinSpeed;
        mandarin.speedY = 0;
        
        // Добавляем мандаринку в массив
        this.mandarins.push(mandarin);
        
        // Уменьшаем количество оставшихся мандаринок
        this.state.mandarinsLeft--;
        
        console.log(`Создана новая мандаринка типа ${type}. Осталось: ${this.state.mandarinsLeft}`);
    }
    
    update(timestamp) {
        // Если игра не запущена, не обновляем
        if (!this.state.isRunning) return;
        
        // Вычисляем deltaTime
        if (!this.lastTimestamp) {
            this.lastTimestamp = timestamp;
        }
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Обновляем время игры
        this.state.gameTime += deltaTime;
        
        // Очищаем канвас
        this.ctx.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
        
        // Отрисовываем фон
        this.drawBackground();
        
        // Обновляем и отрисовываем конвейер
        this.conveyor.draw(this.ctx);
        
        // Обновляем и отрисовываем чертей
        for (const devil of this.devils) {
            devil.update(deltaTime);
            devil.draw(this.ctx);
        }
        
        // Обновляем и отрисовываем мандаринки
        for (let i = this.mandarins.length - 1; i >= 0; i--) {
            const mandarin = this.mandarins[i];
            mandarin.update(deltaTime);
            mandarin.draw(this.ctx);
        }
        
        // Обновляем и отрисовываем эффекты
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            const isActive = effect.update(deltaTime);
            
            if (isActive) {
                effect.draw(this.ctx);
            } else {
                this.effects.splice(i, 1);
            }
        }
        
        // Обновляем и отрисовываем мемкоины
        for (let i = this.memecoins.length - 1; i >= 0; i--) {
            const memecoin = this.memecoins[i];
            const isActive = memecoin.update(deltaTime);
            
            if (isActive) {
                memecoin.draw(this.ctx);
            } else {
                this.memecoins.splice(i, 1);
            }
        }
        
        // Спавним новые мандаринки
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.settings.spawnInterval && this.state.mandarinsLeft > 0) {
            this.spawnMandarin();
            this.spawnTimer = 0;
        }
        
        // Обновляем общее время простоя
        this.updateTotalWaitTime(deltaTime);
        
        // Обновляем реплику надзирателя
        this.updateSupervisorQuote(deltaTime);
        
        // Отрисовываем верхний блок с надзирателем и результатами
        this.drawTopPanel(this.ctx);
        
        // Отрисовываем нижний блок с логотипом и текущим токеном
        this.drawLogo(this.ctx);
        
        // Проверяем условие завершения игры
        if (this.state.mandarinsLeft <= 0 && this.mandarins.length === 0) {
            this.endGame();
            return;
        }
        
        // Запрашиваем следующий кадр
        requestAnimationFrame(this.update.bind(this));
    }
    
    draw() {
        // Очистка канваса
        this.ctx.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
        
        // Отрисовка фона
        if (this.resources.images.background) {
            this.ctx.drawImage(this.resources.images.background, 0, 0, this.dom.canvas.width, this.dom.canvas.height);
        }
        
        // Отрисовка конвейера
        this.conveyor.draw(this.ctx);
        
        // Отрисовка чертей
        for (const devil of this.devils) {
            devil.draw(this.ctx);
        }
        
        // Отрисовка мандаринок
        for (const mandarin of this.mandarins) {
            mandarin.draw(this.ctx);
        }
        
        // Отрисовка эффектов
        for (const effect of this.effects) {
            effect.draw(this.ctx);
        }
        
        // Отрисовка мемкоинов
        for (const memecoin of this.memecoins) {
            memecoin.draw(this.ctx);
        }
        
        // Отрисовка перекрестков в отладочном режиме
        if (this.debug) {
            for (let i = 0; i < this.conveyor.crossroads.length; i++) {
                const crossroad = this.conveyor.crossroads[i];
                this.ctx.strokeStyle = 'blue';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(
                    crossroad.x - crossroad.width / 2,
                    crossroad.y - crossroad.height / 2,
                    crossroad.width,
                    crossroad.height
                );
                
                // Отображение координат перекрестка
                this.ctx.fillStyle = 'white';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(`Crossroad ${i}: (${Math.round(crossroad.x)}, ${Math.round(crossroad.y)})`, 
                    crossroad.x, crossroad.y - crossroad.height / 2 - 10);
            }
        }
    }
    
    handleClick(event) {
        // Проверяем, запущена ли игра
        if (!this.state.isRunning) return;
        
        // Получаем координаты клика относительно канваса
        const rect = this.dom.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        console.log(`Клик по координатам: (${x}, ${y})`);
        
        // Проверяем, был ли клик по черту
        for (let i = 0; i < this.devils.length; i++) {
            const devil = this.devils[i];
            
            // Проверяем, попал ли клик в область черта
            if (this.isPointInRect(x, y, devil.x - devil.width / 2, devil.y - devil.height / 2, devil.width, devil.height)) {
                console.log(`Клик по черту ${i}`);
                
                // Находим соответствующий перекресток
                const crossroad = this.conveyor.crossroads[i];
                
                // Находим ближайшую мандаринку к перекрестку
                const closestMandarin = this.findClosestMandarinToPoint(crossroad.x);
                
                if (closestMandarin) {
                    console.log(`Найдена ближайшая мандаринка: ${closestMandarin.type}`);
                    
                    // Проверяем, не движется ли уже мандаринка
                    if (closestMandarin.isMovingToPoint || closestMandarin.isDropping) {
                        console.log("Мандаринка уже в движении");
                        return;
                    }
                    
                    // Направляем мандаринку к перекрестку
                    this.sendMandarinToDevil(closestMandarin, i);
                }
                
                return; // Выходим из обработчика после обработки клика по черту
            }
        }
        
        // Проверяем, был ли клик по перекрестку
        for (let i = 0; i < this.conveyor.crossroads.length; i++) {
            const crossroad = this.conveyor.crossroads[i];
            
            // Проверяем, попал ли клик в область перекрестка
            if (this.isPointInRect(x, y, crossroad.x - crossroad.width / 2, crossroad.y - crossroad.height / 2, crossroad.width, crossroad.height)) {
                console.log(`Клик по перекрестку ${i}`);
                
                // Находим ближайшую мандаринку к перекрестку
                const closestMandarin = this.findClosestMandarinToPoint(crossroad.x);
                
                if (closestMandarin) {
                    console.log(`Найдена ближайшая мандаринка: ${closestMandarin.type}`);
                    
                    // Проверяем, не движется ли уже мандаринка
                    if (closestMandarin.isMovingToPoint || closestMandarin.isDropping) {
                        console.log("Мандаринка уже в движении");
                        return;
                    }
                    
                    // Направляем мандаринку к перекрестку и затем к черту
                    this.sendMandarinToDevil(closestMandarin, i);
                }
                
                break;
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
        try {
            // Добавляем изображение надзирателя
            const supervisorContainer = document.querySelector('.supervisor-image-container');
            if (supervisorContainer) {
                supervisorContainer.innerHTML = '';
                
                if (this.resources.images.satan && this.resources.images.satan.complete) {
                    const img = document.createElement('img');
                    img.src = this.resources.images.satan.src;
                    img.alt = 'Надзиратель';
                    supervisorContainer.appendChild(img);
                }
            }
            
            // Обновляем текст результатов
            const earnedMndElement = document.getElementById('earned-mnd');
            if (earnedMndElement) {
                earnedMndElement.innerHTML = `Мы заработали <span class="highlight">${this.state.correctMandarins * 10} $MND</span> благодаря <span class="highlight">${this.state.correctMandarins}</span> правильным мандаринкам.`;
            } else {
                console.warn('Элемент earned-mnd не найден');
            }
            
            const lostMndElement = document.getElementById('lost-mnd');
            if (lostMndElement) {
                lostMndElement.innerHTML = `Но из-за тебя недополучили <span class="highlight">${this.state.wrongMandarins * 10} $MND</span> из-за <span class="highlight">${this.state.wrongMandarins}</span> неправильных мандаринок.`;
            } else {
                console.warn('Элемент lost-mnd не найден');
            }
            
            const punishmentElement = document.getElementById('punishment');
            if (punishmentElement) {
                // Вычисляем количество криптопалок (1 за каждую неправильную мандаринку + 1 за каждые 5 секунд простоя)
                const waitTimeSeconds = Math.floor(this.state.totalWaitTime / 1000);
                const waitTimePenalty = Math.floor(waitTimeSeconds / 5);
                const totalPunishment = this.state.wrongMandarins + waitTimePenalty;
                
                punishmentElement.innerHTML = `Ты приговариваешься к <span class="highlight">${totalPunishment}</span> криптопалкам!`;
            } else {
                console.warn('Элемент punishment не найден');
            }
        } catch (error) {
            console.error('Ошибка при обновлении экрана результатов:', error);
        }
    }
    
    endGame() {
        console.log('Игра завершена!');
        
        // Останавливаем игру
        this.state.isRunning = false;
        
        // Обновляем статистику
        this.updateStatsDisplay();
        
        // Показываем экран результатов
        this.showScreen('results');
        
        // Обновляем экран результатов после небольшой задержки, чтобы DOM успел обновиться
        setTimeout(() => {
            this.updateResultsScreen();
        }, 100);
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
        try {
            const name = this.getRandomMemecoinName();
            console.log("Создаем мемкоин с названием:", name);
            const memecoin = new Memecoin(this, x, y, name);
            
            // Проверяем, что объект создан корректно
            if (memecoin && typeof memecoin.update === 'function') {
                this.memecoins.push(memecoin);
            } else {
                console.error("Не удалось создать корректный объект мемкоина");
            }
        } catch (error) {
            console.error("Ошибка при создании мемкоина:", error);
        }
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
    
    // Метод для проверки, попал ли клик по черту
    isClickOnDevil(x, y, devil) {
        // Проверяем, попал ли клик в прямоугольную область черта
        return (
            x >= devil.x - devil.width / 2 &&
            x <= devil.x + devil.width / 2 &&
            y >= devil.y - devil.height / 2 &&
            y <= devil.y + devil.height / 2
        );
    }
    
    // Метод для нахождения ближайшей мандаринки к точке
    findClosestMandarinToPoint(x) {
        let closestMandarin = null;
        let minDistance = Infinity;
        const maxDistance = 60; // Максимальное расстояние для поворота (60% от ширины мандаринки)
        
        for (const mandarin of this.mandarins) {
            // Пропускаем мандаринки, которые уже движутся к точке или падают
            if (mandarin.isMovingToPoint || mandarin.isDropping) continue;
            
            // Вычисляем расстояние от мандаринки до точки
            const distance = Math.abs(mandarin.x - x);
            
            // Если мандаринка ближе предыдущей ближайшей и находится в пределах максимального расстояния
            if (distance < minDistance && distance <= maxDistance) {
                minDistance = distance;
                closestMandarin = mandarin;
            }
        }
        
        return closestMandarin;
    }
    
    // Метод для отрисовки верхнего блока
    drawTopPanel(ctx) {
        // Размеры и позиция панели
        const panelHeight = 100;
        const panelY = 0;
        
        // Фон панели
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, panelY, this.dom.canvas.width, panelHeight);
        
        // Отрисовка изображения надзирателя
        if (this.resources.images.satan && this.resources.images.satan.complete) {
            const imageSize = panelHeight * 0.8;
            const imageX = 20;
            const imageY = panelY + (panelHeight - imageSize) / 2;
            
            // Добавляем неоновую обводку вокруг изображения
            ctx.strokeStyle = '#8A2BE2'; // Фиолетово-синий цвет
            ctx.shadowColor = '#8A2BE2';
            ctx.shadowBlur = 10;
            ctx.lineWidth = 3;
            ctx.strokeRect(imageX - 5, imageY - 5, imageSize + 10, imageSize + 10);
            
            // Изображение
            ctx.drawImage(
                this.resources.images.satan,
                imageX,
                imageY,
                imageSize,
                imageSize
            );
        }
        
        // Отрисовка блока с результатами (перемещаем перед текстовым блоком)
        const resultsX = this.dom.canvas.width - 200;
        const resultsY = panelY + 20;
        
        // Добавляем фон для блока результатов, чтобы текст не перекрывался
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Полупрозрачный черный
        ctx.fillRect(resultsX - 10, resultsY - 10, 190, 95);
        
        // Добавляем рамку для блока результатов
        ctx.strokeStyle = '#4B0082'; // Индиго для рамки
        ctx.lineWidth = 2;
        ctx.strokeRect(resultsX - 10, resultsY - 10, 190, 95);
        
        ctx.font = '16px Cornerita';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        
        // Преобразуем миллисекунды в секунды с одним десятичным знаком для отображения
        const totalWaitTimeSeconds = (this.state.totalWaitTime / 1000).toFixed(1);
        
        ctx.fillText(`Осталось: ${this.state.mandarinsLeft}`, resultsX, resultsY);
        ctx.fillText(`Простой: ${totalWaitTimeSeconds}с`, resultsX, resultsY + 25);
        ctx.fillText(`Правильно: ${this.state.correctMandarins}`, resultsX, resultsY + 50);
        ctx.fillText(`Неправильно: ${this.state.wrongMandarins}`, resultsX, resultsY + 75);
        
        // Отрисовка текстового блока с репликой
        const quoteX = 20 + panelHeight * 0.8 + 20; // После изображения + отступ
        const quoteY = panelY + panelHeight * 0.3;
        const quoteWidth = this.dom.canvas.width - quoteX - 220; // Уменьшаем ширину, чтобы не перекрывать блок результатов
        
        ctx.font = '18px Cornerita';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Отрисовка текста реплики с переносом строк
        this.wrapText(ctx, this.currentQuote, quoteX, quoteY, quoteWidth, 24);
    }
    
    // Метод для отрисовки логотипа и текущего токена
    drawLogo(ctx) {
        // Размеры и позиция нижней панели
        const panelHeight = 60;
        const panelY = this.dom.canvas.height - panelHeight;
        
        // Фон панели
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, panelY, this.dom.canvas.width, panelHeight);
        
        // Отрисовка логотипа "King of the Hill"
        ctx.font = '24px Cornerita';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.fillText("King of the Hill", 20, panelY + panelHeight / 2);
        
        // Отрисовка текущего токена
        if (this.currentTokenName) {
            const tokenX = this.dom.canvas.width - 200;
            const tokenY = panelY + panelHeight / 2;
            
            // Фон для токена
            ctx.fillStyle = 'rgba(75, 0, 130, 0.7)'; // Полупрозрачный индиго
            ctx.beginPath();
            ctx.roundRect(tokenX - 10, tokenY - 15, 190, 30, 5);
            ctx.fill();
            
            // Текст токена
            ctx.font = '20px Cornerita';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'center';
            
            // Добавляем эффект тряски для токена
            let displayX = tokenX + 85;
            let displayY = tokenY;
            
            if (this.tokenShaking) {
                displayX += Math.random() * 4 - 2;
                displayY += Math.random() * 4 - 2;
            }
            
            ctx.fillText(`$${this.currentTokenName}`, displayX, displayY);
        }
    }
    
    // Метод для отрисовки фона
    drawBackground() {
        if (this.resources.images.background && this.resources.images.background.complete) {
            this.ctx.drawImage(this.resources.images.background, 0, 0, this.dom.canvas.width, this.dom.canvas.height);
        } else {
            this.ctx.fillStyle = '#87CEEB'; // Голубой фон
            this.ctx.fillRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
        }
    }
    
    // Метод для обновления общего времени простоя чертей
    updateTotalWaitTime(deltaTime) {
        // Подсчитываем время простоя для каждого черта
        for (const devil of this.devils) {
            if (devil.isWaiting) {
                this.state.totalWaitTime += deltaTime;
            }
        }
    }
    
    // Метод для обновления отображения таймера
    updateTimerDisplay() {
        // Преобразуем миллисекунды в секунды с одним десятичным знаком
        const totalWaitTimeSeconds = (this.state.totalWaitTime / 1000).toFixed(1);
        
        // Обновляем отображение
        this.dom.timerDisplay.textContent = `${totalWaitTimeSeconds}с`;
    }
    
    // Метод для обновления реплики надзирателя
    updateSupervisorQuote(deltaTime) {
        this.quoteTimer += deltaTime;
        
        // Если прошло достаточно времени или это первая реплика
        if (this.quoteTimer >= this.quoteInterval || this.currentQuote === "") {
            // Выбираем случайную реплику
            const randomIndex = Math.floor(Math.random() * this.supervisorQuotes.length);
            this.currentQuote = this.supervisorQuotes[randomIndex];
            
            // Сбрасываем таймер
            this.quoteTimer = 0;
        }
    }
    
    // Проверим метод isPointInRect
    isPointInRect(x, y, rectX, rectY, rectWidth, rectHeight) {
        return (
            x >= rectX &&
            x <= rectX + rectWidth &&
            y >= rectY &&
            y <= rectY + rectHeight
        );
    }
    
    // Метод для отправки мандаринки к черту через перекресток
    sendMandarinToDevil(mandarin, devilIndex) {
        // Получаем перекресток и черта
        const crossroad = this.conveyor.crossroads[devilIndex];
        const devil = this.devils[devilIndex];
        
        if (!crossroad || !devil) {
            console.error(`Перекресток или черт с индексом ${devilIndex} не найден`);
            return;
        }
        
        // Проверяем расстояние от мандаринки до перекрестка
        const distance = Math.abs(mandarin.x - crossroad.x);
        const maxDistance = mandarin.width * 0.6; // 60% от ширины мандаринки
        
        if (distance > maxDistance) {
            console.log(`Мандаринка слишком далеко от перекрестка: ${distance.toFixed(2)}px, максимум: ${maxDistance.toFixed(2)}px`);
            return;
        }
        
        console.log(`Отправляем мандаринку типа ${mandarin.type} к черту ${devilIndex}, который хочет ${devil.wantedMandarinType}`);
        
        // Направляем мандаринку к перекрестку
        mandarin.moveToPoint(crossroad.x, crossroad.y, () => {
            // После достижения перекрестка, направляем мандаринку к черту
            mandarin.dropTo(devil.x, devil.y, () => {
                // Проверяем, правильная ли мандаринка для этого черта
                if (mandarin.type === devil.wantedMandarinType) {
                    console.log(`Черт ${devilIndex} получил правильную мандаринку типа ${mandarin.type}!`);
                    devil.eatMandarin(mandarin);
                    this.state.correctMandarins++;
                    this.state.score += 10;
                } else {
                    console.log(`Черт ${devilIndex} получил неправильную мандаринку типа ${mandarin.type}, он хотел ${devil.wantedMandarinType}!`);
                    devil.rejectMandarin(mandarin);
                    this.state.wrongMandarins++;
                }
                
                // Удаляем мандаринку из массива
                const index = this.mandarins.indexOf(mandarin);
                if (index !== -1) {
                    this.mandarins.splice(index, 1);
                }
            });
        });
    }
    
    // Метод для переноса текста
    wrapText(ctx, text, x, y, maxWidth, lineHeight) {
        const words = text.split(' ');
        let line = '';
        let lineCount = 0;
        
        for (let n = 0; n < words.length; n++) {
            const testLine = line + words[n] + ' ';
            const metrics = ctx.measureText(testLine);
            const testWidth = metrics.width;
            
            if (testWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y + lineCount * lineHeight);
                line = words[n] + ' ';
                lineCount++;
            } else {
                line = testLine;
            }
        }
        
        ctx.fillText(line, x, y + lineCount * lineHeight);
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    const game = new Game();
}); 