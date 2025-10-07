// Обновленная система управления статьями с правами доступа
class ArticleSystem {
    constructor() {
        this.articles = this.loadArticles();
        this.comments = this.loadComments();
    }

    loadArticles() {
        return JSON.parse(localStorage.getItem('articles') || '[]');
    }

    loadComments() {
        return JSON.parse(localStorage.getItem('comments') || '[]');
    }

    saveArticles(articles) {
        localStorage.setItem('articles', JSON.stringify(articles));
        this.articles = articles;
        statsSystem.updateStats();
    }

    saveComments(comments) {
        localStorage.setItem('comments', JSON.stringify(comments));
        this.comments = comments;
        statsSystem.updateStats();
    }

    // Создание новой статьи
    createArticle(articleData) {
        if (!authSystem.currentUser) {
            return { success: false, error: 'Требуется авторизация' };
        }

        const newArticle = {
            id: Date.now(),
            title: articleData.title,
            content: articleData.content,
            category: articleData.category,
            author: authSystem.currentUser.displayName,
            authorId: authSystem.currentUser.id,
            faction: articleData.faction || authSystem.currentUser.faction,
            tags: articleData.tags || [],
            isBreaking: articleData.isBreaking || false,
            needsModeration: !authSystem.hasPermission('editor'),
            isPublished: authSystem.hasPermission('editor'),
            views: 0,
            likes: 0,
            commentsCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.articles.unshift(newArticle);
        this.saveArticles(this.articles);

        return { success: true, article: newArticle };
    }

    // Получение статей для отображения
    getArticles(filter = {}) {
        let filteredArticles = [...this.articles];

        // Фильтр по категории
        if (filter.category && filter.category !== 'all') {
            filteredArticles = filteredArticles.filter(article => 
                article.category === filter.category
            );
        }

        // Фильтр по статусу публикации
        if (!authSystem.hasPermission('editor')) {
            filteredArticles = filteredArticles.filter(article => 
                article.isPublished && !article.needsModeration
            );
        } else if (authSystem.hasPermission('editor') && !authSystem.hasPermission('chief_editor')) {
            filteredArticles = filteredArticles.filter(article => 
                article.isPublished || article.authorId === authSystem.currentUser.id
            );
        }

        // Сортировка по дате
        filteredArticles.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return filteredArticles;
    }

    // Публикация статьи (для редакторов)
    publishArticle(articleId) {
        if (!authSystem.hasPermission('editor')) {
            return { success: false, error: 'Недостаточно прав' };
        }

        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            article.isPublished = true;
            article.needsModeration = false;
            article.updatedAt = new Date().toISOString();
            this.saveArticles(this.articles);
            return { success: true, article };
        }

        return { success: false, error: 'Статья не найдена' };
    }

    // Добавление комментария
    addComment(articleId, commentText) {
        if (!authSystem.currentUser) {
            return { success: false, error: 'Требуется авторизация' };
        }

        const newComment = {
            id: Date.now(),
            articleId: articleId,
            author: authSystem.currentUser.displayName,
            authorId: authSystem.currentUser.id,
            content: commentText,
            likes: 0,
            isApproved: true, // В реальной системе может требовать модерации
            createdAt: new Date().toISOString()
        };

        this.comments.push(newComment);

        // Обновляем счетчик комментариев в статье
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            article.commentsCount = (article.commentsCount || 0) + 1;
        }

        this.saveComments(this.comments);
        this.saveArticles(this.articles);

        return { success: true, comment: newComment };
    }

    // Получение комментариев для статьи
    getArticleComments(articleId) {
        return this.comments
            .filter(comment => comment.articleId === articleId && comment.isApproved)
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    }

    // Увеличение счетчика просмотров
    incrementViews(articleId) {
        const article = this.articles.find(a => a.id === articleId);
        if (article) {
            article.views = (article.views || 0) + 1;
            this.saveArticles(this.articles);
        }
    }

    // Получение популярных статей
    getPopularArticles(limit = 5) {
        return this.getArticles()
            .filter(article => article.isPublished)
            .sort((a, b) => (b.views || 0) - (a.views || 0))
            .slice(0, limit);
    }

    // Обновление виджетов на главной
    updateHomepageWidgets() {
        this.updateFeaturedArticle();
        this.updateLatestArticles();
        this.updateMostRead();
        this.updateQuickNews();
    }

    updateFeaturedArticle() {
        const featured = document.getElementById('featured-article');
        if (!featured) return;

        const articles = this.getArticles().filter(a => a.isPublished);
        if (articles.length > 0) {
            const mainArticle = articles[0];
            featured.innerHTML = `
                <div class="article-category">${mainArticle.category.toUpperCase()}</div>
                <h1 class="lead-title">${mainArticle.title}</h1>
                <p class="lead-excerpt">${mainArticle.content.substring(0, 200)}...</p>
                <div class="article-meta">
                    <span class="author">${mainArticle.author}</span>
                    <span class="time">${new Date(mainArticle.createdAt).toLocaleDateString('ru-RU')}</span>
                    <span class="views">👁️ ${mainArticle.views || 0}</span>
                </div>
            `;
        }
    }

    updateLatestArticles() {
        const latest = document.getElementById('latest-articles');
        if (!latest) return;

        const articles = this.getArticles().filter(a => a.isPublished).slice(1, 6);
        latest.innerHTML = articles.map(article => `
            <article class="news-item">
                <div class="news-category">${article.category.toUpperCase()}</div>
                <h3>${article.title}</h3>
                <p>${article.content.substring(0, 100)}...</p>
                <div class="article-meta">
                    <span class="author">${article.author}</span>
                    <span class="time">${new Date(article.createdAt).toLocaleDateString('ru-RU')}</span>
                    <span class="views">👁️ ${article.views || 0}</span>
                </div>
            </article>
        `).join('');
    }

    updateMostRead() {
        const mostRead = document.getElementById('most-read');
        if (!mostRead) return;

        const popular = this.getPopularArticles(5);
        mostRead.innerHTML = popular.map(article => `
            <div class="most-read-item">
                <h4>${article.title}</h4>
                <div class="most-read-meta">
                    ${article.category} • 👁️ ${article.views || 0}
                </div>
            </div>
        `).join('');
    }

    updateQuickNews() {
        const quickNews = document.getElementById('quick-news');
        if (!quickNews) return;

        const recent = this.getArticles().filter(a => a.isPublished).slice(0, 4);
        quickNews.innerHTML = recent.map(article => `
            <div class="quick-item">
                <span class="quick-time">${new Date(article.createdAt).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</span>
                <span class="quick-text">${article.title}</span>
            </div>
        `).join('');
    }
}

// Глобальный экземпляр системы статей
const articleSystem = new ArticleSystem();

// Инициализация статей
document.addEventListener('DOMContentLoaded', function() {
    articleSystem.updateHomepageWidgets();
});
