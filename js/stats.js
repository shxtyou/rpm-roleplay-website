// Система статистики и управления фракциями
class StatsSystem {
    constructor() {
        this.factions = this.loadFactions();
        this.stats = this.loadStats();
    }

    // Загрузка фракций
    loadFactions() {
        const factions = localStorage.getItem('rpm_smi_factions');
        if (!factions) {
            const defaultFactions = [
                {
                    id: 1,
                    name: 'Мэрия',
                    type: 'official',
                    leader: 'Вакантно',
                    activity: 85,
                    members: 12,
                    description: 'Городское управление и администрация'
                },
                {
                    id: 2,
                    name: 'СМИ',
                    type: 'official',
                    leader: 'Вакантно',
                    activity: 90,
                    members: 8,
                    description: 'Средства массовой информации'
                },
                {
                    id: 3,
                    name: 'ЦПД',
                    type: 'official',
                    leader: 'Вакантно',
                    activity: 95,
                    members: 25,
                    description: 'Центральный полицейский департамент'
                },
                {
                    id: 4,
                    name: 'FBI',
                    type: 'official',
                    leader: 'Вакантно',
                    activity: 80,
                    members: 15,
                    description: 'Федеральное бюро расследований'
                },
                {
                    id: 5,
                    name: 'Армия',
                    type: 'official',
                    leader: 'Вакантно',
                    activity: 75,
                    members: 20,
                    description: 'Вооруженные силы штата'
                },
                {
                    id: 6,
                    name: 'Университет',
                    type: 'official',
                    leader: 'Вакантно',
                    activity: 70,
                    members: 30,
                    description: 'Образовательное учреждение'
                },
                {
                    id: 7,
                    name: 'Crips',
                    type: 'unofficial',
                    leader: 'Вакантно',
                    activity: 65,
                    members: 18,
                    description: 'Банда чернокожих американцев'
                },
                {
                    id: 8,
                    name: 'Southside Serpents',
                    type: 'unofficial',
                    leader: 'Вакантно',
                    activity: 60,
                    members: 12,
                    description: 'Банда байкеров'
                },
                {
                    id: 9,
                    name: 'Русская мафия',
                    type: 'unofficial',
                    leader: 'Вакантно',
                    activity: 55,
                    members: 10,
                    description: 'Преступная организация'
                }
            ];
            this.saveFactions(defaultFactions);
            return defaultFactions;
        }
        return JSON.parse(factions);
    }

    // Сохранение фракций
    saveFactions(factions) {
        localStorage.setItem('rpm_smi_factions', JSON.stringify(factions));
    }

    // Загрузка статистики
    loadStats() {
        const stats = localStorage.getItem('rpm_smi_stats');
        if (!stats) {
            const defaultStats = {
                totalArticles: 0,
                totalComments: 0,
                totalUsers: 3,
                onlinePlayers: 0,
                mostActiveFaction: 'СМИ',
                lastUpdate: new Date().toISOString()
            };
            this.saveStats(defaultStats);
            return defaultStats;
        }
        return JSON.parse(stats);
    }

    // Сохранение статистики
    saveStats(stats) {
        localStorage.setItem('rpm_smi_stats', JSON.stringify(stats));
    }

    // Обновление статистики
    updateStats() {
        const articles = JSON.parse(localStorage.getItem('articles') || '[]');
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        const users = JSON.parse(localStorage.getItem('rpm_smi_users') || '[]');

        this.stats.totalArticles = articles.length;
        this.stats.totalComments = comments.length;
        this.stats.totalUsers = users.length;
        this.stats.lastUpdate = new Date().toISOString();

        this.saveStats(this.stats);
    }

    // Получение онлайн игроков (имитация)
    getOnlinePlayers() {
        // В реальном проекте здесь будет API запрос
        const baseOnline = 85;
        const randomVariation = Math.floor(Math.random() * 40) - 20;
        return Math.max(50, baseOnline + randomVariation);
    }

    // Обновление виджета фракций
    updateFactionsWidget() {
        const factionsList = document.getElementById('factions-list');
        if (!factionsList) return;

        // Сортируем по активности
        const sortedFactions = [...this.factions].sort((a, b) => b.activity - a.activity).slice(0, 5);

        factionsList.innerHTML = sortedFactions.map(faction => `
            <div class="faction-item">
                <div class="faction-info">
                    <div class="faction-name">${faction.name}</div>
                    <div class="faction-type ${faction.type}">${faction.type === 'official' ? 'Офиц.' : 'Неофиц.'}</div>
                </div>
                <div class="faction-activity">
                    <div class="activity-bar">
                        <div class="activity-fill" style="width: ${faction.activity}%"></div>
                    </div>
                    <span>${faction.activity}%</span>
                </div>
            </div>
        `).join('');
    }

    // Обновление статистики на странице
    updateStatsDisplay() {
        const onlineCount = document.getElementById('online-count');
        if (onlineCount) {
            onlineCount.textContent = this.getOnlinePlayers();
        }

        this.updateStats();
    }

    // Обновление лидера фракции
    updateFactionLeader(factionId, leaderName) {
        const faction = this.factions.find(f => f.id === factionId);
        if (faction) {
            faction.leader = leaderName;
            this.saveFactions(this.factions);
            return { success: true, faction };
        }
        return { success: false, error: 'Фракция не найдена' };
    }

    // Получение активности фракции
    getFactionActivity(factionId) {
        const faction = this.factions.find(f => f.id === factionId);
        return faction ? faction.activity : 0;
    }

    // Обновление активности фракции
    updateFactionActivity(factionId, activity) {
        const faction = this.factions.find(f => f.id === factionId);
        if (faction) {
            faction.activity = Math.max(0, Math.min(100, activity));
            this.saveFactions(this.factions);
            return { success: true, faction };
        }
        return { success: false, error: 'Фракция не найдена' };
    }
}

// Глобальный экземпляр системы статистики
const statsSystem = new StatsSystem();

// Инициализация статистики
document.addEventListener('DOMContentLoaded', function() {
    statsSystem.updateFactionsWidget();
    statsSystem.updateStatsDisplay();

    // Обновляем онлайн каждые 30 секунд
    setInterval(() => {
        statsSystem.updateStatsDisplay();
    }, 30000);

    // Обновляем фракции каждые 2 минуты
    setInterval(() => {
        statsSystem.updateFactionsWidget();
    }, 120000);
});