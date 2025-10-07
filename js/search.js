// Система поиска по сайту
class SearchSystem {
    constructor() {
        this.searchIndex = this.buildSearchIndex();
    }

    // Построение поискового индекса
    buildSearchIndex() {
        const articles = JSON.parse(localStorage.getItem('articles') || '[]');
        const index = [];

        articles.forEach(article => {
            if (article.isPublished && !article.needsModeration) {
                index.push({
                    id: article.id,
                    title: article.title,
                    content: article.content,
                    category: article.category,
                    author: article.author,
                    tags: article.tags || [],
                    date: article.createdAt,
                    type: 'article'
                });
            }
        });

        return index;
    }

    // Выполнение поиска
    performSearch(query) {
        if (!query.trim()) return [];

        const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 2);
        if (searchTerms.length === 0) return [];

        const results = this.searchIndex.map(item => {
            let score = 0;

            searchTerms.forEach(term => {
                // Поиск в заголовке (высокий приоритет)
                if (item.title.toLowerCase().includes(term)) {
                    score += 10;
                }

                // Поиск в содержании (средний приоритет)
                if (item.content.toLowerCase().includes(term)) {
                    score += 5;
                }

                // Поиск в тегах (высокий приоритет)
                if (item.tags.some(tag => tag.toLowerCase().includes(term))) {
                    score += 8;
                }

                // Поиск в категории (низкий приоритет)
                if (item.category.toLowerCase().includes(term)) {
                    score += 3;
                }

                // Поиск в авторе (низкий приоритет)
                if (item.author.toLowerCase().includes(term)) {
                    score += 2;
                }
            });

            return { ...item, score };
        }).filter(item => item.score > 0)
          .sort((a, b) => b.score - a.score);

        return results;
    }

    // Отображение результатов поиска
    displaySearchResults(results, container) {
        if (results.length === 0) {
            container.innerHTML = `
                <div class="no-results">
                    <h3>Ничего не найдено</h3>
                    <p>Попробуйте изменить поисковый запрос</p>
                </div>
            `;
            return;
        }

        container.innerHTML = results.map(result => `
            <article class="search-result-item">
                <div class="search-result-category">${result.category.toUpperCase()}</div>
                <h3><a href="article.html?id=${result.id}">${result.title}</a></h3>
                <p class="search-result-excerpt">${this.highlightText(result.content, 150)}</p>
                <div class="search-result-meta">
                    <span class="author">${result.author}</span>
                    <span class="date">${new Date(result.date).toLocaleDateString('ru-RU')}</span>
                </div>
            </article>
        `).join('');
    }

    // Подсветка текста в результатах
    highlightText(text, maxLength) {
        const query = document.getElementById('search-input').value.toLowerCase();
        const terms = query.split(' ').filter(term => term.length > 2);

        let excerpt = text.substring(0, maxLength);
        if (text.length > maxLength) {
            excerpt += '...';
        }

        terms.forEach(term => {
            const regex = new RegExp(`(${term})`, 'gi');
            excerpt = excerpt.replace(regex, '<mark>$1</mark>');
        });

        return excerpt;
    }
}

// Глобальный экземпляр системы поиска
const searchSystem = new SearchSystem();

// Глобальные функции поиска
function performSearch() {
    const query = document.getElementById('search-input').value;
    const results = searchSystem.performSearch(query);
    
    // В реальной системе здесь будет переход на страницу результатов
    if (results.length > 0) {
        alert(`Найдено ${results.length} результатов по запросу: "${query}"`);
        // Временное решение - показываем первый результат
        window.location.href = `article.html?id=${results[0].id}`;
    } else {
        alert('Ничего не найдено. Попробуйте изменить запрос.');
    }
}

// Обработка Enter в поле поиска
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});