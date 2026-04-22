let allHotels = [];

if (!sessionStorage.getItem('hotel_token')) {
    const baseUrl = import.meta.env.BASE_URL;
    window.location.href = `${baseUrl}src/html/login.html`;
}

async function fetchHotels() {
    try {
        const response = await fetch('http://localhost:5000/api/hotels', {
            headers: {
                'Authorization': sessionStorage.getItem('hotel_token')
            }
        });

        if (!response.ok) throw new Error('Failed to fetch hotels');

        allHotels = await response.json();
        renderHotels(allHotels);
    } catch (error) {
        console.error("API Error:", error);
        const grid = document.getElementById('hotels-grid');
        if (grid) {
            grid.innerHTML = `<div class="p-8 text-center col-span-full text-red-500">Error loading hotels. Please try again later.</div>`;
        }
    }
}

function renderHotels(filteredList) {
    const grid = document.getElementById('hotels-grid');
    if (!grid) return;

    if (filteredList.length === 0) {
        grid.innerHTML = `<div class="p-8 text-center col-span-full text-gray-500">No hotels found matching your filters.</div>`;
        return;
    }

    grid.innerHTML = filteredList.map(h => {
        const baseUrl = import.meta.env.BASE_URL;
        
        const name = h.name || "Unknown Hotel";
        const stars = h.numberOfStars || 0;
        const address = h.address || "No address provided";
        const services = h.hotelServices || [];

        const targetUrl = `${baseUrl}src/html/search-availability.html?hotel=${encodeURIComponent(name)}`;

        return `
            <div class="card hotel-card">
                <div class="card-content">
                    <h3 style="margin:0 0 10px 0">${name}</h3>
                    <div style="color: #fbbf24; margin-bottom: 8px;">
                        ${'⭐'.repeat(stars)}
                    </div>
                    <p style="font-size: 12px; color: gray; margin-bottom: 15px;">
                        <i data-lucide="map-pin" style="width:12px; display:inline-block; vertical-align:middle;"></i> ${address}
                    </p>
                    <div style="display:flex; flex-wrap:wrap; gap:5px; margin-bottom: 20px;">
                        ${services.map(s => `<span class="service-tag">✓ ${s.name}</span>`).join('')}
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
    
    const activeServiceTerms = Array.from(document.querySelectorAll('.filter-service:checked'))
                                .map(cb => cb.value.toLowerCase());  

    const filtered = allHotels.filter(h => {
        const name = (h.name || "").toLowerCase();
        const address = (h.address || "").toLowerCase();
        const stars = h.numberOfStars || 0;
        const services = h.hotelServices || [];

        const matchesSearch = name.includes(searchText) || address.includes(searchText);
        const matchesStars = activeStars.length === 0 || activeStars.includes(stars);
        
        const matchesServices = activeServiceTerms.length === 0 || 
            activeServiceTerms.every(term => 
                services.some(s => (s.name || "").toLowerCase().includes(term))
            );
        
        return matchesSearch && matchesStars && matchesServices;
    });

    renderHotels(filtered);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchHotels();
    
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
            renderHotels(allHotels);
        });
    }
});