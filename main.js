let items = JSON.parse(localStorage.getItem('shopping-items') || '[]');
let lastUpdated = localStorage.getItem('shopping-last-updated') || '';
let quickItems = JSON.parse(localStorage.getItem('shopping-quick-items') || '["牛乳","パン","フルグラ"]');

function addItem() {
  const input = document.getElementById('item-input');
  const value = input.value.trim();
  if (value) {
    items.unshift({ text: value, checked: false }); // 先頭に追加
    input.value = '';
    saveItems();
    renderList();
  }
}

function addQuickItem(name) {
  items.unshift({ text: name, checked: false }); // 先頭に追加
  saveItems();
  renderList();
}

function toggleCheck(index) {
  items[index].checked = !items[index].checked;
  saveItems();
  renderList();
}

function deleteItem(index) {
  items.splice(index, 1);
  saveItems();
  renderList();
}

// 並び替え用
let dragSrcIdx = null;
function handleDragStart(e, idx) {
  dragSrcIdx = idx;
  e.dataTransfer.effectAllowed = 'move';
}
function handleDragOver(e) {
  e.preventDefault();
  e.currentTarget.classList.add('drag-over');
}
function handleDragLeave(e) {
  e.currentTarget.classList.remove('drag-over');
}
function handleDrop(e, idx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (dragSrcIdx === null || dragSrcIdx === idx) return;

  // 未チェック項目だけのリストを作成
  const uncheckedItems = items
    .map((item, i) => ({ ...item, origIdx: i }))
    .filter(item => !item.checked);
  const checkedItems = items
    .map((item, i) => ({ ...item, origIdx: i }))
    .filter(item => item.checked);

  // 並び替え（ドラッグ元→ドラッグ先）
  const movedItem = uncheckedItems.splice(dragSrcIdx, 1)[0];
  uncheckedItems.splice(idx, 0, movedItem);

  // itemsを再構成（未チェック→チェック済みの順）
  const newItems = [];
  uncheckedItems.forEach(item => newItems.push(items[item.origIdx]));
  checkedItems.forEach(item => newItems.push(items[item.origIdx]));
  items = newItems;
  saveItems();
  renderList();
}
function handleDragEnd(e) {
  dragSrcIdx = null;
  document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

function saveItems() {
  localStorage.setItem('shopping-items', JSON.stringify(items));
  lastUpdated = new Date().toLocaleString();
  localStorage.setItem('shopping-last-updated', lastUpdated);
}

function renderQuickBtns() {
  const div = document.getElementById('quick-btns');
  div.innerHTML = '';
  quickItems.forEach((name) => {
    const btn = document.createElement('button');
    btn.className = 'quick-btn';
    btn.type = 'button';
    btn.onclick = () => addQuickItem(name);

    const span = document.createElement('span');
    span.textContent = name;
    btn.appendChild(span);

    div.appendChild(btn);
  });
}

function renderList() {
  const ul = document.getElementById('item-list');
  ul.innerHTML = '';
  // 未チェック→チェック済みの順で表示
  const uncheckedItems = items.map((item, idx) => ({ ...item, idx })).filter(item => !item.checked);
  const checkedItems = items.map((item, idx) => ({ ...item, idx })).filter(item => item.checked);

  // 未チェック項目はドラッグ可能
  uncheckedItems.forEach((item, i) => {
    const li = document.createElement('li');
    li.draggable = true;
    li.addEventListener('dragstart', e => handleDragStart(e, i));
    li.addEventListener('dragover', handleDragOver);
    li.addEventListener('dragleave', handleDragLeave);
    li.addEventListener('drop', e => handleDrop(e, i));
    li.addEventListener('dragend', handleDragEnd);

    const handle = document.createElement('span');
    handle.textContent = '☰';
    handle.className = 'drag-handle';
    li.appendChild(handle);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = false;
    checkbox.onchange = () => toggleCheck(item.idx);
    li.appendChild(checkbox);

    const span = document.createElement('span');
    span.textContent = item.text;
    span.className = 'unchecked-text';
    li.appendChild(span);

    const btn = document.createElement('span');
    btn.textContent = '削除';
    btn.className = 'delete-btn';
    btn.onclick = () => deleteItem(item.idx);
    li.appendChild(btn);

    ul.appendChild(li);
  });

  // チェック済み項目はドラッグ不可
  checkedItems.forEach((item) => {
    const li = document.createElement('li');
    const handle = document.createElement('span');
    handle.textContent = '';
    handle.className = 'drag-handle';
    li.appendChild(handle);

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = true;
    checkbox.onchange = () => toggleCheck(item.idx);
    checkbox.className = 'checked-checkbox';
    li.appendChild(checkbox);

    const span = document.createElement('span');
    span.textContent = item.text;
    span.className = 'checked-text';
    li.appendChild(span);

    const btn = document.createElement('span');
    btn.textContent = '削除';
    btn.className = 'delete-btn';
    btn.onclick = () => deleteItem(item.idx);
    li.appendChild(btn);

    ul.appendChild(li);
  });

  document.getElementById('last-updated').textContent = lastUpdated ? `最終更新日: ${lastUpdated}` : '';
}

// 初期表示
renderQuickBtns();
renderList();

// Enterキーで追加
document.getElementById('item-input').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') addItem();
});

// ページ復帰時にクイック項目を再描画
window.addEventListener('focus', () => {
  quickItems = JSON.parse(localStorage.getItem('shopping-quick-items') || '["牛乳","パン","フルグラ"]');
  renderQuickBtns();
});

window.onload = function() {
  document.getElementById('item-input').focus();
};

const micBtn = document.getElementById('mic-btn');
const input = document.getElementById('item-input');

if ('webkitSpeechRecognition' in window) {
  const recognition = new webkitSpeechRecognition();
  recognition.lang = 'ja-JP';
  recognition.continuous = false;
  recognition.interimResults = false;

  micBtn.onclick = () => {
    recognition.start();
  };

  recognition.onresult = function(event) {
    input.value = event.results[0][0].transcript;
    input.focus();
  };
} else {
  micBtn.style.display = 'none'; // 未対応ブラウザでは非表示
}

