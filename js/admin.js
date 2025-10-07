// Логика админ-панели RPM SMI
class AdminSystem {
    constructor() {
        this.currentTab = 'dashboard';
        this.init();
    }

    init() {
        this.checkPermissions();
        this.loadDashboard();
        this.setupEventListeners();
    }

    // Проверка прав доступа
    checkPermissions() {
        if (!authSystem.currentUser) {
            this.showAuthScreen();
            return false;
        }

        if (!authSystem.hasPermission('editor')) {
            this.showAuthScreen();
            return false;
        }

        this.showAdminPanel();
        return true;
    }

    showAuthScreen() {
        document.getElementById('admin-auth').style.display = 'flex';
        document.getElementById('admin-panel').style.display = 'none';
    }

    showAdminPanel() {
        document.getElementById('admin-auth').style.display = 'none';
        document.getElementById('admin-panel').style.display = 'block';
        
        // Обновляем информацию о пользователе
        document.getElementById('admin-user-name').textContent = authSystem.currentUser.displayName;
        document.getElementById('admin-user-role').textContent = this.getRoleName(authSystem.currentUser.role);
        
        // Показываем/скрываем вкладку настроек
        const settingsTab = document.getElementById('settings-tab');
        if (authSystem.hasPermission('chief_editor')) {
            settingsTab.style.display = 'block';
        }
        
        // Показываем/скрываем кнопку добавления пользователей
        const addUserBtn = document.getElementById('add-user-btn');
        if (authSystem.hasPermission('chief_editor')) {
            addUserBtn.style.display = 'block';
        }
    }

    getRoleName(role) {
        const roles = {
            'journalist': 'Журналист',
            'editor': 'Редактор',
            'chief_editor': 'Главный редактор'
        };
        return roles[role] || role;
    }

    // Загрузка дашборда
    loadDashboard() {
        this.updateStats();
        this.loadRecentActivity();
    }

    updateStats() {
        document.getElementById('total-articles').textContent = statsSystem.stats.totalArticles;
        document.getElementById('total-users').textContent = statsSystem.stats.totalUsers;
        document.getElementById('total-comments').textContent = statsSystem.stats.totalComments;
        document.getElementById('online-players').textContent = statsSystem.getOnlinePlayers();
    }

