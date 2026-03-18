async function initSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    try {
        const response = await fetch('/src/html/sidebar.html');
        container.innerHTML = await response.text();

        if (window.lucide) window.lucide.createIcons();

        const currentPath = window.location.pathname;
        container.querySelectorAll('.nav-item').forEach(item => {
            if (currentPath.includes(item.getAttribute('href'))) item.classList.add('active');
        });

        const toggleBtn = container.querySelector('#menu-toggle');
        const content = container.querySelector('#sidebar-content');

        if (toggleBtn && content) {
            toggleBtn.onclick = function() {
                content.classList.toggle('is-visible');
                
                const icon = toggleBtn.querySelector('i');
                const isOpen = content.classList.contains('is-visible');
                icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                if (window.lucide) window.lucide.createIcons();
            };
        }
    } catch (err) {
        console.error(err);
    }
}
document.addEventListener('DOMContentLoaded', initSidebar);