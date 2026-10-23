import { apiFetch, getToken, clearToken } from './auth.js';

if (!getToken()) location.href = 'index.html';

const id = new URLSearchParams(location.search).get('id');

const form = document.getElementById('post-form');
const heading  = document.getElementById('heading');
const statusEl  = document.getElementById('status');
const errorEl  = document.getElementById('error');

document.getElementById('logout').addEventListener('click', () => {
    clearToken();
    location.href = 'index.html';
});

async function loadPost() {
    heading.textContent = 'Edit post';
    form.hidden = true;
    statusEl.hidden = false;
    statusEl.textContent = 'Loading...';

    try {
        const res = await apiFetch(`/posts/all/${id}`);
        if (res.status === 404) {
            statusEl.textContent = 'Post not found.';
            return;
        }

        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const post = await res.json();

        form.elements.title.value = post.title;
        form.elements.content.value = post.content;
        form.elements.published.checked = post.published;

        statusEl.hidden = true;
        form.hidden = false;
    } catch (err) {
        if (err.message !== 'Unathorized') {
            statusEl.textContent = 'Could not load this post. Is your API running?';
        }
        console.error(err);
    }
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.textContent = '';

    const data = {
        title: form.elements.title.value.trim(),
        content: form.elements.content.value,
        published: form.elements.published.checked,
    };

    let res;
    let body;
    try {
        res = await apiFetch(id ? `/posts/${id}` : '/posts', {
            method: id ? 'PUT' : 'POST',
            body: JSON.stringify(data),
        });
        body = await res.json();
    } catch (err) {
       if (err.message !== 'Unauthorized') {
        errorEl.textContent = 'Could not reach the server.'
       }
       console.error(err);
       return;
    }

    if (!res.ok) {
        errorEl.textContent = body.error || 'Could not save the post.';
        return;
    }
    location.href = 'dashboard.html'
});

if (id) loadPost();