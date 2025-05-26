document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notesList');
  const saveBtn = document.getElementById('saveNote');

  async function loadNotes() {
    const res = await fetch('/api/notes');
    const notes = await res.json();
    notesList.innerHTML = notes.map(n => `
      <div class="bg-white p-4 rounded shadow overflow-hidden">
        <div class="markdown truncate h-6 overflow-hidden">${marked.parse(n.content)}</div>
        <div class="text-sm text-gray-500 mt-2">Tags: ${n.tags.join(', ')}</div>
        <button onclick="viewNote(\`${encodeURIComponent(n.content)}\`)" class="text-green-600">View Full Note</button>
        <button onclick="editNote('${n.id}', \`${n.content}\`, '${n.tags.join(',')}')" class="text-blue-500 ml-2">Edit</button>
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
    const content = document.getElementById('noteContent').value;
    const tags = document.getElementById('noteTags').value.split(',').map(t => t.trim()).filter(Boolean);
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
