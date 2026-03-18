async function initSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    try {
        const isProd = window.location.hostname.includes('github.io');
        const root = isProd ? '/E-Hotel' : '';
        
        const response = await fetch(`${root}/src/html/sidebar.html`);
        
        if (!response.ok) throw new Error(response.status);
        
        container.innerHTML = await response.text();

        const currentPath = window.location.pathname;
        
        container.querySelectorAll('.nav-item').forEach(link => {
            const originalHref = link.getAttribute('href');
            const fullHref = originalHref.startsWith('/') ? `${root}${originalHref}` : `${root}/${originalHref}`;
            link.href = fullHref;

            const isHome = (currentPath === `${root}/` || currentPath === `${root}/index.html`) && originalHref.includes('index.html');
            const isExactPage = currentPath.includes(originalHref) && !originalHref.includes('index.html');

            if (isHome || isExactPage) {
                link.classList.add('active');
            }
        });

        if (window.lucide) window.lucide.createIcons();

        const toggleBtn = container.querySelector('#menu-toggle');
        const content = container.querySelector('#sidebar-content');

        if (toggleBtn && content) {
            toggleBtn.onclick = function() {
                content.classList.toggle('is-visible');
                const icon = toggleBtn.querySelector('i');
                const isOpen = content.classList.contains('is-visible');
                if (icon && window.lucide) {
                    icon.setAttribute('data-lucide', isOpen ? 'x' : 'menu');
                    window.lucide.createIcons();
                }
            };
        }
    } catch (err) {
        console.error(err);
    }
}

document.addEventListener('DOMContentLoaded', initSidebar);