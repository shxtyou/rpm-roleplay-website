// Система аутентификации RPM SMI
class AuthSystem {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.getCurrentUser();
    }

    // Загрузка пользователей из localStorage
    loadUsers() {
        const users = localStorage.getItem('rpm_smi_users');
        if (!users) {
            // Только пустой массив - без демо-аккаунтов
            const defaultUsers = [];
            this.saveUsers(defaultUsers);
            return defaultUsers;
        }
        return JSON.parse(users);
    }

    // Сохранение пользователей
    saveUsers(users) {
        localStorage.setItem('rpm_smi_users', JSON.stringify(users));
    }

    // Получение текущего пользователя
    getCurrentUser() {
        const userData = localStorage.getItem('rpm_smi_current_user');
        return userData ? JSON.parse(userData) : null;
    }

    // Вход в систему
    login(email, password) {
        const user = this.users.find(u => 
            (u.email === email || u.username === email) && 
            u.password === password && 
            u.isActive
        );

        if (user) {
            this.currentUser = user;
            localStorage.setItem('rpm_smi_current_user', JSON.stringify(user));
            this.updateUI();
            return { success: true, user };
        } else {
            return { success: false, error: 'Неверный email/логин или пароль' };
        }
    }

    // Выход из системы
    logout() {
        this.currentUser = null;
        localStorage.removeItem('rpm_smi_current_user');
        this.updateUI();
        window.location.href = 'index.html';
    }

    // Регистрация нового пользователя
    register(userData) {
        const existingUser = this.users.find(u => 
            u.email === userData.email || u.username === userData.username
        );

        if (existingUser) {
            return { success: false, error: 'Пользователь с таким email или логином уже существует' };
        }

        const newUser = {
            id: Date.now(),
            ...userData,
            role: 'journalist', // По умолчанию журналист
            isActive: false, // Требует активации редактором
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        this.saveUsers(this.users);

        return { 
            success: true, 
            message: 'Регистрация успешна. Ожидайте активации аккаунта редактором.' 
        };
    }

    // Обновление UI в зависимости от авторизации
    updateUI() {
        const authButtons = document.getElementById('auth-buttons');
        const userMenu = document.getElementById('user-menu');
        const userName = document.getElementById('user-name');
        const adminLink = document.getElementById('admin-link');

        if (this.currentUser) {
            if (authButtons) authButtons.style.display = 'none';
            if (userMenu) userMenu.style.display = 'flex';
            if (userName) userName.textContent = this.currentUser.displayName;
            if (adminLink) {
                adminLink.style.display = this.currentUser.role !== 'journalist' ? 'block' : 'none';
            }
        } else {
            if (authButtons) authButtons.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }

    // Проверка прав доступа
    hasPermission(requiredRole) {
        if (!this.currentUser) return false;

        const roleHierarchy = {
            'journalist': 1,
            'editor': 2,
            'chief_editor': 3
        };

        return roleHierarchy[this.currentUser.role] >= roleHierarchy[requiredRole];
    }

    // Получение всех пользователей (только для редакторов)
    getAllUsers() {
        if (!this.hasPermission('editor')) {
            return [];
        }
        return this.users;
    }

    // Активация/деактивация пользователя
    toggleUserStatus(userId) {
        if (!this.hasPermission('editor')) {
            return { success: false, error: 'Недостаточно прав' };
        }

        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.isActive = !user.isActive;
            this.saveUsers(this.users);
            return { success: true, user };
        }

        return { success: false, error: 'Пользователь не найден' };
    }

    // Изменение роли пользователя
    changeUserRole(userId, newRole) {
        if (!this.hasPermission('chief_editor')) {
            return { success: false, error: 'Недостаточно прав' };
        }

        const user = this.users.find(u => u.id === userId);
        if (user) {
            user.role = newRole;
            this.saveUsers(this.users);
            return { success: true, user };
        }

        return { success: false, error: 'Пользователь не найден' };
    }

    // Создание первого администратора (для инициализации)
    createFirstAdmin(userData) {
        if (this.users.length > 0) {
            return { success: false, error: 'Система уже инициализирована' };
        }

        const adminUser = {
            id: 1,
            username: userData.username,
            email: userData.email,
            password: userData.password,
            role: 'chief_editor',
            displayName: userData.displayName,
            faction: 'СМИ',
            createdAt: new Date().toISOString(),
            isActive: true
        };

        this.users.push(adminUser);
        this.saveUsers(this.users);

        return { success: true, user: adminUser };
    }
}

// Глобальный экземпляр системы аутентификации
const authSystem = new AuthSystem();

// Функции для глобального использования
function login(email, password) {
    return authSystem.login(email, password);
}

function logout() {
    authSystem.logout();
}

function register(userData) {
    return authSystem.register(userData);
}

function hasPermission(requiredRole) {
    return authSystem.hasPermission(requiredRole);
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    authSystem.updateUI();
    
    // Автоматическое создание первого админа если пользователей нет
    if (authSystem.users.length === 0) {
        const firstAdminData = {
            username: 'admin',
            email: 'admin@rpm-smi.com',
            password: 'admin123',
            displayName: 'Главный редактор'
        };
        
        const result = authSystem.createFirstAdmin(firstAdminData);
        if (result.success) {
            console.log('Первый администратор создан. Логин: admin, Пароль: admin123');
        }
    }
});
