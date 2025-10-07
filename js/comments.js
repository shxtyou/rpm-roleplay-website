// Система комментариев для RPM SMI
class CommentSystem {
    constructor() {
        this.comments = this.loadComments();
    }

    loadComments() {
        return JSON.parse(localStorage.getItem('comments') || '[]');
    }

    saveComments(comments) {
        localStorage.setItem('comments', JSON.stringify(comments));
        this.comments = comments;
        statsSystem.updateStats();
    }

    // Добавление комментария
    addComment(articleId, content) {
        if (!authSystem.currentUser) {
            return { success: false, error: 'Требуется авторизация для комментирования' };
        }

        if (!content.trim()) {
            return { success: false, error: 'Комментарий не может быть пустым' };
        }

        const newComment = {
            id: Date.now(),
            articleId: parseInt(articleId),
            author: authSystem.currentUser.displayName,
            authorId: authSystem.currentUser.id,
            authorFaction: authSystem.currentUser.faction,
            content: content.trim(),
            likes: 0,
            isApproved: true, // Авто-одобрение для авторизованных пользователей
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.comments.unshift(newComment);
        this.saveComments(this.comments);

        // Обновляем счетчик комментариев в статье
        this.updateArticleCommentsCount(articleId);

        return { success: true, comment: newComment };
    }

    // Обновление счетчика комментариев в статье
    updateArticleCommentsCount(articleId) {
        const articles = JSON.parse(localStorage.getItem('articles') || '[]');
        const article = articles.find(a => a.id === parseInt(articleId));
        
        if (article) {
            article.commentsCount = this.getArticleComments(articleId).length;
            localStorage.setItem('articles', JSON.stringify(articles));
        }
    }

    // Получение комментариев для статьи
    getArticleComments(articleId) {
        return this.comments
            .filter(comment => comment.articleId === parseInt(articleId) && comment.isApproved)
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Лайк комментария
    likeComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        if (comment) {
            comment.likes = (comment.likes || 0) + 1;
            comment.updatedAt = new Date().toISOString();
            this.saveComments(this.comments);
            return { success: true, likes: comment.likes };
        }
        return { success: false, error: 'Комментарий не найден' };
    }

    // Удаление комментария (для автора и модераторов)
    deleteComment(commentId) {
        const comment = this.comments.find(c => c.id === commentId);
        
        if (!comment) {
            return { success: false, error: 'Комментарий не найден' };
        }

        if (!authSystem.currentUser) {
            return { success: false, error: 'Требуется авторизация' };
        }

        // Проверка прав: автор комментария или редактор
        const canDelete = comment.authorId === authSystem.currentUser.id || 
                         authSystem.hasPermission('editor');

        if (!canDelete) {
            return { success: false, error: 'Недостаточно прав для удаления' };
        }

        this.comments = this.comments.filter(c => c.id !== commentId);
        this.saveComments(this.comments);

        // Обновляем счетчик в статье
        this.updateArticleCommentsCount(comment.articleId);

        return { success: true };
    }

    // Отображение комментариев для статьи
    displayComments(articleId, container) {
        const comments = this.getArticleComments(articleId);
        
        if (comments.length === 0) {
            container.innerHTML = `
                <div class="no-comments">
                    <h3>Пока нет комментариев</h3>
                    <p>Будьте первым, кто оставит комментарий!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = comments.map(comment => `
            <div class="comment" data-comment-id="${comment.id}">
                <div class="comment-header">
                    <div class="comment-author">
                        <strong>${comment.author}</strong>
                        ${comment.authorFaction ? `<span class="comment-faction">${comment.authorFaction}</span>` : ''}
                    </div>
                    <div class="comment-meta">
                        <span class="comment-time">${this.formatTime(comment.createdAt)}</span>
                        ${authSystem.currentUser && (comment.authorId === authSystem.currentUser.id || authSystem.hasPermission('editor')) ? `
                            <button onclick="commentSystem.deleteCommentHandler(${comment.id})" class="comment-delete">🗑️</button>
                        ` : ''}
                    </div>
                </div>
                <div class="comment-content">
                    ${comment.content}
                </div>
                <div class="comment-footer">
                    <button onclick="commentSystem.likeCommentHandler(${comment.id})" class="comment-like">
                        👍 <span class="like-count">${comment.likes || 0}</span>
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Форматирование времени
    formatTime(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'только что';
        if (minutes < 60) return `${minutes} мин. назад`;
        if (hours < 24) return `${hours} ч. назад`;
        if (days < 7) return `${days} дн. назад`;
        
        return date.toLocaleDateString('ru-RU');
    }

    // Обработчики для вызова из HTML
    likeCommentHandler(commentId) {
        if (!authSystem.currentUser) {
            alert('Для оценки комментариев требуется авторизация');
            return;
        }

        const result = this.likeComment(commentId);
        if (result.success) {
            const likeBtn = document.querySelector(`[data-comment-id="${commentId}"] .like-count`);
            if (likeBtn) {
                likeBtn.textContent = result.likes;
                
                // Анимация лайка
                likeBtn.parentElement.style.transform = 'scale(1.2)';
                setTimeout(() => {
                    likeBtn.parentElement.style.transform = 'scale(1)';
                }, 200);
            }
        }
    }

    deleteCommentHandler(commentId) {
        if (confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            const result = this.deleteComment(commentId);
            if (result.success) {
                const commentElement = document.querySelector(`[data-comment-id="${commentId}"]`);
                if (commentElement) {
                    commentElement.style.opacity = '0';
                    setTimeout(() => {
                        commentElement.remove();
                        this.updateCommentsCountDisplay();
                    }, 300);
                }
            } else {
                alert('Ошибка: ' + result.error);
            }
        }
    }

    // Обновление отображения счетчика комментариев
    updateCommentsCountDisplay() {
        const countElement = document.getElementById('comments-count');
        if (countElement) {
            const comments = document.querySelectorAll('.comment');
            countElement.textContent = comments.length;
        }
    }

    // Инициализация системы комментариев на странице
    initCommentsSection(articleId) {
        const commentsContainer = document.getElementById('comments-container');
        const commentForm = document.getElementById('comment-form');
        const commentsCount = document.getElementById('comments-count');

        if (commentsContainer) {
            this.displayComments(articleId, commentsContainer);
            this.updateCommentsCountDisplay();
        }

        if (commentForm) {
            commentForm.onsubmit = (e) => {
                e.preventDefault();
                this.handleCommentSubmit(articleId);
            };
        }
    }

    // Обработка отправки комментария
    handleCommentSubmit(articleId) {
        const commentInput = document.getElementById('comment-text');
        const content = commentInput.value.trim();

        if (!authSystem.currentUser) {
            alert('Для комментирования необходимо войти в систему');
            window.location.href = 'login.html';
            return;
        }

        const result = this.addComment(articleId, content);
        
        if (result.success) {
            commentInput.value = '';
            this.displayComments(articleId, document.getElementById('comments-container'));
            this.updateCommentsCountDisplay();
            
            // Показываем уведомление
            this.showNotification('Комментарий добавлен!', 'success');
        } else {
            this.showNotification('Ошибка: ' + result.error, 'error');
        }
    }

    // Показать уведомление
    showNotification(message, type) {
        const notification = document.createElement('div');
        notification.className = `comment-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 6px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        if (type === 'success') {
            notification.style.background = '#27ae60';
        } else {
            notification.style.background = '#e74c3c';
        }

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }
}

// Глобальный экземпляр системы комментариев
const commentSystem = new CommentSystem();

// CSS анимации для комментариев
const commentStyles = `
@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}

.comments-section {
    margin-top: 3rem;
    padding-top: 2rem;
    border-top: 2px solid var(--border);
}

.comments-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.comments-title {
    color: var(--text);
    font-size: 1.5rem;
}

.comments-count {
    background: var(--primary);
    color: white;
    padding: 0.3rem 0.8rem;
    border-radius: 4px;
    font-size: 0.9rem;
    font-weight: bold;
}

.comment-form {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    margin-bottom: 2rem;
}

.comment-form textarea {
    width: 100%;
    padding: 1rem;
    background: var(--background);
    border: 1px solid var(--border);
    border-radius: 6px;
    color: var(--text);
    font-size: 1rem;
    resize: vertical;
    min-height: 100px;
    margin-bottom: 1rem;
}

.comment-form textarea:focus {
    outline: none;
    border-color: var(--primary);
}

.comment-form-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.comment-login-prompt {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.comment-login-prompt a {
    color: var(--primary);
    text-decoration: none;
}

.comment-login-prompt a:hover {
    text-decoration: underline;
}

.comments-list {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.comment {
    background: var(--surface);
    padding: 1.5rem;
    border-radius: 8px;
    border: 1px solid var(--border);
    transition: all 0.3s;
}

.comment:hover {
    border-color: var(--primary);
}

.comment-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.comment-author {
    display: flex;
    align-items: center;
    gap: 0.8rem;
}

.comment-author strong {
    color: var(--text);
}

.comment-faction {
    background: var(--primary);
    color: white;
    padding: 0.2rem 0.6rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: bold;
}

.comment-meta {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.comment-time {
    font-size: 0.8rem;
}

.comment-delete {
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: 0.2rem;
    border-radius: 4px;
    transition: all 0.3s;
}

.comment-delete:hover {
    color: #e74c3c;
    background: rgba(231, 76, 60, 0.1);
}

.comment-content {
    color: var(--text);
    line-height: 1.6;
    margin-bottom: 1rem;
}

.comment-footer {
    display: flex;
    justify-content: flex-end;
}

.comment-like {
    background: none;
    border: 1px solid var(--border);
    padding: 0.4rem 0.8rem;
    border-radius: 4px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s;
    display: flex;
    align-items: center;
    gap: 0.3rem;
}

.comment-like:hover {
    border-color: var(--primary);
    color: var(--primary);
}

.like-count {
    font-weight: bold;
}

.no-comments {
    text-align: center;
    padding: 3rem 2rem;
    background: var(--surface);
    border-radius: 8px;
    border: 2px dashed var(--border);
}

.no-comments h3 {
    color: var(--text);
    margin-bottom: 1rem;
}

.no-comments p {
    color: var(--text-secondary);
}
`;

// Добавляем стили в документ
const styleSheet = document.createElement('style');
styleSheet.textContent = commentStyles;
document.head.appendChild(styleSheet);