import { Hotels, Rooms } from './data.js';

let basePrice = 0;
let numberOfNights = 1;
let discountPercent = 0;

function initBooking() {
	const urlParams = new URLSearchParams(window.location.search);
	const roomId = parseInt(urlParams.get('RoomId'));
	const dateFrom = urlParams.get('from');
	const dateTo = urlParams.get('to');
	const room = Rooms.find(r => r.id === roomId);
	
	if (room) {
		const hotel = Hotels.find(h => h.id === room.hotelId);
		basePrice = room.price;
		const roomCard = document.getElementById('selected-room-card');
		if (roomCard) {
			roomCard.style.display = 'block';
			document.getElementById('display-room-type').textContent = `${room.roomType} Room (Room #${room.roomNumber})`;
			document.getElementById('display-hotel-name').textContent = hotel ? hotel.name : "Unknown Hotel";
			document.getElementById('display-price').textContent = `$${room.price}`;
			if (dateFrom && dateTo) {
				numberOfNights = calculateNights(dateFrom, dateTo);
				document.getElementById('display-dates').innerHTML = `<i data-lucide="calendar" style="width:14px"></i> <span>${dateFrom} — ${dateTo} (${numberOfNights} nights)</span>`;
			}
		}
		if (hotel) {
			document.getElementById('hotel-name-display').textContent = `Booking for ${hotel.name}`;
			document.getElementById('summary-content').innerHTML = `
				<div class="summary-row"><span class="summary-label">Hotel:</span><span class="summary-value">${hotel.name}</span></div>
				<div class="summary-row"><span class="summary-label">Room:</span><span class="summary-value">${room.roomType} (#${room.roomNumber})</span></div>
				<div class="summary-row"><span class="summary-label">Stay Duration:</span><span class="summary-value">${numberOfNights} nights</span></div>
				<div class="summary-row"><span class="summary-label">Guest:</span><span id="summary-name" class="summary-value">—</span></div>
				<div id="services-summary" class="mt-2"></div>
				<div id="summary-discount-row" class="flex-between text-green-600" style="display: none; padding-top: 8px; border-top: 1px dashed #bee3f8;">
					<span>Discount (SAVE5):</span>
					<strong id="summary-discount-val">-$0</strong>
				</div>
			`;
			renderServices(hotel.services);
		}
	}

	document.getElementById('name').addEventListener('input', (e) => {
		document.getElementById('summary-name').textContent = e.target.value || "—";
	});

	document.getElementById('apply-coupon').addEventListener('click', () => {
		const code = document.getElementById('coupon-code').value.trim().toUpperCase();
		const msg = document.getElementById('coupon-message');
		if (code === "SAVE5") {
			discountPercent = 5;
			msg.textContent = "Coupon applied! -5%";
			msg.style.color = "#16a34a";
		} else {
			discountPercent = 0;
			msg.textContent = "Invalid coupon code";
			msg.style.color = "#ef4444";
		}
		msg.style.display = "block";
		updateTotalPrice();
	});

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

function renderServices(services) {
	const container = document.querySelector('.checkbox-group'); 
	if (!container) return;
	container.innerHTML = services.map(service => `
		<label class="flex-center gap-2 cursor-pointer">
			<input type="checkbox" class="service-checkbox" data-name="${service.name}" data-price="${service.price}"> 
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

document.addEventListener('DOMContentLoaded', initBooking);