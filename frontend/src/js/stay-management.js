let currentBookingNumber = null;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${sessionStorage.getItem('hotel_token')}`
});

window.closeDetailsModal = () => {
    document.getElementById('details-modal').style.display = 'none';
};

window.closeExtendModal = () => {
    document.getElementById('extend-modal').style.display = 'none';
};

window.onclick = (event) => {
    if (event.target === document.getElementById('details-modal')) window.closeDetailsModal();
    if (event.target === document.getElementById('extend-modal')) window.closeExtendModal();
};

async function fetchBookings() {
    try {
        const response = await fetch('http://localhost:5000/api/bookings', {
            headers: getAuthHeaders()
        });

        if (response.status === 401 || response.status === 403) {
            window.location.href = baseUrl;
            return;
        }

        const bookings = await response.json();
        renderTables(bookings);
    } catch (err) {
        console.error("Error loading bookings:", err);
    }
}

function renderTables(bookings, term = "") {
    const activeBody = document.getElementById('active-table-body');
    const pastBody = document.getElementById('past-table-body');
    if (!activeBody || !pastBody) return;

    const filtered = bookings.filter(b => 
        b.number.toLowerCase().includes(term.toLowerCase()) || 
        (b.CreditCard?.Tourist?.name || "").toLowerCase().includes(term.toLowerCase())
    );

    const active = filtered.filter(b => ['confirmed', 'checked-in'].includes(b.status));
    const past = filtered.filter(b => ['completed', 'canceled', 'invalid'].includes(b.status));

    document.getElementById('active-title').textContent = `Active Bookings (${active.length})`;
    document.getElementById('past-title').textContent = `Past Bookings (${past.length})`;

    const generateRow = (b) => `
        <tr>
            <td><a href="#" class="text-link" onclick="openDetailsModal('${b.number}')">${b.number}</a></td>
            <td>${b.CreditCard?.Tourist?.name || 'N/A'}</td>
            <td>${b.Room?.Hotel?.name || 'N/A'}</td>
            <td>#${b.Room?.number || 'N/A'}</td>
            <td>${b.checkInDate.split('T')[0]}</td>
            <td>${b.checkOutDate.split('T')[0]}</td>
            <td><span class="status-badge status-${b.status}">${b.status}</span></td>
            <td style="text-align: right;">
                <div class="flex-end gap-1">
                    ${['confirmed', 'checked-in'].includes(b.status) ? 
                        `<button class="btn btn-outline btn-small" onclick="openExtendModal('${b.number}', '${b.checkOutDate.split('T')[0]}')">Extend</button>` : ''}
                    ${b.status === 'confirmed' ? 
                        `<button class="btn btn-outline btn-success btn-small" onclick="handleAction('${b.number}', 'check-in')">Check-in</button>` : 
                        (b.status === 'checked-in' ? `<button class="btn btn-primary btn-small" onclick="handleAction('${b.number}', 'check-out')">Checkout</button>` : '')
                    }
                </div>
            </td>
        </tr>
    `;

    activeBody.innerHTML = active.map(generateRow).join('');
    pastBody.innerHTML = past.map(generateRow).join('');

    if (window.lucide) lucide.createIcons();
}

window.handleAction = async (number, action, body = null) => {
    try {
        let requestBody = body;

        if (action === 'check-out') {
            const method = confirm("Process Payment\n\nClick OK for CARD payment\nClick CANCEL for CASH payment");
            const paymentMethod = method ? 'Card' : 'Cash';
            requestBody = { paymentMethod };
        }

        const response = await fetch(`http://localhost:5000/api/bookings/${number}/${action}`, {
            method: 'PATCH',
            headers: getAuthHeaders(),
            body: requestBody ? JSON.stringify(requestBody) : null
        });

        const result = await response.json();

        if (response.ok) {
            if (action === 'check-out') {
                alert(`Success!\nBill #${result.billNumber} issued.\nTotal Paid: $${result.totalPaid}`);
            }
            
            await fetchBookings();
            if (action === 'cancel' || action === 'invalid') window.closeDetailsModal();
            if (action === 'extend') window.closeExtendModal();
        } else {
            alert(result.message);
        }
    } catch (err) {
        console.error("Action error:", err);
    }
};

