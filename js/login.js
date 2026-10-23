import { API_URL } from './config.js';
import { getToken, setToken } from './auth.js';

if (getToken()) location.href = 'dashboard.html';

const form = document.getElementById('login-form');
const errorEl = document.getElementById('error');

// Login
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';
    const data = Object.fromEntries(new FormData(form));

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        const body = await res.json();

        if (!res.ok) {
            errorEl.textContent = body.error || 'Login failed.';
            return;
        }
        setToken(body.token);
        location.href = 'dashboard.html';
    } catch (err) {
        errorEl.textContent = 'Could not reach the server.';
        console.error(err);
    }
});