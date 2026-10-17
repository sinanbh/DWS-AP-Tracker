// ================= SERVICE WORKER REGISTRATION =================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.log('ServiceWorker registration skipped:', err);
    });
  });
}

// ================= UI STATE & TABS =================
let isEditMode = false;
let activeTargetItemId = null;

document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('active');
  });
});

function triggerHaptic() {
  if (navigator.vibrate) navigator.vibrate(20);
}

// ================= TRACKER UI =================
function modify(id, direction) {
  const steps = Storage.getSteps();
  const counts = Storage.getCounts();
  const step = steps[id] || 1;
  const current = counts[id] || 0;
  const next = Math.max(0, current + (direction * step));

  Storage.setCount(id, next);
  triggerHaptic();
  document.getElementById(`count-${id}`).value = next;
}

function setCountDirectly(id, val) {
  const parsed = parseInt(val, 10);
  Storage.setCount(id, isNaN(parsed) ? 0 : parsed);
  document.getElementById(`count-${id}`).value = Storage.getCounts()[id];
}

function updateStep(id, val) {
  const parsed = parseInt(val, 10);
  Storage.setStep(id, isNaN(parsed) ? 1 : parsed);
}

function toggleEditMode() {
  isEditMode = !isEditMode;
  const btn = document.getElementById('toggle-edit-btn');
  const addPanel = document.getElementById('add-panel');

  btn.textContent = isEditMode ? 'Done' : 'Edit List';
  btn.classList.toggle('active', isEditMode);
  addPanel.style.display = isEditMode ? 'flex' : 'none';
  renderTracker();
}

function addItem() {
  const input = document.getElementById('new-item-name');
  const name = input.value.trim();
  if (!name) return;

  Storage.addItem(name);
  input.value = '';
  renderTracker();
}

function removeItem(id) {
  if (!confirm('Remove this drop from list?')) return;
  Storage.removeItem(id);
  renderTracker();
}

function moveItem(index, offset) {
  Storage.moveItem(index, offset);
  renderTracker();
}

// ================= HELP MODAL LOGIC =================
function openHelpModal() {
  document.getElementById('help-modal').style.display = 'flex';
}

function closeHelpModal() {
  document.getElementById('help-modal').style.display = 'none';
}

// Dismiss modal when tapping outside the content box
function handleModalOverlayClick(event, modalId) {
  if (event.target.id === modalId) {
    document.getElementById(modalId).style.display = 'none';
    if (modalId === 'icon-modal') activeTargetItemId = null;
  }
}

// ================= ICON PICKER MODAL LOGIC =================
function openIconPicker(id) {
  activeTargetItemId = id;
  const grid = document.getElementById('preset-icons-grid');
  const presets = Storage.getPresetIcons();

  grid.innerHTML = presets.map(filename => {
    const fullPath = `icons/items/${filename}`;
    return `
      <div class="preset-icon-tile" onclick="choosePresetIcon('${fullPath}')" title="${filename}">
        <img src="${fullPath}" alt="${filename}">
      </div>
    `;
  }).join('');

  document.getElementById('icon-modal').style.display = 'flex';
}

function closeIconModal() {
  document.getElementById('icon-modal').style.display = 'none';
  activeTargetItemId = null;
}

function choosePresetIcon(path) {
  if (!activeTargetItemId) return;
  Storage.setIcon(activeTargetItemId, path);
  closeIconModal();
  renderTracker();
}

function triggerDeviceUpload() {
  const picker = document.getElementById('icon-file-input');
  picker.value = '';
  picker.click();
}

document.getElementById('icon-file-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file || !activeTargetItemId) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    Storage.setIcon(activeTargetItemId, evt.target.result);
    closeIconModal();
    renderTracker();
  };
  reader.readAsDataURL(file);
});

function resetToDefaultIcon() {
  if (!activeTargetItemId) return;
  Storage.resetIcon(activeTargetItemId);
  closeIconModal();
  renderTracker();
}

// ================= HISTORY UI =================
function handleArchiveEvent() {
  const defaultLabel = new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' });
  const title = prompt('Label for this event:', defaultLabel);
  if (!title) return;

  Storage.archiveCurrentEvent(title);
  renderTracker();
  renderHistory();
  alert(`"${title}" saved to History! Current tallies reset to 0.`);
}

