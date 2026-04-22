if (!sessionStorage.getItem('hotel_token')) {
    const baseUrl = import.meta.env.BASE_URL || '/';
    window.location.href = `${baseUrl}src/html/login.html`;
}

async function loadDashboardData() {
    try {
        const response = await fetch('http://localhost:5000/api/dashboard/stats');

        const data = await response.json();

        renderStats(data.stats);
        renderActivity(data.activity);
        renderCheckouts(data.checkouts);
        
        if (window.lucide) lucide.createIcons();
        
    } catch (err) {
        console.error("Dashboard load error:", err);
    }
}

function renderStats(stats) {
    const grid = document.getElementById('stats-grid');
    if (!grid || !stats) return;
    
    grid.innerHTML = stats.map(s => `
        <div class="card">
            <div class="stat-card-inner">
                <div>
                    <p style="color: grey; font-size: 0.8rem; margin:0;">${s.title}</p>
                    <p class="stat-value">${s.value}</p>
                    <p class="stat-change">${s.change || ''}</p>
                </div>
                <div class="icon-box" style="background: ${s.color || '#3b82f6'}">
                    <i data-lucide="${s.icon}"></i>
                </div>
            </div>
        </div>
    `).join('');
}

function renderActivity(activity) {
    const container = document.getElementById('recent-activity');
    if (!container || !activity) return;

    if (activity.length === 0) {
        container.innerHTML = `<p style="font-size: 0.8rem; color: gray; text-align: center;">No recent activity</p>`;
        return;
    }

    container.innerHTML = activity.map(a => `
        <div class="activity-item">
            <div style="display:flex; justify-content:space-between">
                <strong style="font-size: 0.85rem;">${a.guest}</strong>
                <span class="status-badge status-${a.type}" style="font-size: 0.6rem; padding: 2px 6px;">${a.type}</span>
            </div>
            <div style="font-size: 0.7rem; color: gray; margin-top: 4px;">
                ${a.hotel} • ${a.time}
            </div>
        </div>
    `).join('');
}

function renderCheckouts(checkouts) {
    const container = document.getElementById('upcoming-checkouts');
    if (!container || !checkouts) return;

    if (checkouts.length === 0) {
        container.innerHTML = `<p style="font-size: 0.8rem; color: gray; text-align: center;">No checkouts scheduled today</p>`;
        return;
    }

    container.innerHTML = checkouts.map(c => `
        <div class="activity-item" style="background: #f9fafb; border: 1px solid #e5e7eb; margin-bottom: 8px; padding: 10px; border-radius: 6px;">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <span style="font-size: 0.85rem; font-weight: 600;">${c.guest}</span>
                <span style="font-size: 0.75rem; color: #4b5563;">Room ${c.room}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
                <span style="font-size: 0.7rem; color: #9ca3af;">${c.hotel}</span>
                <span style="font-size: 0.7rem; font-weight: 700; color: #ea580c;">${c.time}</span>
            </div>
        </div>
    `).join('');
}

document.addEventListener('DOMContentLoaded', loadDashboardData);