import { Bookings } from './data.js';

let localBookings = [...Bookings];
let currentBookingId = null;

function renderTables(term = "") {
    const activeBody = document.getElementById('active-table-body');
    const pastBody = document.getElementById('past-table-body');
    if (!activeBody || !pastBody) return;

    const filtered = localBookings.filter(b => 
        b.id.toLowerCase().includes(term.toLowerCase()) || 
        b.guestName.toLowerCase().includes(term.toLowerCase())
    );

    const active = filtered.filter(b => b.status !== 'completed' && b.status !== 'cancelled');
    const past = filtered.filter(b => b.status === 'completed' || b.status === 'cancelled');

    document.getElementById('active-title').textContent = `Active Bookings (${active.length})`;
    document.getElementById('past-title').textContent = `Past Bookings (${past.length})`;

    activeBody.innerHTML = active.map(b => `
        <tr>
            <td><a href="#" class="text-link" onclick="openDetailsModal('${b.id}')">${b.id}</a></td>
            <td>${b.guestName}</td>
            <td>${b.hotelName}</td>
            <td>#${b.roomNumber}</td>
            <td>${b.from}</td>
            <td>${b.to}</td>
            <td><span class="status-badge ${b.status === 'checked-in' ? 'status-checked-in' : 'status-confirmed'}">${b.status}</span></td>
            <td style="text-align: right;">
                <div class="flex-end gap-1">
                    <button class="btn btn-outline btn-small" onclick="openExtendModal('${b.id}', '${b.to}')">Extend</button>
                    ${b.status === 'confirmed' ? 
                        `<button class="btn btn-outline btn-success btn-small" onclick="handleCheckIn('${b.id}')">Check-in</button>` : 
                        `<button class="btn btn-primary btn-small" onclick="handleCheckout('${b.id}')">Checkout</button>`
                    }
                </div>
            </td>
        </tr>
    `).join('');

    pastBody.innerHTML = past.map(b => `
        <tr>
            <td><a href="#" class="text-link" onclick="openDetailsModal('${b.id}')">${b.id}</a></td>
            <td>${b.guestName}</td>
            <td>${b.hotelName}</td>
            <td>#${b.roomNumber}</td>
            <td>${b.from}</td>
            <td>${b.to}</td>
            <td><span class="status-badge ${b.status === 'cancelled' ? 'status-cancelled' : 'status-completed'}">${b.status}</span></td>
        </tr>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

window.openDetailsModal = (id) => {
    const b = localBookings.find(item => item.id === id);
    if (!b) return;
    currentBookingId = id;

    const checkInDate = new Date(b.from);
    const today = new Date();
    const diffDays = Math.ceil((checkInDate - today) / (1000 * 60 * 60 * 24));
    const canCancel = diffDays > 7;

    const graceDate = new Date(checkInDate);
    graceDate.setDate(graceDate.getDate() - 7);

    document.getElementById('details-code').textContent = `Booking Info: ${b.id}`;
    document.getElementById('details-content').innerHTML = `
        <div class="summary-row"><span class="summary-label">Guest Name:</span><span class="summary-value">${b.guestName}</span></div>
        <div class="summary-row"><span class="summary-label">Personal ID:</span><span class="summary-value">${b.personalId}</span></div>
        <div class="summary-row"><span class="summary-label">Stay Period:</span><span class="summary-value">${b.from} - ${b.to}</span></div>
        <div class="summary-row"><span class="summary-label">Grace Period Until:</span><span class="summary-value" style="color: ${canCancel ? '#166534' : '#991b1b'}">${graceDate.toISOString().split('T')[0]}</span></div>
        <div class="summary-row"><span class="summary-label">Total Paid:</span><span class="summary-value font-bold" style="color: var(--blue)">$${b.paid}</span></div>
    `;

    const cancelSection = document.getElementById('cancel-section');
    if (b.status === 'confirmed') {
        cancelSection.style.display = 'block';
        const cancelBtn = document.getElementById('cancel-booking-btn');
        const cancelWarning = document.getElementById('cancel-warning');
        
        cancelBtn.disabled = !canCancel;
        cancelWarning.textContent = canCancel ? "Grace period active. You can cancel." : "Grace period expired. Cancellation blocked.";
    } else {
        cancelSection.style.display = 'none';
    }
    document.getElementById('details-modal').style.display = 'flex';
};

window.openExtendModal = (id, currentOut) => {
    currentBookingId = id;
    const b = localBookings.find(item => item.id === id);
    const modal = document.getElementById('extend-modal');
    const input = document.getElementById('new-checkout-date');
    const confirmBtn = document.getElementById('confirm-extend-btn');
    
    let infoDiv = document.getElementById('extend-info');
    if (!infoDiv) {
        infoDiv = document.createElement('div');
        infoDiv.id = 'extend-info';
        infoDiv.className = 'activity-item mt-2';
        input.parentNode.appendChild(infoDiv);
    }

    input.value = currentOut;
    input.min = currentOut;
    confirmBtn.disabled = true;
    infoDiv.innerHTML = 'Select a new date';

    input.oninput = () => {
        const newDateVal = input.value;
        if (!newDateVal || newDateVal === currentOut) {
            confirmBtn.disabled = true;
            return;
        }

        const overlap = localBookings.some(other => 
            other.id !== id && 
            other.roomNumber === b.roomNumber && 
            other.status !== 'cancelled' &&
            (new Date(b.from) < new Date(other.to) && new Date(newDateVal) > new Date(other.from))
        );

        if (overlap) {
            confirmBtn.disabled = true;
            infoDiv.innerHTML = '<span style="color: #ef4444;">❌ Room is already booked for these dates!</span>';
        } else {
            const diffDays = Math.ceil((new Date(newDateVal) - new Date(currentOut)) / (1000 * 60 * 60 * 24));
            const charge = diffDays * (b.pricePerNight || 100);
            confirmBtn.disabled = false;
            infoDiv.innerHTML = `Extra: ${diffDays} nights. <strong>Charge: +$${charge}</strong>`;
        }
    };
    modal.style.display = 'flex';
};

window.handleCheckout = (id) => {
    if(confirm("Confirm checkout?")) {
        localBookings = localBookings.map(b => b.id === id ? { ...b, status: 'completed' } : b);
        renderTables();
    }
};

window.handleCheckIn = (id) => {
    localBookings = localBookings.map(b => b.id === id ? { ...b, status: 'checked-in' } : b);
    renderTables();
};

window.closeDetailsModal = () => document.getElementById('details-modal').style.display = 'none';
window.closeExtendModal = () => document.getElementById('extend-modal').style.display = 'none';

document.getElementById('stay-search').addEventListener('input', (e) => renderTables(e.target.value));

document.getElementById('confirm-extend-btn').onclick = () => {
    const newDate = document.getElementById('new-checkout-date').value;
    localBookings = localBookings.map(b => b.id === currentBookingId ? { ...b, to: newDate, status: 'checked-in' } : b);
    renderTables();
    window.closeExtendModal();
};

document.getElementById('cancel-booking-btn').onclick = () => {
    if(confirm("Cancel this booking?")) {
        localBookings = localBookings.map(b => b.id === currentBookingId ? { ...b, status: 'cancelled' } : b);
        renderTables();
        window.closeDetailsModal();
    }
};

document.addEventListener('DOMContentLoaded', () => renderTables());