async function initSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    try {
        const response = await fetch('/src/html/sidebar.html');
        container.innerHTML = await response.text();

        if (window.lucide) {
            window.lucide.createIcons();
        }

        const currentPath = window.location.pathname;
        const navItems = document.querySelectorAll('.nav-item');
        
        navItems.forEach(item => {
            if (currentPath.includes(item.getAttribute('href'))) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

    } catch (err) {
        console.error('Failed to load sidebar:', err);
    }
}

document.addEventListener('DOMContentLoaded', initSidebar);