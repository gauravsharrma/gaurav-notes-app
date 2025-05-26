document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notesList');
  const saveBtn = document.getElementById('saveNote');

  async function loadNotes() {
    const res = await fetch('/api/notes');
    const notes = await res.json();
    notesList.innerHTML = notes.map(n => `
      <div class="bg-white p-4 rounded shadow">
        <div class="markdown">${marked.parse(n.content)}</div>
        <div class="text-sm text-gray-500 mt-2">Tags: ${n.tags.join(', ')}</div>
        <button onclick="editNote('${n.id}', \`${n.content}\`, '${n.tags.join(',')}')" class="text-blue-500">Edit</button>
        <button onclick="deleteNote('${n.id}')" class="text-red-500 ml-2">Delete</button>
      </div>
    `).join('');
  }

  window.editNote = (id, content, tags) => {
    document.getElementById('noteContent').value = content;
    document.getElementById('noteTags').value = tags;
    saveBtn.dataset.editing = id;
  };

  window.deleteNote = async (id) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    loadNotes();
  };

  saveBtn.addEventListener('click', async () => {
    const content = document.getElementById('noteContent').value;
    const tags = document.getElementById('noteTags').value.split(',').map(t => t.trim());
    const id = saveBtn.dataset.editing;
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/notes/${id}` : '/api/notes';

    await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content, tags })
    });

    document.getElementById('noteContent').value = '';
    document.getElementById('noteTags').value = '';
    saveBtn.removeAttribute('data-editing');
    loadNotes();
  });

  loadNotes();
});
