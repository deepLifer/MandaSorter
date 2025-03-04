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