document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    if (sessionStorage.getItem('hotel_token')) {
        const baseUrl = import.meta.env.BASE_URL;
        window.location.href = `${baseUrl}src/html/dashboard.html`;
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';

        const formData = new FormData(loginForm);
        const loginData = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData)
            });

            const data = await response.json();

            if (response.ok) {
                sessionStorage.setItem('hotel_token', data.token);
                sessionStorage.setItem('cashier_info', JSON.stringify(data.cashier));

                const baseUrl = import.meta.env.BASE_URL;
        
                window.location.href = `${baseUrl}src/html/dashboard.html`;
            } else if (response.status === 429) {
                showError(data.message);
            }else {
                showError(data.message || 'Login failed');
            }
        } catch (error) {
            showError('Server connection error.');
        }
    });

    function showError(text) {
        errorMessage.innerText = text;
        errorMessage.style.display = 'block';
        loginForm.classList.add('error-shake');
        setTimeout(() => loginForm.classList.remove('error-shake'), 400);
    }
});