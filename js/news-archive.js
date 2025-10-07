// Логика для страницы всех новостей
let currentPage = 1;
const articlesPerPage = 10;

function displayArchiveArticles() {
    const articles = loadArticles();
    const categoryFilter = document.getElementById('category-filter').value;
    const sortFilter = document.getElementById('sort-filter').value;
    
    // Фильтрация по категории
    let filteredArticles = articles;
    if (categoryFilter !== 'all') {
        filteredArticles = articles.filter(article => article.category === categoryFilter);
    }
    
    // Сортировка
    if (sortFilter === 'newest') {
        filteredArticles.sort((a, b) => new Date(b.date) - new Date(a.date));
    } else {
        filteredArticles.sort((a, b) => new Date(a.date) - new Date(b.date));
    }
    
    const archiveList = document.getElementById('archive-list');
    
    if (filteredArticles.length === 0) {
        archiveList.innerHTML = `
            <div class="no-articles">
                <h3>Нет новостей в выбранной категории</h3>
                <p>Попробуйте выбрать другую категорию или добавьте новости через админ-панель</p>
                <a href="admin.html" class="btn btn-primary">Добавить новость</a>
            </div>
        `;
        document.getElementById('pagination').style.display = 'none';
        return;
    }
    
    // Пагинация
    const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);
    const startIndex = (currentPage - 1) * articlesPerPage;
    const paginatedArticles = filteredArticles.slice(startIndex, startIndex + articlesPerPage);
    
    // Отображение статей
    archiveList.innerHTML = paginatedArticles.map(article => `
        <article class="archive-item">
            <div class="archive-item-header">
                <div class="article-category">${article.category.toUpperCase()}</div>
                ${article.isBreaking ? '<span class="breaking-badge">🔥 Экстренная</span>' : ''}
            </div>
            <h2 class="archive-item-title">${article.title}</h2>
            <p class="archive-item-excerpt">${article.content.substring(0, 150)}...</p>
            <div class="archive-item-meta">
                <span class="author">${article.author}</span>
                <span class="date">${new Date(article.date).toLocaleDateString('ru-RU')}</span>
                <span class="time">${new Date(article.date).toLocaleTimeString('ru-RU', {hour: '2-digit', minute:'2-digit'})}</span>
            </div>
        </article>
    `).join('');
    
    // Настройка пагинации
    setupPagination(totalPages);
}

function setupPagination(totalPages) {
    const pagination = document.getElementById('pagination');
    const currentPageElement = document.getElementById('current-page');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    currentPageElement.textContent = currentPage;
    
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
    
    prevBtn.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayArchiveArticles();
            window.scrollTo(0, 0);
        }
    };
    
    nextBtn.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayArchiveArticles();
            window.scrollTo(0, 0);
        }
    };
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    displayArchiveArticles();
    
    // Обработчики фильтров
    document.getElementById('category-filter').addEventListener('change', () => {
        currentPage = 1;
        displayArchiveArticles();
    });
    
    document.getElementById('sort-filter').addEventListener('change', () => {
        currentPage = 1;
        displayArchiveArticles();
    });
    
    // Обработка параметров URL
    const urlParams = new URLSearchParams(window.location.search);
    const category = urlParams.get('category');
    if (category) {
        document.getElementById('category-filter').value = category;
        displayArchiveArticles();
    }
});