async function initSidebar() {
    const container = document.getElementById('sidebar-container');
    if (!container) return;

    try {
        const baseUrl = import.meta.env.BASE_URL; 
        
        const response = await fetch(`${baseUrl}sidebar.html`);
        
        if (!response.ok) throw new Error(`Sidebar load status: ${response.status}`);
        
        const html = await response.text();
        container.innerHTML = html;

        const currentPath = window.location.pathname;
        
        container.querySelectorAll('.nav-item').forEach(link => {
            const originalHref = link.getAttribute('href');
            
            if (!originalHref) return;

            const cleanHref = originalHref.replace(/^(\.\/|\/)/, '');
            const fullHref = `${baseUrl}${cleanHref}`;
            link.href = fullHref;

            const isHome = (currentPath === baseUrl || currentPath === `${baseUrl}index.html`) && cleanHref.includes('index.html');
            const isExactPage = currentPath.includes(cleanHref) && !cleanHref.includes('index.html');

            if (isHome || isExactPage) {
                link.classList.add('active');
            }
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }

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

        const logoutBtn = container.querySelector('#logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = function() {
                sessionStorage.removeItem('hotel_token');
                sessionStorage.removeItem('cashier_info');
                window.location.href = baseUrl;
            };
        }

    } catch (err) {
        console.error("Sidebar Error:", err);
    }
}

document.addEventListener('DOMContentLoaded', initSidebar);