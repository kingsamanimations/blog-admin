import { API_URL } from './config.js';

const KEY = 'blog_token';

export const getToken = () => localStorage.getItem(KEY);
export const setToken = (token) => localStorage.setItem(KEY, token);
export const clearToken = () => localStorage.removeItem(KEY);


// token Authorization and fetching token
export async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
            Authorization: `Bearer ${getToken()}`,
        },
    });

    // 401 clears the token and sends the user back to login
    if (res.status === 401) {
        clearToken();
        location.href = 'index.html';
        throw new Error('Unauthorized');
    }
    return res;
}