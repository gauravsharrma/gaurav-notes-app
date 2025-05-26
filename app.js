document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notesList');
  const saveBtn = document.getElementById('saveNote');

  async function loadNotes() {
    try {
      const res = await fetch('/api/notes');
      const notes = await res.json();

      notesList.innerHTML = ''; // Clear previous

      notes.forEach(note => {
        const card = document.createElement('div');
        card.className = 'bg-white p-4 rounded shadow overflow-hidden space-y-2';

        // Markdown preview (truncated to 1 line)
        const preview = document.createElement('div');
        preview.className = 'markdown truncate h-6 overflow-hidden';
        preview.innerHTML = marked.parse(note.content || '[Empty]');

        // Tags
        const tags = document.createElement('div');
        tags.className = 'text-sm text-gray-500';
        tags.textContent = `Tags: ${note.tags?.join(', ') || ''}`;

        // View Full Note
        const viewBtn = document.createElement('button');
        viewBtn.className = 'text-green-600';
        viewBtn.textContent = 'View Full Note';
        viewBtn.onclick = () => {
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
                <div class="content prose">${marked.parse(note.content)}</div>
              </body>
            </html>
          `;
          const newTab = window.open();
          newTab.document.write(html);
          newTab.document.close();
        };

        // Edit
        const editBtn = document.createElement('button');
        editBtn.className = 'text-blue-500 ml-2';
        editBtn.textContent = 'Edit';
        editBtn.onclick = () => {
          document.getElementById('noteContent').value = note.content;
          document.getElementById('noteTags').value = note.tags?.join(', ') || '';
          saveBtn.dataset.editing = note.id;
        };

        // Delete
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'text-red-500 ml-2';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = async () => {
          await fetch(`/api/notes/${note.id}`, { method: 'DELETE' });
          loadNotes();
        };

        // Assemble
        card.appendChild(preview);
        card.appendChild(tags);
        card.appendChild(viewBtn);
        card.appendChild(editBtn);
        card.appendChild(deleteBtn);

        notesList.appendChild(card);
      });
    } catch (err) {
      console.error('Error loading notes:', err);
      notesList.innerHTML = '<p class="text-red-600">Failed to load notes.</p>';
    }
  }

  saveBtn.addEventListener('click', async () => {
    const content = document.getElementById('noteContent').value.trim();
    const tags = document.getElementById('noteTags').value
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);
    const id = saveBtn.dataset.editing;

    if (!content) return alert('Note content cannot be empty.');

    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/notes/${id}` : '/api/notes`;

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