    loadRecentActivity() {
        const activityList = document.getElementById('recent-activity');
        const articles = articleSystem.getArticles().slice(0, 5);
        
        activityList.innerHTML = articles.map(article => `
            <div class="activity-item">
                <div class="activity-text">Новая статья: "${article.title}"</div>
                <div class="activity-time">${new Date(article.createdAt).toLocaleString('ru-RU')}</div>
            </div>
        `).join('');
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Навигация по табам
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const tab = e.target.getAttribute('data-tab');
                this.openTab(tab);
            });
        });

        // Загрузка данных при открытии табов
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('admin-nav-link')) {
                const tab = e.target.getAttribute('data-tab');
                setTimeout(() => this.loadTabData(tab), 100);
            }
        });
    }

    // Переключение табов
    openTab(tabName) {
        // Скрываем все табы
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // Убираем активный класс у всех ссылок
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });

        // Показываем выбранный таб
        document.getElementById(tabName).classList.add('active');

        // Активируем ссылку
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

        this.currentTab = tabName;
    }

    // Загрузка данных для таба
    loadTabData(tabName) {
        switch(tabName) {
            case 'articles':
                this.loadArticles();
                break;
            case 'users':
                this.loadUsers();
                break;
            case 'factions':
                this.loadFactions();
                break;
            case 'comments':
                this.loadComments();
                break;
            case 'settings':
                this.loadSettings();
                break;
        }
    }

    // Загрузка статей
    loadArticles() {
        const articlesList = document.getElementById('admin-articles-list');
        const articles = articleSystem.getArticles();
        
        articlesList.innerHTML = articles.map(article => `
            <div class="article-item">
                <div class="article-header">
                    <div>
                        <div class="article-title">${article.title}</div>
                        <div class="article-meta">
                            Автор: ${article.author} | 
                            Категория: ${article.category} | 
                            Дата: ${new Date(article.createdAt).toLocaleDateString('ru-RU')} |
                            Просмотры: ${article.views || 0}
                        </div>
                        <div class="article-status status-${article.isPublished ? 'published' : article.needsModeration ? 'moderation' : 'draft'}">
                            ${article.isPublished ? 'Опубликовано' : article.needsModeration ? 'На модерации' : 'Черновик'}
                        </div>
                    </div>
                    <div class="article-actions">
                        ${!article.isPublished && authSystem.hasPermission('editor') ? `
                            <button onclick="adminSystem.publishArticle(${article.id})" class="btn btn-success btn-sm">Опубликовать</button>
                        ` : ''}
                        <button onclick="adminSystem.editArticle(${article.id})" class="btn btn-primary btn-sm">Редактировать</button>
                        <button onclick="adminSystem.deleteArticle(${article.id})" class="btn btn-danger btn-sm">Удалить</button>
                    </div>
                </div>
                <p>${article.content.substring(0, 200)}...</p>
            </div>
        `).join('');
    }

    // Загрузка пользователей
    loadUsers() {
        const usersList = document.getElementById('admin-users-list');
        const users = authSystem.getAllUsers();
        
        usersList.innerHTML = users.map(user => `
            <div class="user-item">
                <div class="user-header">
                    <div>
                        <div class="user-name">${user.displayName} (${user.username})</div>
                        <div class="user-meta">
                            Email: ${user.email} | 
                            Роль: ${this.getRoleName(user.role)} |
                            Фракция: ${user.faction || 'Не указана'} |
                            Регистрация: ${new Date(user.createdAt).toLocaleDateString('ru-RU')}
                        </div>
                        <div class="user-status status-${user.isActive ? 'active' : 'inactive'}">
                            ${user.isActive ? 'Активен' : 'Неактивен'}
                        </div>
                    </div>
                    <div class="user-actions">
                        ${authSystem.hasPermission('chief_editor') ? `
                            <select onchange="adminSystem.changeUserRole(${user.id}, this.value)" class="btn-sm">
                                <option value="journalist" ${user.role === 'journalist' ? 'selected' : ''}>Журналист</option>
                                <option value="editor" ${user.role === 'editor' ? 'selected' : ''}>Редактор</option>
                                <option value="chief_editor" ${user.role === 'chief_editor' ? 'selected' : ''}>Главред</option>
                            </select>
                        ` : ''}
                        <button onclick="adminSystem.toggleUserStatus(${user.id})" class="btn ${user.isActive ? 'btn-warning' : 'btn-success'} btn-sm">
                            ${user.isActive ? 'Деактивировать' : 'Активировать'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // Загрузка фракций
    loadFactions() {
        const factionsList = document.getElementById('admin-factions-list');
        const factions = statsSystem.factions;
        
        // Также обновляем select в форме статьи
        const factionSelect = document.getElementById('article-faction');
        if (factionSelect) {
            factionSelect.innerHTML = '<option value="">Общая новость</option>' +
                factions.map(faction => `<option value="${faction.id}">${faction.name}</option>`).join('');
        }

        factionsList.innerHTML = factions.map(faction => `
            <div class="faction-admin-item">
                <div class="faction-admin-header">
                    <div>
                        <div class="faction-name">${faction.name}</div>
                        <div class="faction-meta">
                            Тип: ${faction.type === 'official' ? 'Официальная' : 'Неофициальная'} |
                            Лидер: ${faction.leader} |
                            Участников: ${faction.members} |
                            Активность: ${faction.activity}%
                        </div>
                    </div>
                    <div class="faction-actions">
                        <button onclick="adminSystem.editFaction(${faction.id})" class="btn btn-primary btn-sm">Редактировать</button>
                    </div>
                </div>
                <p>${faction.description}</p>
            </div>
        `).join('');
    }

    // Загрузка комментариев
    loadComments() {
        const commentsList = document.getElementById('admin-comments-list');
        const comments = articleSystem.comments;
        
        commentsList.innerHTML = comments.map(comment => `
            <div class="comment-item">
                <div class="comment-header">
                    <div>
                        <div class="comment-author">${comment.author}</div>
                        <div class="comment-meta">
                            Статья ID: ${comment.articleId} |
                            Дата: ${new Date(comment.createdAt).toLocaleString('ru-RU')} |
                            Лайков: ${comment.likes}
                        </div>
                        <div class="comment-status status-${comment.isApproved ? 'active' : 'inactive'}">
                            ${comment.isApproved ? 'Одобрен' : 'На модерации'}
                        </div>
                    </div>
                    <div class="comment-actions">
                        ${!comment.isApproved ? `
                            <button onclick="adminSystem.approveComment(${comment.id})" class="btn btn-success btn-sm">Одобрить</button>
                        ` : ''}
                        <button onclick="adminSystem.deleteComment(${comment.id})" class="btn btn-danger btn-sm">Удалить</button>
                    </div>
                </div>
                <p>${comment.content}</p>
            </div>
        `).join('');
    }

    // Методы для работы со статьями
    publishArticle(articleId) {
        const result = articleSystem.publishArticle(articleId);
        if (result.success) {
            alert('Статья опубликована!');
            this.loadArticles();
        } else {
            alert('Ошибка: ' + result.error);
        }
    }

    editArticle(articleId) {
        const article = articleSystem.articles.find(a => a.id === articleId);
        if (article) {
            document.getElementById('article-form-title').textContent = 'Редактировать статью';
            document.getElementById('article-title').value = article.title;
            document.getElementById('article-content').value = article.content;
            document.getElementById('article-category').value = article.category;
            document.getElementById('article-faction').value = article.faction || '';
            document.getElementById('article-tags').value = article.tags.join(', ');
            document.getElementById('article-breaking').checked = article.isBreaking;
            document.getElementById('article-publish').checked = article.isPublished;
            
            // Сохраняем ID статьи для обновления
            document.getElementById('article-form').dataset.articleId = articleId;
            
            document.getElementById('article-form-modal').style.display = 'flex';
        }
    }

    deleteArticle(articleId) {
        if (confirm('Вы уверены, что хотите удалить эту статью?')) {
            articleSystem.articles = articleSystem.articles.filter(a => a.id !== articleId);
            articleSystem.saveArticles(articleSystem.articles);
            this.loadArticles();
            alert('Статья удалена!');
        }
    }

    // Методы для работы с пользователями
    toggleUserStatus(userId) {
        const result = authSystem.toggleUserStatus(userId);
        if (result.success) {
            alert(`Пользователь ${result.user.isActive ? 'активирован' : 'деактивирован'}!`);
            this.loadUsers();
        } else {
            alert('Ошибка: ' + result.error);
        }
    }

    changeUserRole(userId, newRole) {
        const result = authSystem.changeUserRole(userId, newRole);
        if (result.success) {
            alert('Роль пользователя изменена!');
            this.loadUsers();
        } else {
            alert('Ошибка: ' + result.error);
        }
    }

    // Методы для работы с комментариями
    approveComment(commentId) {
        const comment = articleSystem.comments.find(c => c.id === commentId);
        if (comment) {
            comment.isApproved = true;
            articleSystem.saveComments(articleSystem.comments);
            this.loadComments();
            alert('Комментарий одобрен!');
        }
    }

    deleteComment(commentId) {
        if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            articleSystem.comments = articleSystem.comments.filter(c => c.id !== commentId);
            articleSystem.saveComments(articleSystem.comments);
            this.loadComments();
            alert('Комментарий удален!');
        }
    }
}

// Глобальные функции для вызова из HTML
function openTab(tabName) {
    adminSystem.openTab(tabName);
}

function showArticleForm() {
    document.getElementById('article-form-title').textContent = 'Новая статья';
    document.getElementById('article-form').reset();
    delete document.getElementById('article-form').dataset.articleId;
    document.getElementById('article-form-modal').style.display = 'flex';
}

function closeArticleForm() {
    document.getElementById('article-form-modal').style.display = 'none';
}

function saveArticle() {
    const form = document.getElementById('article-form');
    const articleData = {
        title: document.getElementById('article-title').value,
        content: document.getElementById('article-content').value,
        category: document.getElementById('article-category').value,
        faction: document.getElementById('article-faction').value,
        tags: document.getElementById('article-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        isBreaking: document.getElementById('article-breaking').checked
    };

    const result = articleSystem.createArticle(articleData);
    
    if (result.success) {
        alert('Статья сохранена!');
        closeArticleForm();
        adminSystem.loadArticles();
    } else {
        alert('Ошибка: ' + result.error);
    }
}

// Инициализация админ-системы
let adminSystem;

document.addEventListener('DOMContentLoaded', function() {
    adminSystem = new AdminSystem();
});
