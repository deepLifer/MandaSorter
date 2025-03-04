// Интеграция с Telegram Web App API
document.addEventListener('DOMContentLoaded', () => {
    // Проверяем, запущено ли приложение в Telegram
    if (window.Telegram && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        
        // Инициализация Telegram Web App
        tg.expand();
        
        // Получение данных пользователя
        const user = tg.initDataUnsafe?.user;
        console.log('Telegram user:', user);
        
        // Настройка темы
        if (tg.colorScheme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        
        // Обработка событий от Telegram
        tg.onEvent('viewportChanged', () => {
            // Обновляем размер игры при изменении видимой области
            if (game) {
                game.scale.resize(window.innerWidth, window.innerHeight);
            }
        });
        
        // Отправка данных в Telegram при необходимости
        // tg.sendData(JSON.stringify({score: 100}));
    } else {
        console.log('Приложение запущено вне Telegram');
    }
});

// Класс для работы с Telegram WebApp API
class TelegramPayment {
    constructor() {
        // Проверяем, запущено ли приложение в Telegram WebApp
        this.isInTelegramWebApp = window.Telegram && window.Telegram.WebApp;
        
        // Инициализируем Telegram WebApp
        if (this.isInTelegramWebApp) {
            this.webApp = window.Telegram.WebApp;
            this.webApp.expand(); // Расширяем WebApp на весь экран
            
            console.log("Telegram WebApp инициализирован");
            
            // Если доступна информация о пользователе
            if (this.webApp.initDataUnsafe && this.webApp.initDataUnsafe.user) {
                console.log("User:", this.webApp.initDataUnsafe.user);
            }
        } else {
            console.log("Приложение запущено не в Telegram WebApp");
        }
    }
    
    // Метод для проверки, запущено ли приложение в Telegram WebApp
    isInTelegram() {
        return this.isInTelegramWebApp;
    }
    
    // Метод для проверки доступности оплаты звездами
    canPayWithStars() {
        return this.isInTelegramWebApp && this.webApp.isVersionAtLeast('6.7');
    }
    
    // Метод для запуска оплаты звездами
    payWithStars(amount, title, description, callback) {
        if (!this.canPayWithStars()) {
            console.error("Оплата звездами недоступна");
            if (callback) callback(false, "Оплата звездами недоступна");
            return;
        }
        
        try {
            // Запускаем оплату звездами
            this.webApp.showStarPayment({
                amount: amount, // Количество звезд
                title: title,
                description: description,
                callback: (success) => {
                    if (success) {
                        console.log("Оплата звездами успешна");
                        if (callback) callback(true, null);
                    } else {
                        console.error("Ошибка при оплате звездами");
                        if (callback) callback(false, "Ошибка при оплате звездами");
                    }
                }
            });
        } catch (error) {
            console.error("Ошибка при запуске оплаты звездами:", error);
            if (callback) callback(false, error.message);
        }
    }
}

// Создаем глобальный экземпляр класса
window.telegramPayment = new TelegramPayment(); 