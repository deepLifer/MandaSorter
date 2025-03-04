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
        this.currentTokenName = "YASC";
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
        this.initEventListeners();
        
        console.log("Инициализация игры завершена, обработчики событий установлены");
    }
    
    initEventListeners() {
        // Обработчик клика по канвасу
        this.dom.canvas.addEventListener('click', this.handleClick.bind(this));
        
        // Обработчик клика по кнопке "Начать игру"
        this.dom.startButton.addEventListener('click', () => {
            console.log('Нажата кнопка "Начать игру"');
            this.startGame();
        });
        
        // Обработчик клика по кнопке "Как играть"
        this.dom.howToPlayButton.addEventListener('click', () => {
            console.log('Нажата кнопка "Как играть"');
            this.showScreen('howToPlay');
        });
        
        // Обработчик клика по кнопке "Назад в меню"
        this.dom.backToMenuButton.addEventListener('click', () => {
            console.log('Нажата кнопка "Назад в меню"');
            this.showScreen('start');
        });
        
        // Обработчик клика по кнопке "Играть снова"
        this.dom.playAgainButton.addEventListener('click', () => {
            console.log('Нажата кнопка "Играть снова"');
            this.startGame();
        });
        
        // Обработчик изменения размера окна
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
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
            { name: 'satan', src: 'assets/images/satan.png' },
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
        console.log('Начинаем игру!');
        
        // Сбрасываем состояние игры
        this.state.mandarinsLeft = this.settings.totalMandarins;
        this.state.score = 0;
        this.state.correctMandarins = 0;
        this.state.wrongMandarins = 0;
        this.state.totalWaitTime = 0;
        this.state.gameTime = 0;
        this.state.isRunning = true;
        
        // Очищаем массивы объектов
        this.mandarins = [];
        this.effects = [];
        this.memecoins = [];
        this.usedMemecoinNames = [];
        
        // Сбрасываем таймеры
        this.spawnTimer = 0;
        this.quoteTimer = 0;
        this.lastTimestamp = null;
        
        // Показываем игровой экран
        this.showScreen('game');
        
        // Создаем конвейер примерно на середине экрана
        const topPanelHeight = 100; // Высота верхней панели с надзирателем
        const statsPanelHeight = 40; // Высота панели статистики
        
        // Вычисляем позицию конвейера так, чтобы он был примерно на середине экрана
        // Учитываем высоту верхней панели, панели статистики и нижней панели (60px)
        const availableHeight = this.dom.canvas.height - topPanelHeight - statsPanelHeight - 60;
        const conveyorY = topPanelHeight + statsPanelHeight + (availableHeight * 0.4); // 40% от доступной высоты
        
        this.conveyor = new Conveyor(this);
        this.conveyor.y = conveyorY;
        
        // Создаем чертей
        this.devils = [];
        
        // Создаем двух чертей
        for (let i = 0; i < 2; i++) {
            const devil = new Devil(this, i);
            
            // Позиционируем чертей равномерно по ширине экрана
            const spacing = this.dom.canvas.width / 3;
            devil.x = spacing * (i + 1);
            
            // Позиционируем чертей ниже конвейера
            devil.y = conveyorY + 150; // Расстояние от конвейера до чертей
            devil.originalY = devil.y; // Сохраняем исходную позицию Y для анимации
            
            this.devils.push(devil);
        }
        
        // Создаем перекрестки над чертями
        this.conveyor.crossroads = [];
        for (let i = 0; i < this.devils.length; i++) {
            const devil = this.devils[i];
            this.conveyor.crossroads.push({
                x: devil.x,
                y: this.conveyor.y,
                width: 40,
                height: 40,
                visualWidth: 30,
                visualHeight: 30
            });
        }
        
        // Обновляем ответвления конвейера к чертям
        this.conveyor.updateBranches();
        
        // Обновляем отображение статистики
        this.updateStatsDisplay();
        
        // Запускаем игровой цикл
        requestAnimationFrame(this.update.bind(this));
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
        
        // Отрисовываем верхний блок с надзирателем
        this.drawTopPanel(this.ctx);
        
        // Отрисовываем панель статистики
        this.drawStatsPanel(this.ctx);
        
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
        // Получаем координаты клика относительно канваса
        const rect = this.dom.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        console.log(`Клик по координатам (${x}, ${y})`);
        
        // Если игра не запущена, игнорируем клики по канвасу
        if (!this.state.isRunning) return;
        
        // Проверяем клик по перекрестку
        const crossroadIndex = this.conveyor.isCrossroadClicked(x, y);
        if (crossroadIndex !== -1) {
            console.log(`Клик по перекрестку ${crossroadIndex}`);
            
            // Находим ближайшую мандаринку к перекрестку
            const closestMandarin = this.findClosestMandarinToPoint(this.conveyor.crossroads[crossroadIndex].x);
            
            if (closestMandarin) {
                console.log(`Найдена ближайшая мандаринка типа ${closestMandarin.type}`);
                this.sendMandarinToDevil(closestMandarin, crossroadIndex);
            } else {
                console.log('Нет подходящих мандаринок рядом с перекрестком');
            }
            return; // Добавляем return, чтобы не проверять клик по черту, если уже был клик по перекрестку
        }
        
        // Проверяем клик по черту
        for (let i = 0; i < this.devils.length; i++) {
            const devil = this.devils[i];
            
            // Проверяем, находится ли клик в пределах черта
            if (
                x >= devil.x - devil.width / 2 &&
                x <= devil.x + devil.width / 2 &&
                y >= devil.y - devil.height / 2 &&
                y <= devil.y + devil.height / 2
            ) {
                console.log(`Клик по черту ${i}`);
                
                // Если черт ждет, показываем подсказку и направляем к нему ближайшую мандаринку
                if (devil.isWaiting) {
                    console.log(`Черт ${i} хочет мандаринку типа ${devil.wantedMandarinType}`);
                    
                    // Создаем эффект подсказки
                    this.effects.push({
                        x: devil.x,
                        y: devil.y - devil.height / 2 - 30,
                        size: 30,
                        alpha: 1,
                        color: devil.wantedMandarinType === 'orange' ? '#FFA500' : '#00FF00',
                        update: function(deltaTime) {
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
                    
                    // Находим ближайшую мандаринку к перекрестку над этим чертом
                    const crossroad = this.conveyor.crossroads[i];
                    const closestMandarin = this.findClosestMandarinToPoint(crossroad.x);
                    
                    if (closestMandarin) {
                        console.log(`Найдена ближайшая мандаринка типа ${closestMandarin.type} для черта ${i}`);
                        this.sendMandarinToDevil(closestMandarin, i);
                    }
                }
                
                return; // Выходим из обработчика после обработки клика по черту
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
        
        // Отрисовка текста реплики надзирателя
        const quoteX = 150;
        const quoteY = panelY + 30;
        // Увеличиваем ширину текстового блока, оставляя небольшой отступ справа
        const quoteWidth = this.dom.canvas.width - quoteX - 50; // Было 220, стало 50
        
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
        
        // Отрисовка иконки Pumpfun
        if (this.resources.images.pumpfun && this.resources.images.pumpfun.complete) {
            const iconSize = 40;
            const iconX = 20;
            const iconY = panelY + (panelHeight - iconSize) / 2;
            
            ctx.drawImage(
                this.resources.images.pumpfun,
                iconX,
                iconY,
                iconSize,
                iconSize
            );
            
            // Отрисовка логотипа "King of the Hill" после иконки
            ctx.font = '24px Cornerita';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText("King of the Hill", iconX + iconSize + 10, panelY + panelHeight / 2);
        } else {
            // Если иконка не загружена, просто отрисовываем логотип
            ctx.font = '24px Cornerita';
            ctx.fillStyle = '#FFFFFF';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillText("King of the Hill", 20, panelY + panelHeight / 2);
        }
        
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
            
            ctx.fillText(`${this.currentTokenName}`, displayX, displayY);
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
    
    // Метод для отрисовки панели статистики
    drawStatsPanel(ctx) {
        // Размеры и позиция панели статистики
        const panelHeight = 40;
        const panelY = 100; // Сразу после верхнего блока, который имеет высоту 100px
        
        // Фон панели
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, panelY, this.dom.canvas.width, panelHeight);
        
        // Отрисовка статистики
        ctx.font = '16px Cornerita';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Отображаем статистику в одну строку с равными интервалами
        const statsItems = [
            `Осталось: ${this.state.mandarinsLeft}`,
            `Правильно: ${this.state.correctMandarins}`,
            `Неправильно: ${this.state.wrongMandarins}`,
            `Простой: ${(this.state.totalWaitTime / 1000).toFixed(1)}с`
        ];
        
        const itemWidth = this.dom.canvas.width / statsItems.length;
        
        statsItems.forEach((item, index) => {
            ctx.fillText(item, 20 + index * itemWidth, panelY + panelHeight / 2);
        });
        
        // Отрисовка индикатора прогресса
        const progressHeight = 6;
        const progressY = panelY + panelHeight - progressHeight;
        
        // Фон индикатора
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(0, progressY, this.dom.canvas.width, progressHeight);
        
        // Заполнение индикатора
        const progress = (this.settings.totalMandarins - this.state.mandarinsLeft) / this.settings.totalMandarins;
        ctx.fillStyle = '#4CAF50'; // Зеленый цвет для прогресса
        ctx.fillRect(0, progressY, this.dom.canvas.width * progress, progressHeight);
    }
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    const game = new Game();
}); 