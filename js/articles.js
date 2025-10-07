// Функции для работы со статьями
function saveArticle(article) {
    let articles = JSON.parse(localStorage.getItem('articles') || '[]');
    articles.unshift(article); // Добавляем в начало
    localStorage.setItem('articles', JSON.stringify(articles));
}

function loadArticles() {
    return JSON.parse(localStorage.getItem('articles') || '[]');
}

function getArticleById(id) {
    const articles = loadArticles();
    return articles.find(article => article.id == id);
}

function deleteArticle(id) {
    let articles = loadArticles();
    articles = articles.filter(article => article.id != id);
    localStorage.setItem('articles', JSON.stringify(articles));
    loadArticlesList(); // Обновляем список
}

function loadArticlesList() {
    const articles = loadArticles();
    const container = document.getElementById('articles-list');
    
    if (!container) return;
    
    container.innerHTML = articles.map(article => `
        <div class="article-item">
            <div class="article-header">
                <div>
                    <h3>${article.title}</h3>
                    <div class="article-meta">
                        ${article.author} | ${new Date(article.date).toLocaleDateString('ru-RU')} | ${article.category}
                        ${article.isBreaking ? ' | 🔥 Экстренная' : ''}
                    </div>
                </div>
                <div class="article-actions">
                    <button class="btn-edit" onclick="editArticle(${article.id})">Редактировать</button>
                    <button class="btn-delete" onclick="deleteArticle(${article.id})">Удалить</button>
                </div>
            </div>
            <p>${article.content.substring(0, 200)}...</p>
        </div>
    `).join('');
}

function editArticle(id) {
    const article = getArticleById(id);
    if (article) {
        document.getElementById('article-title').value = article.title;
        document.getElementById('article-content').value = article.content;
        document.getElementById('article-category').value = article.category;
        document.getElementById('article-author').value = article.author;
        document.getElementById('article-breaking').checked = article.isBreaking;
        
        // Удаляем старую статью
        deleteArticle(id);
        
        // Переходим на вкладку написания
        openTab('write-tab');
    }
}

// Загрузка статей на главной странице
function displayArticlesOnHomepage() {
    const articles = loadArticles().slice(0, 10); // Последние 10 статей
    
    // Ведущая статья
    const featured = document.getElementById('featured-article');
    if (featured && articles.length > 0) {
        const mainArticle = articles[0];
        featured.innerHTML = `
            <div class="article-category">${mainArticle.category.toUpperCase()}</div>
            <h1 class="lead-title">${mainArticle.title}</h1>
            <p class="lead-excerpt">${mainArticle.content.substring(0, 200)}...</p>
            <div class="article-meta">
                <span class="author">${mainArticle.author}</span>
                <span class="time">${new Date(mainArticle.date).toLocaleDateString('ru-RU')}</span>
            </div>
        `;
    }
    
    // Последние новости
    const latest = document.getElementById('latest-articles');
    if (latest) {
        latest.innerHTML = articles.slice(1, 6).map(article => `
            <article class="news-item">
                <div class="news-category">${article.category.toUpperCase()}</div>
                <h3>${article.title}</h3>
                <p>${article.content.substring(0, 100)}...</p>
                <div class="article-meta">
                    <span class="time">${new Date(article.date).toLocaleDateString('ru-RU')}</span>
                </div>
            </article>
        `).join('');
    }
    
    // Экстренные новости
    const breaking = JSON.parse(localStorage.getItem('breakingNews'));
    const breakingSection = document.getElementById('breaking-news');
    if (breaking && breakingSection) {
        breakingSection.style.display = 'block';
        document.getElementById('breaking-title').textContent = breaking.title;
        document.getElementById('breaking-time').textContent = breaking.time;
    }
}

// Инициализация
if (document.getElementById('articles-list')) {
    loadArticlesList();
}

if (document.getElementById('featured-article')) {
    displayArticlesOnHomepage();
}