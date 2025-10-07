// Обновление времени сервера
function updateServerTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU');
    const serverTimeElement = document.getElementById('server-time');
    if (serverTimeElement) {
        serverTimeElement.textContent = timeString;
    }
}

// Имитация онлайн игроков
function updateOnlineCount() {
    const baseOnline = 120;
    const randomVariation = Math.floor(Math.random() * 20) - 10;
    const online = Math.max(50, baseOnline + randomVariation);
    const onlineElement = document.getElementById('online-count');
    if (onlineElement) {
        onlineElement.textContent = online;
    }
}

// Переключение темы
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const btn = document.querySelector('.theme-toggle');
    
    if (document.body.classList.contains('light-theme')) {
        btn.textContent = '🌙';
    } else {
        btn.textContent = '☀️';
    }
    
    localStorage.setItem('theme', document.body.classList.contains('light-theme') ? 'light' : 'dark');
}

// Имитация изменения погоды
function updateWeather() {
    const weatherConditions = [
        { emoji: '☀️', text: 'Солнечно' },
        { emoji: '⛅', text: 'Переменная облачность' },
        { emoji: '☁️', text: 'Пасмурно' },
        { emoji: '🌧️', text: 'Дождь' },
        { emoji: '🌦️', text: 'Небольшой дождь' }
    ];
    
    const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    const weatherElement = document.querySelector('.weather');
    if (weatherElement) {
        weatherElement.innerHTML = `${randomCondition.emoji} ${randomCondition.text}`;
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateServerTime();
    updateOnlineCount();
    updateWeather();
    
    // Обновляем время каждую секунду
    setInterval(updateServerTime, 1000);
    
    // Обновляем онлайн каждые 30 секунд
    setInterval(updateOnlineCount, 30000);
    
    // Обновляем погоду каждые 10 минут
    setInterval(updateWeather, 600000);
    
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.querySelector('.theme-toggle').textContent = '🌙';
    }
});