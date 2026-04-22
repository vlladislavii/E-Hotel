if (!sessionStorage.getItem('hotel_token')) {
    const baseUrl = import.meta.env.BASE_URL;
    window.location.href = baseUrl;
}

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('hotel_token')}`
});

let basePrice = 0;
let numberOfNights = 1;
let discountPercent = 0;
let currentRoom = null;

async function initBooking() {
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('RoomId');
    const dateFrom = urlParams.get('from');
    const dateTo = urlParams.get('to');

    if (!roomId) {
        alert("Missing Room ID. Returning to catalog...");
        window.location.href = 'hotel-catalog.html';
        return;
    }

    try {
        const response = await fetch(`http://localhost:5000/api/rooms/${roomId}`);
        if (!response.ok) throw new Error('Room not found in database');
        
        currentRoom = await response.json();
        const hotel = currentRoom.Hotel;
        basePrice = parseFloat(currentRoom.price);

        const roomCard = document.getElementById('selected-room-card');
        if (roomCard) {
            roomCard.style.display = 'block';
            document.getElementById('display-room-type').textContent = `${currentRoom.type} Room (Number #${currentRoom.number})`;
            document.getElementById('display-hotel-name').textContent = hotel.name;
            document.getElementById('display-price').textContent = `$${currentRoom.price}`;
            
            if (dateFrom && dateTo) {
                numberOfNights = calculateNights(dateFrom, dateTo);
                document.getElementById('display-dates').innerHTML = `
                    <i data-lucide="calendar" style="width:14px"></i> 
                    <span>${dateFrom} — ${dateTo} (${numberOfNights} nights)</span>`;
            }
        }

        document.getElementById('hotel-name-display').textContent = `Booking for ${hotel.name}`;
        document.getElementById('summary-content').innerHTML = `
            <div class="summary-row"><span class="summary-label">Hotel:</span><span class="summary-value">${hotel.name}</span></div>
            <div class="summary-row"><span class="summary-label">Room:</span><span class="summary-value">${currentRoom.type} (#${currentRoom.number})</span></div>
            <div class="summary-row"><span class="summary-label">Stay Duration:</span><span class="summary-value">${numberOfNights} nights</span></div>
            <div class="summary-row"><span class="summary-label">Guest:</span><span id="summary-name" class="summary-value">—</span></div>
            <div id="services-summary" class="mt-2"></div>
            <div id="summary-discount-row" class="flex-between text-green-600" style="display: none; padding-top: 8px; border-top: 1px dashed #bee3f8;">
                <span>Discount:</span>
                <strong id="summary-discount-val">-$0</strong>
            </div>
        `;

        renderServices(hotel.hotelServices || []);
        
    } catch (err) {
        console.error("Init error:", err);
        alert("Failed to sync with server.");
    }

    document.getElementById('name').addEventListener('input', (e) => {
        document.getElementById('summary-name').textContent = e.target.value || "—";
    });

    document.getElementById('apply-coupon').addEventListener('click', handleCouponApply);
    
    if (window.lucide) lucide.createIcons();
    updateTotalPrice();
}

function calculateNights(from, to) {
    const start = new Date(from);
    const end = new Date(to);
    const diff = end - start;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
}

async function handleCouponApply() {
    const codeInput = document.getElementById('coupon-code');
    const code = codeInput.value.trim();
    const msg = document.getElementById('coupon-message');
    
    if (!code) return;

    try {
        const response = await fetch(`http://localhost:5000/api/coupons/validate?code=${code}`);
        const data = await response.json();

        if (response.ok) {
            discountPercent = data.percentage;
            msg.textContent = `Coupon applied! -${discountPercent}%`;
            msg.style.color = "#16a34a";
        } else {
            discountPercent = 0;
            msg.textContent = data.message;
            msg.style.color = "#ef4444";
        }
    } catch (err) {
        console.error("Coupon error:", err);
        alert("Coupon server is unreachable.");
    }
    
    msg.style.display = "block";
    updateTotalPrice();
}

function renderServices(services) {
    const container = document.querySelector('.checkbox-group'); 
    if (!container) return;
    
    container.innerHTML = services.map(service => `
        <label class="flex-center gap-2 cursor-pointer">
            <input type="checkbox" class="service-checkbox" 
                   data-id="${service.id}" 
                   data-name="${service.name}" 
                   data-price="${service.price}"> 
            <span>${service.name} (+$${service.price}/day)</span>
        </label>
    `).join('');

    document.querySelectorAll('.service-checkbox').forEach(cb => {
        cb.addEventListener('change', () => {
            updateServicesSummary();
            updateTotalPrice();
        });
    });
}

function updateServicesSummary() {
    const summaryContainer = document.getElementById('services-summary');
    if (!summaryContainer) return;
    summaryContainer.innerHTML = '';
    
    document.querySelectorAll('.service-checkbox:checked').forEach(cb => {
        const div = document.createElement('div');
        div.className = 'flex-between text-blue-700 text-xs italic';
        div.innerHTML = `<span>+ ${cb.dataset.name}</span> <span>$${cb.dataset.price}/day</span>`;
        summaryContainer.appendChild(div);
    });
}

function updateTotalPrice() {
    let extraServicesCost = 0;
    document.querySelectorAll('.service-checkbox:checked').forEach(cb => {
        extraServicesCost += parseFloat(cb.dataset.price);
    });
    
    const subtotal = (basePrice + extraServicesCost) * numberOfNights;
    const discountAmount = (subtotal * discountPercent) / 100;
    const finalTotal = subtotal - discountAmount;

    const discountRow = document.getElementById('summary-discount-row');
    if (discountPercent > 0) {
        discountRow.style.display = 'flex';
        document.getElementById('summary-discount-val').textContent = `-$${discountAmount.toFixed(2)}`;
    } else {
        discountRow.style.display = 'none';
    }
    document.getElementById('total-booking-price').textContent = `$${finalTotal.toFixed(2)}`;
}

const bookingForm = document.getElementById('booking-form');
if (bookingForm) {
    bookingForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const urlParams = new URLSearchParams(window.location.search);
        const selectedServices = Array.from(document.querySelectorAll('.service-checkbox:checked'))
                                     .map(cb => parseInt(cb.dataset.id));

        const bookingRequest = {
            roomId: parseInt(urlParams.get('RoomId')),
            checkInDate: urlParams.get('from'),
            checkOutDate: urlParams.get('to'),
            tourist: {
                CNP: document.getElementById('personal-id').value,
                name: document.getElementById('name').value
            },
            payment: {
                cardNumber: document.getElementById('card-number').value.replace(/\s/g, ''),
                expiryDate: document.getElementById('expiry').value,
                cvv: document.getElementById('cvv').value
            },
            services: selectedServices,
            couponCode: discountPercent > 0 ? document.getElementById('coupon-code').value.trim() : null
        };

        try {
            const response = await fetch('http://localhost:5000/api/bookings', {
                method: 'POST',
                body: JSON.stringify(bookingRequest),
                headers: {
                    ...getAuthHeaders(),
                }
            });

            const result = await response.json();

            if (response.ok) {
                alert(`Success! Booking ${result.bookingNumber} confirmed.`);
                window.location.href = 'stay-management.html';
            } else {
                alert(`Error: ${result.message}`);
            }
        } catch (err) {
            console.error("Booking submission error:", err);
            alert("Server connection failed.");
        }
    });
}

document.addEventListener('DOMContentLoaded', initBooking);