let quickItems = JSON.parse(localStorage.getItem('shopping-quick-items') || '["牛乳","パン","フルグラ"]');
let dragSrcIdx = null;

function renderQuickList() {
  const ul = document.getElementById('quick-list');
  ul.innerHTML = '';
  quickItems.forEach((name, idx) => {
    const li = document.createElement('li');
    li.className = 'quick-item';
    li.draggable = true;

    // 並び替えハンドル
    const handle = document.createElement('span');
    handle.textContent = '☰';
    handle.className = 'quick-handle';
    li.appendChild(handle);

    // テキスト
    const span = document.createElement('span');
    span.textContent = name;
    li.appendChild(span);

    // 削除ボタン
    const del = document.createElement('button');
    del.textContent = '✕';
    del.className = 'quick-delete';
    del.onclick = () => {
      quickItems.splice(idx, 1);
      saveQuickItems();
      renderQuickList();
    };
    li.appendChild(del);

    // ドラッグイベント
    li.addEventListener('dragstart', e => {
      dragSrcIdx = idx;
      e.dataTransfer.effectAllowed = 'move';
    });
    li.addEventListener('dragover', e => {
      e.preventDefault();
      li.style.background = '#e3f2fd';
    });
    li.addEventListener('dragleave', e => {
      li.style.background = '#fafafa';
    });
    li.addEventListener('drop', e => {
      e.preventDefault();
      li.style.background = '#fafafa';
      if (dragSrcIdx === null || dragSrcIdx === idx) return;
      const moved = quickItems.splice(dragSrcIdx, 1)[0];
      quickItems.splice(idx, 0, moved);
      saveQuickItems();
      renderQuickList();
    });
    li.addEventListener('dragend', e => {
      dragSrcIdx = null;
      ul.querySelectorAll('li').forEach(el => el.style.background = '#fafafa');
    });

    ul.appendChild(li);
  });
}

function addQuickItem() {
  const input = document.getElementById('quick-add-input');
  const value = input.value.trim();
  if (value && !quickItems.includes(value)) {
    quickItems.push(value);
    input.value = '';
    saveQuickItems();
    renderQuickList();
  }
}

function saveQuickItems() {
  localStorage.setItem('shopping-quick-items', JSON.stringify(quickItems));
}

// Enterキーで追加
document.getElementById('quick-add-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addQuickItem();
});

renderQuickList();