function renderHistory() {
  const container = document.getElementById('history-container');
  const history = Storage.getHistory();

  if (history.length === 0) {
    container.innerHTML = `<div style="text-align: center; color: var(--subtext); padding: 24px 0; font-size: 0.85rem;">No past events archived yet. Tap "Save & Reset Event" when an event concludes.</div>`;
    return;
  }

  container.innerHTML = history.map(entry => `
    <div class="history-card">
      <div class="history-header">
        <div>
          <span class="history-title">${entry.title}</span>
          <span class="subtext-small">${entry.date}</span>
        </div>
        <button class="btn-danger-outline" onclick="handleDeleteHistory(${entry.id})">Delete</button>
      </div>
      <table class="history-table">
        <tbody>
          ${entry.snapshot.map(row => `
            <tr>
              <td>${row.name}</td>
              <td>${row.count.toLocaleString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('');
}

function handleDeleteHistory(id) {
  if (!confirm('Delete this historical entry?')) return;
  Storage.deleteHistoryEntry(id);
  renderHistory();
}

function handleClearAllHistory() {
  if (!confirm('Clear all past records? This cannot be undone.')) return;
  Storage.clearAllHistory();
  renderHistory();
}

// ================= BACKUP & EXPORT =================
function triggerExport() {
  Storage.exportJSON();
}

function triggerImport() {
  document.getElementById('backup-file-input').click();
}

document.getElementById('backup-file-input').addEventListener('change', function(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function(evt) {
    try {
      Storage.importJSON(evt.target.result);
      renderTracker();
      renderHistory();
      alert('Backup imported successfully!');
    } catch (err) {
      alert('Invalid backup JSON file.');
    }
  };
  reader.readAsText(file);
});

function copySummary() {
  const items = Storage.getItems();
  const counts = Storage.getCounts();

  const activeLines = items
    .filter(item => (counts[item.id] || 0) > 0)
    .map(item => `${item.name}: ${counts[item.id]}`);

  if (activeLines.length === 0) {
    alert("No drops recorded yet (all counts are 0). Nothing to copy!");
    return;
  }

  const text = activeLines.join('\n');
  navigator.clipboard.writeText(text).then(() => {
    alert("Summary copied to clipboard!\n\n" + text);
  });
}

// ================= RENDER TRACKER =================
function renderTracker() {
  const list = document.getElementById('tracker-list');
  const items = Storage.getItems();
  const counts = Storage.getCounts();
  const icons = Storage.getIcons();
  const steps = Storage.getSteps();

  list.innerHTML = '';

  items.forEach((item, index) => {
    const count = counts[item.id] || 0;
    const step = steps[item.id] || 1;
    
    // Priority: custom chosen icon > item defaultIcon > null
    const iconSrc = icons[item.id] || item.defaultIcon || null;

    const card = document.createElement('div');
    card.className = `card ${isEditMode ? 'editing' : ''}`;

    const iconHtml = iconSrc
      ? `<img src="${iconSrc}" alt="${item.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
         <div class="icon-placeholder" style="display: none;">Pick icon</div>`
      : `<div class="icon-placeholder">Pick icon</div>`;

    const rightControls = isEditMode
      ? `<div class="edit-controls">
           <button class="btn-order" onclick="moveItem(${index}, -1)" ${index === 0 ? 'disabled' : ''}>▲</button>
           <button class="btn-order" onclick="moveItem(${index}, 1)" ${index === items.length - 1 ? 'disabled' : ''}>▼</button>
           <button class="btn-del" onclick="removeItem('${item.id}')">✕</button>
         </div>`
      : `<div class="stepper">
           <button class="step-btn btn-sub" onclick="modify('${item.id}', -1)">−</button>
           <input type="number" inputmode="numeric" class="step-val" id="step-${item.id}" 
                  value="${step}" onchange="updateStep('${item.id}', this.value)">
           <button class="step-btn btn-add" onclick="modify('${item.id}', 1)">+</button>
         </div>`;

    card.innerHTML = `
      <div class="icon-wrapper" onclick="openIconPicker('${item.id}')" title="Tap to pick or upload icon">
        ${iconHtml}
      </div>
      <div class="info">
        <div class="name">${item.name}</div>
        <input type="number" inputmode="numeric" class="count-input" id="count-${item.id}" 
               value="${count}" onchange="setCountDirectly('${item.id}', this.value)" 
               ${isEditMode ? 'disabled' : ''}>
      </div>
      ${rightControls}
    `;
    list.appendChild(card);
  });
}

// Initial render calls
renderTracker();
renderHistory();
