import { Rooms, Bookings } from './data.js';

const uniqueHotels = [...new Set(Rooms.map(r => r.hotelName))].sort();

function isRoomAvailable(roomId, userFrom, userTo) {
    if (!userFrom || !userTo) return true;
    const start = new Date(userFrom);
    const end = new Date(userTo);

    const conflict = Bookings.find(booking => {
        if (booking.roomId !== roomId) return false;
        const bStart = new Date(booking.from);
        const bEnd = new Date(booking.to);
        return (start <= bEnd && end >= bStart);
    });
    return !conflict;
}

function initSearchPage() {
    const hotelSelect = document.getElementById('hotel-select');
    const urlParams = new URLSearchParams(window.location.search);
    const hotelParam = urlParams.get('hotel');

    uniqueHotels.forEach(hotel => {
        const option = document.createElement('option');
        option.value = hotel;
        option.textContent = hotel;
        hotelSelect.appendChild(option);
    });

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date-from').min = today;
    document.getElementById('date-to').min = today;

    if (hotelParam) {
        hotelSelect.value = hotelParam;
        const filtered = Rooms.filter(r => r.hotelName === hotelParam);
        renderRooms(filtered);
    } else {
        renderRooms(Rooms);
    }

    document.getElementById('search-btn').addEventListener('click', handleSearch);
    document.getElementById('reset-btn').addEventListener('click', handleReset);

    const filterInputs = ['hotel-select', 'date-from', 'date-to', 'room-type-select'];
    filterInputs.forEach(id => {
        document.getElementById(id).addEventListener('change', updateBookingButtonsState);
    });
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

function renderRooms(rooms) {
    const container = document.getElementById('availability-list');
    const countEl = document.getElementById('results-count');
    const isReady = checkFiltersFilled();
    
    countEl.textContent = `${rooms.length} rooms available`;
    
    if (rooms.length === 0) {
        container.innerHTML = `<div class="text-center py-12 text-muted">No rooms found matching your criteria.</div>`;
        return;
    }

    container.innerHTML = rooms.map(room => `
        <div class="card room-card hover-shadow">
            <div class="room-info">
                <div style="display:flex; align-items:center; gap:10px">
                    <h4>${room.hotelName}</h4>
                    <div style="color:#fbbf24; font-size:12px">${'⭐'.repeat(room.hotelStars)}</div>
                </div>
                <div class="room-meta">
                    <i data-lucide="map-pin" style="width:14px"></i> ${room.location}
                </div>
                <div class="room-details">
                    <span><i data-lucide="bed" style="width:14px; color:#2563eb"></i> ${room.roomType} Room</span>
                    <span>Room #${room.roomNumber}</span>
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
    `).join('');
    
    if (window.lucide) lucide.createIcons();
}

function goToBooking(roomId) {
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;
    
    let url = `/src/html/booking.html?RoomId=${roomId}`;
    if (dateFrom) url += `&from=${encodeURIComponent(dateFrom)}`;
    if (dateTo) url += `&to=${encodeURIComponent(dateTo)}`;
    
    window.location.href = url;
}

function handleSearch() {
    const hotel = document.getElementById('hotel-select').value;
    const type = document.getElementById('room-type-select').value;
    const dateFrom = document.getElementById('date-from').value;
    const dateTo = document.getElementById('date-to').value;

    if (dateFrom && dateTo && dateFrom > dateTo) {
        alert("Check-out date must be after check-in date!");
        return;
    }

    const filtered = Rooms.filter(room => {
        const matchesHotel = (hotel === 'all' || room.hotelName === hotel);
        const matchesType = (!type || room.roomType === type);
        const matchesDates = isRoomAvailable(room.id, dateFrom, dateTo);
        return matchesHotel && matchesType && matchesDates;
    });

    document.getElementById('results-title').textContent = "Search Results";
    document.getElementById('reset-btn').style.display = "block";
    renderRooms(filtered);
}

function handleReset() {
    document.getElementById('hotel-select').value = 'all';
    document.getElementById('room-type-select').value = '';
    document.getElementById('date-from').value = '';
    document.getElementById('date-to').value = '';
    document.getElementById('results-title').textContent = "All Available Rooms";
    document.getElementById('reset-btn').style.display = "none";
    renderRooms(Rooms);
}

document.addEventListener('DOMContentLoaded', initSearchPage);
window.goToBooking = goToBooking;