window.openDetailsModal = async (number) => {
    try {
        const response = await fetch(`http://localhost:5000/api/bookings?search=${number}`, {
            headers: getAuthHeaders()
        });
        const data = await response.json();
        const b = data.find(item => item.number === number);
        if (!b) return;

        currentBookingNumber = number;
        const graceDate = new Date(b.gracePeriodEndTimeStamp);
        const isGraceExpired = new Date() > graceDate;

        document.getElementById('details-code').textContent = `Booking Info: ${b.number}`;
        document.getElementById('details-content').innerHTML = `
            <div class="summary-row"><span class="summary-label">Guest Name:</span><span class="summary-value">${b.CreditCard?.Tourist?.name}</span></div>
            <div class="summary-row"><span class="summary-label">Stay Period:</span><span class="summary-value">${b.checkInDate.split('T')[0]} - ${b.checkOutDate.split('T')[0]}</span></div>
            <div class="summary-row"><span class="summary-label">Grace Period Until:</span><span class="summary-value" style="color: ${isGraceExpired ? '#991b1b' : '#166534'}">${b.gracePeriodEndTimeStamp.split('T')[0]}</span></div>
            <div class="summary-row"><span class="summary-label">Total Cost:</span><span class="summary-value font-bold" style="color: var(--blue)">$${b.totalCost}</span></div>

            ${b.Bill ? `
            <div style="margin-top: 15px; padding: 10px; background: #ecfdf5; border: 1px solid #10b981; border-radius: 8px;">
                <p style="margin: 0; font-size: 0.8rem; color: #065f46; font-weight: bold;">Invoice Issued</p>
                <p style="margin: 5px 0 0 0; font-size: 0.9rem;">Bill Number: <strong>#${b.Bill.number}</strong></p>
                <p style="margin: 2px 0 0 0; font-size: 0.9rem;">Final Amount: <strong>$${b.Bill.totalPayAmount}</strong></p>
            </div>
        ` : ''}
        `;

        const cancelSection = document.getElementById('cancel-section');
        const cancelWarning = document.getElementById('cancel-warning');
        const cancelBtn = document.getElementById('cancel-booking-btn');
        const btnContainer = document.getElementById('cancel-btn-container');

        const oldInvalidBtn = document.getElementById('invalid-booking-btn');
        if (oldInvalidBtn) oldInvalidBtn.remove();

        if (b.status === 'confirmed') {
            cancelSection.style.display = 'block';
            cancelWarning.innerHTML = isGraceExpired 
                ? '<span style="color: #991b1b;">Grace period expired. Full charge applies!</span>' 
                : '<span style="color: #166534;">Grace period active. Free cancellation.</span>';

            if (cancelBtn) cancelBtn.style.display = 'inline-block';

            const invalidBtn = document.createElement('button');
            invalidBtn.id = 'invalid-booking-btn';
            invalidBtn.className = 'btn btn-outline';
            invalidBtn.textContent = 'Mark as Invalid';
            invalidBtn.style.width = '100%';
            invalidBtn.onclick = () => {
                if(confirm("Mark as Invalid?")) handleAction(number, 'invalid');
            };

            if (btnContainer) btnContainer.appendChild(invalidBtn);
        } else {
            cancelSection.style.display = 'none';
        }

        document.getElementById('details-modal').style.display = 'flex';
    } catch (err) { 
        console.error("Error opening modal:", err); 
    }
};

window.openExtendModal = async (number, currentOut) => {
    currentBookingNumber = number;
    
   const response = await fetch(`http://localhost:5000/api/bookings?search=${number}`, {
        headers: getAuthHeaders()
    });
    const data = await response.json();
    const b = data.find(item => item.number === number);
    
    const modal = document.getElementById('extend-modal');
    const input = document.getElementById('new-checkout-date');
    const infoDiv = document.getElementById('extend-price-info');
    
    input.value = currentOut;
    input.min = currentOut;
    infoDiv.innerHTML = "Choose new Checkout date";

    input.onchange = () => {
        const newDate = new Date(input.value);
        const oldDate = new Date(currentOut);
        
        const diffTime = newDate - oldDate;
        const extraNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (extraNights > 0) {
            const pricePerNight = parseFloat(b.Room.price);
            const extraCharge = extraNights * pricePerNight;
            const newTotal = parseFloat(b.totalCost) + extraCharge;

            infoDiv.innerHTML = `
                <div style="margin-top: 15px; padding: 10px; background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0;">
                    <p style="margin: 5px 0; font-size: 0.9rem;">Additional nights: <strong>${extraNights}</strong></p>
                    <p style="margin: 5px 0; font-size: 0.9rem; color: #16a34a;">To pay extra: <strong>+$${extraCharge.toFixed(2)}</strong></p>
                    <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 10px 0;">
                    <p style="margin: 5px 0; font-size: 1rem; font-weight: bold;">New total cost: <span style="color: #2563eb;">$${newTotal.toFixed(2)}</span></p>
                </div>
            `;
        } else {
            infoDiv.innerHTML = "<span style='color: #ef4444; font-size: 0.8rem;'>Choose the later date than the previous one.</span>";
        }
    };

    modal.style.display = 'flex';
};

document.getElementById('confirm-extend-btn').onclick = () => {
    const newDate = document.getElementById('new-checkout-date').value;
    handleAction(currentBookingNumber, 'extend', { newCheckOutDate: newDate });
};

document.getElementById('cancel-booking-btn').onclick = () => {
    if(confirm("Are you sure you want to cancel?")) {
        handleAction(currentBookingNumber, 'cancel');
    }
};

document.getElementById('stay-search')?.addEventListener('input', (e) => {
    const term = e.target.value;
    fetch('http://localhost:5000/api/bookings', {
        headers: getAuthHeaders()
    })
        .then(r => r.json())
        .then(data => renderTables(data, term));
});

document.addEventListener('DOMContentLoaded', fetchBookings);