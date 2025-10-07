// Основные функции для главной страницы
function toggleTheme() {
    document.body.classList.toggle('light-theme');
    const btn = document.querySelector('.theme-toggle');
    
    if (document.body.classList.contains('light-theme')) {
        btn.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    } else {
        btn.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    }
}

function updateDateTime() {
    const now = new Date();
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    const dateString = now.toLocaleDateString('ru-RU', options);
    document.getElementById('current-date').textContent = dateString;
}

function updateWeather() {
    const weatherConditions = [
        { temp: '+22°C', desc: 'солнечно' },
        { temp: '+18°C', desc: 'переменная облачность' },
        { temp: '+15°C', desc: 'пасмурно' },
        { temp: '+12°C', desc: 'небольшой дождь' }
    ];
    
    const randomWeather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
    document.getElementById('current-weather').textContent = 
        `Штат RPM: ${randomWeather.temp}, ${randomWeather.desc}`;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    updateDateTime();
    updateWeather();
    
    // Загружаем сохраненную тему
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        document.querySelector('.theme-toggle').textContent = '🌙';
    }
    
    // Обновляем дату каждую минуту
    setInterval(updateDateTime, 60000);
    
    // Обновляем погоду каждый час
    setInterval(updateWeather, 3600000);
});