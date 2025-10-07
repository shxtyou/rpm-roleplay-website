// Пароль редакции (можно поменять)
const ADMIN_PASSWORD = "rpm2024";

function login() {
    const password = document.getElementById('admin-password').value;
    const errorElement = document.getElementById('login-error');
    
    if (password === ADMIN_PASSWORD) {
        document.getElementById('login-screen').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        loadArticles();
    } else {
        errorElement.textContent = 'Неверный пароль';
    }
}

function logout() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
    document.getElementById('admin-password').value = '';
    document.getElementById('login-error').textContent = '';
}

function openTab(tabName) {
    // Скрыть все табы
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Убрать активный класс у всех кнопок
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Показать выбранный таб
    document.getElementById(tabName).classList.add('active');
    
    // Активировать кнопку
    event.target.classList.add('active');
}

function publishArticle() {
    const title = document.getElementById('article-title').value;
    const content = document.getElementById('article-content').value;
    const category = document.getElementById('article-category').value;
    const author = document.getElementById('article-author').value || 'Редакция';
    const isBreaking = document.getElementById('article-breaking').checked;
    
    if (!title || !content) {
        alert('Заполните заголовок и текст статьи');
        return;
    }
    
    const article = {
        id: Date.now(),
        title: title,
        content: content,
        category: category,
        author: author,
        date: new Date().toISOString(),
        isBreaking: isBreaking,
        views: 0
    };
    
    saveArticle(article);
    clearForm();
    alert('Статья опубликована!');
}

function saveDraft() {
    // Сохранение черновика в localStorage
    const draft = {
        title: document.getElementById('article-title').value,
        content: document.getElementById('article-content').value,
        category: document.getElementById('article-category').value,
        author: document.getElementById('article-author').value
    };
    
    localStorage.setItem('articleDraft', JSON.stringify(draft));
    alert('Черновик сохранен');
}

function loadDraft() {
    const draft = JSON.parse(localStorage.getItem('articleDraft') || '{}');
    
    if (draft.title) {
        document.getElementById('article-title').value = draft.title;
        document.getElementById('article-content').value = draft.content;
        document.getElementById('article-category').value = draft.category;
        document.getElementById('article-author').value = draft.author;
    }
}

function clearForm() {
    document.getElementById('article-title').value = '';
    document.getElementById('article-content').value = '';
    document.getElementById('article-author').value = '';
    document.getElementById('article-breaking').checked = false;
    localStorage.removeItem('articleDraft');
}

function setBreakingNews() {
    const title = document.getElementById('breaking-title').value;
    
    if (title) {
        localStorage.setItem('breakingNews', JSON.stringify({
            title: title,
            time: new Date().toLocaleTimeString('ru-RU')
        }));
        alert('Экстренная новость установлена');
    }
}

function clearBreakingNews() {
    localStorage.removeItem('breakingNews');
    alert('Экстренная новость убрана');
}

// Загрузить черновик при загрузке страницы
document.addEventListener('DOMContentLoaded', loadDraft);