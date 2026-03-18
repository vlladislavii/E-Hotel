import { Hotels } from './data.js';

function renderHotels(filteredList) {
    const grid = document.getElementById('hotels-grid');
    if (!grid) return;

    if (filteredList.length === 0) {
        grid.innerHTML = `<div class="p-8 text-center col-span-full text-gray-500">No hotels found matching your filters.</div>`;
        return;
    }

    grid.innerHTML = filteredList.map(h => {
    const baseUrl = import.meta.env.BASE_URL;
    const targetUrl = `${baseUrl}src/html/search-availability.html?hotel=${encodeURIComponent(h.name)}`;

    return `
        <div class="card hotel-card">
            <div class="card-content">
                <h3 style="margin:0 0 10px 0">${h.name}</h3>
                <div style="color: #fbbf24; margin-bottom: 8px;">
                    ${'⭐'.repeat(h.stars)}
                </div>
                <p style="font-size: 12px; color: gray; margin-bottom: 15px;">
                    <i data-lucide="map-pin" style="width:12px; display:inline-block; vertical-align:middle;"></i> ${h.address}
                </p>
                <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom: 20px;">
                    ${h.services.map(s => `<span class="service-tag">✓ ${s.name}</span>`).join('')}
                </div>
                <button class="btn btn-primary w-full" 
                        onclick="window.location.href='${targetUrl}'">
                    View Available Rooms
                </button>
            </div>
        </div>
    `;
}).join('');
    if (window.lucide) lucide.createIcons();
}

function applyFilters() {
    const searchInput = document.getElementById('hotel-search');
    const searchText = searchInput ? searchInput.value.toLowerCase() : "";
    
    const activeStars = Array.from(document.querySelectorAll('.filter-star:checked'))
                            .map(cb => parseInt(cb.value));
    
    const activeServiceIds = Array.from(document.querySelectorAll('.filter-service:checked'))
                                 .map(cb => cb.value);  

    const filtered = Hotels.filter(h => {
        const matchesSearch = h.name.toLowerCase().includes(searchText) || 
                             h.address.toLowerCase().includes(searchText);
        
        const matchesStars = activeStars.length === 0 || activeStars.includes(h.stars);
        
        const matchesServices = activeServiceIds.length === 0 || 
            activeServiceIds.every(id => h.services.some(s => s.id === id));
        
        return matchesSearch && matchesStars && matchesServices;
    });

    renderHotels(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
    renderHotels(Hotels);
    
    const searchInput = document.getElementById('hotel-search');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    document.querySelectorAll('.filter-star, .filter-service').forEach(el => {
        el.addEventListener('change', applyFilters);
    });

    const clearBtn = document.getElementById('clear-filters');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            if (searchInput) searchInput.value = '';
            renderHotels(Hotels);
        });
    }

    if (window.lucide) lucide.createIcons();
});