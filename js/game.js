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
        const devilCount = 2; // Исправляем на 2 черта вместо 3
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
        // Проверка, остались ли мандаринки
        if (this.state.mandarinsLeft <= 0) return;
        
        // Уменьшаем счетчик оставшихся мандаринок
        this.state.mandarinsLeft--;
        
        // Обновляем отображение
        this.updateStatsDisplay();
        
        // Выбираем случайный тип мандаринки
        const type = this.settings.mandarinTypes[
            Math.floor(Math.random() * this.settings.mandarinTypes.length)
        ];
        
        // Создаем новую мандаринку
        const mandarin = new Mandarin(this, type);
        
        // Добавляем мандаринку в массив
        this.mandarins.push(mandarin);
    }
    
    update(timestamp) {
        // Если игра не запущена, не обновляем
        if (!this.state.isRunning) return;
        
        // Расчет deltaTime
        if (!this.lastTimestamp) this.lastTimestamp = timestamp;
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // Обновляем время игры
        this.state.gameTime += deltaTime;
        
        // Обновляем общее время простоя чертей
        this.updateTotalWaitTime(deltaTime);
        
        // Обновляем реплику надзирателя
        this.updateSupervisorQuote(deltaTime);
        
        // Очистка канваса
        this.ctx.clearRect(0, 0, this.dom.canvas.width, this.dom.canvas.height);
        
        // Отрисовка фона
        this.drawBackground();
        
        // Обновление и отрисовка конвейера
        this.conveyor.update(deltaTime);
        this.conveyor.draw(this.ctx);
        
        // Обновление и отрисовка чертей
        for (const devil of this.devils) {
            devil.update(deltaTime);
            devil.draw(this.ctx);
        }
        
        // Обновление и отрисовка мандаринок
        for (let i = this.mandarins.length - 1; i >= 0; i--) {
            const mandarin = this.mandarins[i];
            if (!mandarin.update(deltaTime)) {
                this.mandarins.splice(i, 1);
            } else {
                mandarin.draw(this.ctx);
            }
        }
        
        // Обновление и отрисовка эффектов
        for (let i = this.effects.length - 1; i >= 0; i--) {
            const effect = this.effects[i];
            if (!effect.update(deltaTime)) {
                this.effects.splice(i, 1);
            } else {
                effect.draw(this.ctx);
            }
        }
        
        // Обновление и отрисовка мемкоинов
        for (let i = this.memecoins.length - 1; i >= 0; i--) {
            const memecoin = this.memecoins[i];
            if (!memecoin.update(deltaTime)) {
                this.memecoins.splice(i, 1);
            } else {
                memecoin.draw(this.ctx);
            }
        }
        
        // Отрисовка верхнего блока с надзирателем, репликами и результатами
        this.drawTopPanel(this.ctx);
        
        // Отрисовка логотипа, надписи "King of the Hill" и текущего токена
        this.drawLogo(this.ctx);
        
        // Спавн новых мандаринок
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.settings.spawnInterval && this.state.mandarinsLeft > 0) {
            this.spawnMandarin();
            this.spawnTimer = 0;
        }
        
        // Проверка окончания игры
        if (this.state.mandarinsLeft <= 0 && this.mandarins.length === 0) {
            this.endGame();
            return;
        }
        
        // Продолжаем игровой цикл
        requestAnimationFrame(this.update);
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
        // Проверка, находится ли игра в активном состоянии
        if (this.state.currentScreen !== 'game' || !this.state.isRunning) return;
        
        // Получаем координаты клика относительно канваса
        const rect = this.dom.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Проверка клика по черту
        for (let i = 0; i < this.devils.length; i++) {
            const devil = this.devils[i];
            
            // Проверяем, попал ли клик по черту
            if (this.isClickOnDevil(x, y, devil)) {
                // Находим соответствующий перекресток
                const crossroad = this.conveyor.crossroads[i];
                
                if (!crossroad) {
                    console.error(`Перекресток с индексом ${i} не найден`);
                    continue;
                }
                
                // Находим ближайшую мандаринку к перекрестку
                const closestMandarin = this.findClosestMandarinToPoint(crossroad.x);
                
                if (closestMandarin) {
                    // Направляем мандаринку к этому перекрестку
                    const success = closestMandarin.drop(i);
                    
                    // Если успешно, выходим из обработчика
                    if (success) return;
                }
            }
        }
        
        // Проверка клика по перекрестку
        for (let i = 0; i < this.conveyor.crossroads.length; i++) {
            const crossroad = this.conveyor.crossroads[i];
            
            // Проверяем, попал ли клик в область перекрестка
            if (
                x >= crossroad.x - crossroad.width / 2 &&
                x <= crossroad.x + crossroad.width / 2 &&
                y >= crossroad.y - crossroad.height / 2 &&
                y <= crossroad.y + crossroad.height / 2
            ) {
                // Находим ближайшую мандаринку к этому перекрестку
                const closestMandarin = this.findClosestMandarinToPoint(crossroad.x);
                
                if (closestMandarin) {
                    // Направляем мандаринку к этому перекрестку
                    const success = closestMandarin.drop(i);
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
        this.dom.totalMandarinsDisplay.textContent = `Всего мандаринок: ${this.settings.totalMandarins}`;
        this.dom.correctMandarinsDisplay.textContent = `Правильно съедено: ${this.state.correctMandarins}`;
        this.dom.wrongMandarinsDisplay.textContent = `Неправильно направлено: ${this.state.wrongMandarins}`;
        this.dom.totalWaitTimeDisplay.textContent = `Общее время ожидания: ${(this.state.totalWaitTime / 1000).toFixed(1)}с`;
    }
    
    endGame() {
        this.state.isRunning = false;
        clearInterval(this.spawnTimer);
        
        // Расчет результатов
        const earnedPerMandarin = 5; // $MND за каждую правильную мандаринку
        const lostPerMandarin = 10; // $MND потеряно за каждую неправильную мандаринку
        
        const earnedMND = this.state.correctMandarins * earnedPerMandarin;
        const lostMND = this.state.wrongMandarins * lostPerMandarin;
        
        // Обновляем текст на экране результатов
        const earnedMNDElement = document.getElementById('earned-mnd');
        const lostMNDElement = document.getElementById('lost-mnd');
        const punishmentElement = document.getElementById('punishment');
        
        earnedMNDElement.innerHTML = `Мы заработали <span class="highlight">${earnedMND} $MND</span> благодаря <span class="highlight">${this.state.correctMandarins}</span> правильным мандаринкам.`;
        lostMNDElement.innerHTML = `Но из-за тебя недополучили <span class="highlight">${lostMND} $MND</span> из-за <span class="highlight">${this.state.wrongMandarins}</span> неправильных мандаринок.`;
        punishmentElement.innerHTML = `Ты приговариваешься к <span class="highlight">${this.state.wrongMandarins}</span> криптопалкам!`;
        
        // Добавляем изображение надзирателя
        const supervisorContainer = document.querySelector('.supervisor-image-container');
        supervisorContainer.innerHTML = ''; // Очищаем контейнер
        
        if (this.resources.images.satan && this.resources.images.satan.complete) {
            const supervisorImage = document.createElement('img');
            supervisorImage.src = this.resources.images.satan.src;
            supervisorImage.alt = 'Надзиратель';
            supervisorContainer.appendChild(supervisorImage);
        }
        
        // Показываем экран результатов
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
    
    // Метод для поиска ближайшей мандаринки к перекрестку
    findClosestMandarinToPoint(x) {
        let closestMandarin = null;
        let minDistance = Infinity;
        
        // Перебираем все мандаринки
        for (const mandarin of this.mandarins) {
            // Пропускаем мандаринки, которые уже падают или движутся к перекрестку
            if (mandarin.isDropping || mandarin.isMovingToCrossroad) {
                continue;
            }
            
            // Пропускаем мандаринки, которые еще не появились на экране
            if (mandarin.x < 0) {
                continue;
            }
            
            // Вычисляем расстояние от мандаринки до указанной точки по X
            const distance = Math.abs(mandarin.x - x);
            
            // Если это ближайшая мандаринка, запоминаем её
            if (distance < minDistance) {
                minDistance = distance;
                closestMandarin = mandarin;
            }
        }
        
        return closestMandarin;
    }
    
    // Метод для отрисовки логотипа, надписи "King of the Hill" и текущего токена
    drawLogo(ctx) {
        // Рисуем прямоугольник внизу экрана
        const rectHeight = 60;
        const rectY = this.dom.canvas.height - rectHeight;
        
        // Фон прямоугольника
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Полупрозрачный черный
        ctx.fillRect(0, rectY, this.dom.canvas.width, rectHeight);
        
        // Отрисовка логотипа PumpFun, если он загружен
        if (this.resources.images.pumpfun && this.resources.images.pumpfun.complete) {
            const logoSize = 50;
            const logoX = 20;
            const logoY = rectY + (rectHeight - logoSize) / 2;
            
            ctx.drawImage(
                this.resources.images.pumpfun,
                logoX,
                logoY,
                logoSize,
                logoSize
            );
        }
        
        // Отрисовка текста "King of the Hill"
        ctx.font = '24px Cornerita';
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('King of the Hill', this.dom.canvas.width / 2, rectY + rectHeight / 3);
        
        // Отрисовка текущего токена под надписью "King of the Hill"
        if (this.currentTokenName) {
            ctx.save();
            ctx.font = '18px Cornerita';
            ctx.fillStyle = '#FFFF00'; // Желтый цвет для токена
            
            // Применяем эффект тряски, если нужно
            if (this.tokenShaking) {
                const shakeX = (Math.random() - 0.5) * 5;
                const shakeY = (Math.random() - 0.5) * 5;
                ctx.translate(shakeX, shakeY);
            }
            
            // Отрисовка текста токена
            ctx.fillText(this.currentTokenName, this.dom.canvas.width / 2, rectY + rectHeight * 2/3);
            ctx.restore();
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
    
    // Метод для отрисовки верхнего блока с надзирателем, репликами и результатами
    drawTopPanel(ctx) {
        // Размеры и позиция верхнего блока
        const panelHeight = this.dom.canvas.height * 0.25;
        const panelY = 0;
        
        // Фон блока
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; // Полупрозрачный черный
        ctx.fillRect(0, panelY, this.dom.canvas.width, panelHeight);
        
        // Отрисовка изображения надзирателя
        if (this.resources.images.satan && this.resources.images.satan.complete) {
            const imageSize = panelHeight * 0.8;
            const imageX = 20;
            const imageY = panelY + (panelHeight - imageSize) / 2;
            
            // Рамка вокруг изображения
            ctx.strokeStyle = '#4B0082'; // Индиго для рамки
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
}

// Инициализация игры при загрузке страницы
window.addEventListener('load', () => {
    const game = new Game();
}); 