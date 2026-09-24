let selectedColor = 'yellow';

function render(notes) {
  const container = document.querySelector('#notes');
  const empty = document.querySelector('#empty');
  container.replaceChildren();
  empty.hidden = notes.length > 0;
  document.querySelector('#count').textContent = `${notes.length} ${notes.length === 1 ? 'lembrete' : 'lembretes'}`;

  for (const note of notes) {
    const card = document.createElement('button');
    card.className = `card ${note.color}`;
    card.textContent = note.text.trim() || 'Lembrete sem texto';
    const hint = document.createElement('small');
    hint.textContent = 'Clique para abrir';
    card.append(hint);
    card.addEventListener('click', () => window.postIt.open(note.id));
    container.append(card);
  }
}

document.querySelectorAll('.swatch').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.swatch.selected')?.classList.remove('selected');
    button.classList.add('selected');
    selectedColor = button.dataset.color;
  });
});

document.querySelector('#new-note').addEventListener('click', () => window.postIt.add(selectedColor));
document.querySelector('#quit').addEventListener('click', () => window.postIt.quit());
window.postIt.onChanged(render);
window.postIt.list().then(render);
