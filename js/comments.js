import { apiFetch, getToken, clearToken } from './auth.js';

if (!getToken()) location.href = 'index.html';

const id = new URLSearchParams(location.search).get('id');

const statusEl = document.getElementById('status');
const titleEl = document.getElementById('post-title');
const listEl = document.getElementById('comments');

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

// Remove comment
async function removeComment(comment) {
    if (!confirm(`Delete this comment by ${comment.username}?`)) return;
    const res = await apiFetch(`/posts/${id}/comments/${comment.id}`, {method: 'DELETE'});
    if (!res.ok) return alert("Could not delete the comment");
    load();
}

// Editing comments
function startEdit(comment, li) {
    const textarea = document.createElement('textarea');
    textarea.rows = 3;
    textarea.value = comment.content;

    const save = button('Save', async () => {
        const content = textarea.value.trim();
        if(!content) return alert('A comment cannot be empty');
        const res = await apiFetch(`/posts/${id}/comments/${comment.id}`, {
            method: 'PUT',
            body: JSON.stringify({ content }),
        });
        if (!res.ok) return alert('Could not save the comment');
        load();
    });

    li.replaceChildren(textarea, document.createElement('br'), save, ' ', button('Cancel', load));
}

// Rendering comment
function renderComment(comment) {
    const li =  document.createElement('li');

    const name = document.createElement('strong');
    name.textContent = comment.username;

    const date = document.createElement('time');
    date.dateTime = comment.createdAt;
    date.textContent = new Date(comment.createdAt).toLocaleString();

    const body = document.createElement('p');
    body.textContent = comment.content;

    const actions = document.createElement('p');
    actions.append(
        button('Edit', () => startEdit(comment, li)),
        ' ',
        button('Delete', () => removeComment(comment)),
    );

    li.append(name, ' ', date, body, actions);
    return li;
}


// Loading comments
async function load() {
    if (!id) {
        statusEl.textContent = 'No post specified';
        return;
    }

    try {
        const [postRes, commentsRes] = await Promise.all([
            apiFetch(`/posts/all/${id}`),
            apiFetch(`/posts/all/${id}/comments`),
        ]);

        if (postRes.status === 404) {
            statusEl.hidden = false;
            statusEl.textContent = 'Post not found.';
            return;
        }

        if (!postRes.ok || !commentsRes.ok ) throw new Error('Request failed');
        
        const post = await postRes.json();
        const comments = await commentsRes.json();

        titleEl.textContent = post.title;
        listEl.replaceChildren(...comments.map(renderComment));
        statusEl.hidden = comments.length > 0;
        statusEl.textContent = 'No comments yet.';
    } catch (err) {
        if (err.message !== 'Unauthorized') {
            statusEl.hidden = false;
            statusEl.textContent = 'Could not load the comments. Is your API running?';
        }
        console.error(err);
    }
}

load();