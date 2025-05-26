document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notesList');
  const saveBtn = document.getElementById('saveNote');

  async function loadNotes() {
    try {
      const res = await fetch('/api/notes');
      const notes = await res.json();

      notesList.innerHTML = notes.map(n => {
        const safeContent = encodeURIComponent(n.content || '');
        const safeTags = encodeURIComponent(n.tags?.join(',') || '');

        return `
          <div class="bg-white p-4 rounded shadow overflow-hidden">
            <div class="markdown truncate h-6 overflow-hidden">${marked.parse(n.content || '[Empty note]')}</div>
            <div class="text-sm text-gray-500 mt-2">Tags: ${n.tags?.join(', ')}</div>
            <button onclick="viewNote(\`${safeContent}\`)" class="text-green-600">View Full Note</button>
            <button 
              class="text-blue-500 ml-2 edit-note-btn" 
              data-id="${n.id}" 
              data-content="${safeContent}" 
              data-tags="${safeTags}">
              Edit
            </button>
            <button onclick="deleteNote('${n.id}')" class="text-red-500 ml-2">Delete</button>
          </div>
        `;
      }).join('');
    } catch (err) {
      console.error('Error loading notes:', err);
      notesList.innerHTML = '<p class="text-red-600">Failed to load notes.</p>';
    }
  }

  window.deleteNote = async (id) => {
    await fetch(`/api/notes/${id}`, { method: 'DELETE' });
    loadNotes();
  };

  window.viewNote = (rawContent) => {
    const html = `
      <html>
        <head>
          <title>Note Preview</title>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet" />
          <link href="https://fonts.googleapis.com/css2?family=Merriweather&display=swap" rel="stylesheet" />
          <style>
            body {
              font-family: 'Merriweather', serif;
              display: flex;
              justify-content: center;
              padding: 3rem;
              background: #fdfdfd;
            }
            .content {
              max-width: 60ch;
            }
          </style>
        </head>
        <body>
          <div class="content prose">${marked.parse(decodeURIComponent(rawContent))}</div>
        </body>
      </html>
    `;
    const newTab = window.open();
    newTab.document.write(html);
    newTab.document.close();
  };

  saveBtn.addEventListener('click', async () => {
    const content = document.getElementById('noteContent').value.trim();
    const tags = document.getElementById('noteTags').value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const id = saveBtn.dataset.editing;

    if (!content) return alert('Note content cannot be empty.');

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

  // Safe Edit Button Handler
  notesList.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-note-btn')) {
      const btn = e.target;
      const id = btn.dataset.id;
      const content = decodeURIComponent(btn.dataset.content);
      const tags = decodeURIComponent(btn.dataset.tags);

      document.getElementById('noteContent').value = content;
      document.getElementById('noteTags').value = tags;
      saveBtn.dataset.editing = id;
    }
  });

  loadNotes();
});
