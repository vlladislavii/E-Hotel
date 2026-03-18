import { stats, activity, upcomingCheckouts } from './data.js';

function renderCheckouts() {
    const container = document.getElementById('upcoming-checkouts');
    if (!container) return;

    container.innerHTML = upcomingCheckouts.map(c => `
        <div class="activity-item" style="background: white; border: 1px solid #e5e7eb; margin-bottom: 12px; padding: 12px; border-radius: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
            <div style="display: flex; justify-content: space-between; align-items: start;">
                <span style="font-size: 14px; font-weight: 500;">${c.guest}</span>
                <span style="font-size: 12px; color: #6b7280; font-weight: 600;">Room ${c.room}</span>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: end; margin-top: 8px;">
                <span style="font-size: 12px; color: #9ca3af;">${c.hotel}</span>
                <span style="font-size: 12px; font-weight: 700; color: #ea580c; font-style: italic;">ETD: ${c.time}</span>
            </div>
        </div>
    `).join('');
}

function renderStats() {
    const grid = document.getElementById('stats-grid');
    grid.innerHTML = stats.map(s => `
        <div class="card">
            <div class="stat-card-inner">
                <div>
                    <p style="color: grey; font-size: 0.8rem; margin:0;">${s.title}</p>
                    <p class="stat-value">${s.value}</p>
                    <p class="stat-change">${s.change}</p>
                </div>
                <div class="icon-box" style="background: ${s.color}">
                    <i data-lucide="${s.icon}"></i>
                </div>
            </div>
        </div>
    `).join('');
}

function renderActivity() {
    const container = document.getElementById('recent-activity');
    container.innerHTML = activity.map(a => `
        <div class="activity-item">
            <div style="display:flex; justify-content:space-between">
                <strong>${a.guest}</strong>
                <span style="font-size: 0.7rem; color: blue;">${a.type}</span>
            </div>
            <div style="font-size: 0.7rem; color: gray; margin-top: 4px;">${a.hotel} • ${a.time}</div>
        </div>
    `).join('');
}


document.addEventListener('DOMContentLoaded', () => {
    renderStats();
    renderActivity();
    renderCheckouts();
    lucide.createIcons();
});