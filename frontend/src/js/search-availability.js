let currentHotelsData = [];

if (!sessionStorage.getItem('hotel_token')) {
    const baseUrl = import.meta.env.BASE_URL;
    window.location.href = baseUrl;
}

async function loadHotelsToSelect() {
    try {
        const response = await fetch('http://localhost:5000/api/hotels');
        const hotels = await response.json();
        const hotelSelect = document.getElementById('hotel-select');
        
        if (!hotelSelect) return;

        hotels.forEach(h => {
            const option = document.createElement('option');
            option.value = h.id;
            option.textContent = h.name;
            hotelSelect.appendChild(option);
        });

        const urlParams = new URLSearchParams(window.location.search);
        const hotelParamName = urlParams.get('hotel');
        if (hotelParamName) {
            const targetOption = Array.from(hotelSelect.options).find(o => o.text === hotelParamName);
            if (targetOption) {
                hotelSelect.value = targetOption.value;
                handleSearch();
            }
        }
    } catch (err) {
        console.error("Failed to load hotels list:", err);
    }
}

async function handleSearch() {
    const hotelId = document.getElementById('hotel-select').value;
    const type = document.getElementById('room-type-select').value;
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;

    if (from && to && new Date(from) > new Date(to)) {
        alert("Check-out date must be after check-in date!");
        return;
    }

    const params = new URLSearchParams();
    if (hotelId !== 'all') params.append('hotelId', hotelId);
    if (type) params.append('type', type);
    if (from) params.append('from', from);
    if (to) params.append('to', to);

    try {
        const response = await fetch(`http://localhost:5000/api/rooms/search?${params.toString()}`);
        if (!response.ok) throw new Error('Search failed');
        
        const rooms = await response.json();
        
        document.getElementById('results-title').textContent = "Search Results";
        document.getElementById('reset-btn').style.display = "block";
        
        renderRooms(rooms);
    } catch (err) {
        console.error("Search API error:", err);
    }
}

function renderRooms(rooms) {
    const container = document.getElementById('availability-list');
    const countEl = document.getElementById('results-count');
    const isReady = checkFiltersFilled();
    
    if (!container || !countEl) return;

    countEl.textContent = `${rooms.length} rooms available`;
    
    if (rooms.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-muted"></div>`;
        return;
    }

    container.innerHTML = rooms.map(room => {
        const hotelName = room.Hotel?.name || "Unknown Hotel";
        const hotelStars = room.Hotel?.numberOfStars || 0;
        const location = room.Hotel?.address || "No address provided";

        return `
            <div class="card room-card hover-shadow">
                <div class="room-info">
                    <div style="display:flex; align-items:center; gap:10px">
                        <h4>${hotelName}</h4>
                        <div style="color:#fbbf24; font-size:12px">${'⭐'.repeat(hotelStars)}</div>
                    </div>
                    <div class="room-meta">
                        <i data-lucide="map-pin" style="width:14px"></i> ${location}
                    </div>
                    <div class="room-details">
                        <span><i data-lucide="bed" style="width:14px; color:#2563eb"></i> ${room.type.charAt(0).toUpperCase() + room.type.slice(1)} Room</span>
                        <span>Room #${room.number}</span>
                    </div>
                </div>
                <div class="flex-center" style="gap:20px">
                    <div class="price-box">
                        <p style="font-size:12px; color:gray; margin:0">Price per night</p>
                        <p class="price-value">$${room.price}</p>
                    </div>
                    <button 
                        class="btn btn-primary booking-btn" 
                        ${isReady ? '' : 'disabled'} 
                        onclick="goToBooking(${room.id})">
                        Book Room
                    </button>
                </div>
            </div>
        `;
    }).join('');
    
    if (window.lucide) lucide.createIcons();
}

function handleReset() {
    document.getElementById('hotel-select').value = 'all';
    document.getElementById('room-type-select').value = '';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('results-title').textContent = "All Available Rooms";
    document.getElementById('reset-btn').style.display = "none";
    handleSearch();
}

function checkFiltersFilled() {
    const hotel = document.getElementById('hotel-select').value;
    const from = document.getElementById('date-from').value;
    const to = document.getElementById('date-to').value;
    const type = document.getElementById('room-type-select').value;

    return hotel !== 'all' && from !== '' && to !== '' && type !== '';
}

function updateBookingButtonsState() {
    const isReady = checkFiltersFilled();
    const buttons = document.querySelectorAll('.booking-btn');
    buttons.forEach(btn => {
        btn.disabled = !isReady;
    });
}

function goToBooking(roomId) {
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    const baseUrl = import.meta.env.BASE_URL;
    
    let url = `${baseUrl}src/html/booking.html?RoomId=${roomId}`;
    if (dateFrom) url += `&from=${encodeURIComponent(dateFrom)}`;
    if (dateTo) url += `&to=${encodeURIComponent(dateTo)}`;
    
    window.location.href = url;
}

function initSearchPage() {
    loadHotelsToSelect();

    const today = new Date().toISOString().split('T')[0];
    const dateFromInput = document.getElementById('date-from');
    const dateToInput = document.getElementById('date-to');
    
    if (dateFromInput) dateFromInput.min = today;
    if (dateToInput) dateToInput.min = today;

    document.getElementById('search-btn')?.addEventListener('click', handleSearch);
    document.getElementById('reset-btn')?.addEventListener('click', handleReset);

    const filterInputs = ['hotel-select', 'date-from', 'date-to', 'room-type-select'];
    filterInputs.forEach(id => {
        document.getElementById(id)?.addEventListener('change', updateBookingButtonsState);
    });

    handleSearch();
}

document.addEventListener('DOMContentLoaded', initSearchPage);
window.goToBooking = goToBooking;