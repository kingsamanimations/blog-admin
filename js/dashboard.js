import { apiFetch, getToken, clearToken } from './auth.js';

if (!getToken()) location.href = 'index.html';

const statusEl = document.getElementById('status');
const table = document.getElementById('posts-table');
const tBody = document.getElementById('posts');


// Dashboard

document.getElementById('logout').addEventListener('click', () => {
    clearToken();
    location.href = 'index.html';
});

function button(label, onClick) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    b.addEventListener('click', onClick);
    return b;
}

// Updating published posts
async function togglePublished(post) {
    const res = await apiFetch(`/posts/${post.id}`, {
        method: 'PUT',
        body: JSON.stringify({ published: !post.published }),
    });
    if (!res.ok) return alert('Could not update the post');
    load();
}

// Removing a post
async function removePost(post) {
    if (!confirm(`Delete "${post.title}" and its comments?`)) return;
    const res = await apiFetch(`/posts/${post.id}`, { method: 'DELETE'});
    if (!res.ok) return alert('Could not delete the post.');
    load();
}

// Rendering rows
function renderRow(post) {
    const tr = document.createElement('tr');
    const title = document.createElement('td');
    title.textContent = post.title;

    const state = document.createElement('td');
    state.textContent = post.published ? 'Published' : 'Draft';

    const created = document.createElement('td');
    created.textContent = new Date(post.createdAt).toLocaleDateString();

    const actions = document.createElement('td');
    const edit = document.createElement('a');

    // Comments link consts
    edit.href = `editor.html?id=${post.id}`;
    edit.textContent = 'Edit';

    const commentsLink = document.createElement('a');
    commentsLink.href = `comments.html?id=${post.id}`;
    commentsLink.textContent = 'Comments';

    actions.append(
        edit,
        ' ',
        commentsLink,
        ' ',
        button(post.published ? 'Unpublish' : 'Publish', () => togglePublished(post)),
        ' ',
        button('Delete', () => removePost(post)),
    );

    edit.href = `editor.html?id=${post.id}`;
    edit.textContent = 'Edit';
    actions.append(
        edit,
        ' ',
        button(post.published ? 'Unpublish' : 'Publish', () => togglePublished(post)),
        ' ',
        button('Delete', () => removePost(post)),
    );

    tr.append(title, state, created, actions);
    return tr;
}

// Loading page
async function load() {
    try {
        const res = await apiFetch('/posts/all');
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        const posts = await res.json();

        tBody.replaceChildren(...posts.map(renderRow));
        table.hidden = posts.length === 0;
        statusEl.hidden = posts.length > 0;
        statusEl.textContent = 'No posts yet.';
    } catch (err) {
        if (err.message !== 'Unauthorized') {
            statusEl.hidden = false;
            statusEl.textContent = 'Could not load posts. Is the API running?'
        }
        console.error(err);
    }
}

load();