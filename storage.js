const Storage = (() => {
  // All images placed in `icons/items/`. Add more filenames here as you expand!
  const PRESET_ICONS = [
    'power_core.png',
    'dx_blueprints.png',
    'precision_parts.png',
    'weapon_fragments.png',
    'titanium_alloys.png',
    'hero_shards.png'
  ];

  const DEFAULT_ITEMS = [
    { id: 'power_core', name: 'Power Core', defaultIcon: 'icons/items/power_core.png' },
    { id: 'dx_blueprints', name: 'DX Blueprints', defaultIcon: 'icons/items/dx_blueprints.png' },
    { id: 'precision_parts', name: 'Precision Parts', defaultIcon: 'icons/items/precision_parts.png' },
    { id: 'weapon_fragments', name: 'Weapon Fragments', defaultIcon: 'icons/items/weapon_fragments.png' },
    { id: 'titanium_alloys', name: 'Titanium Alloys', defaultIcon: 'icons/items/titanium_alloys.png' },
    { id: 'hero_shards', name: 'Hero Shards', defaultIcon: 'icons/items/hero_shards.png' }
  ];

  let items = JSON.parse(localStorage.getItem('loot_items')) || DEFAULT_ITEMS;
  let counts = JSON.parse(localStorage.getItem('loot_counts')) || {};
  let icons = JSON.parse(localStorage.getItem('loot_icons')) || {};
  let steps = JSON.parse(localStorage.getItem('loot_steps')) || {};
  let history = JSON.parse(localStorage.getItem('loot_history')) || [];

  // Update existing stored paths to the new icons/items/ subfolder if needed
  items.forEach(item => {
    const def = DEFAULT_ITEMS.find(d => d.id === item.id);
    if (def) {
      item.defaultIcon = def.defaultIcon;
    }
  });

  function persist() {
    localStorage.setItem('loot_items', JSON.stringify(items));
    localStorage.setItem('loot_counts', JSON.stringify(counts));
    localStorage.setItem('loot_icons', JSON.stringify(icons));
    localStorage.setItem('loot_steps', JSON.stringify(steps));
    localStorage.setItem('loot_history', JSON.stringify(history));
  }

  return {
    getItems: () => items,
    getCounts: () => counts,
    getIcons: () => icons,
    getSteps: () => steps,
    getHistory: () => history,
    getPresetIcons: () => PRESET_ICONS,

    setCount: (id, val) => {
      counts[id] = Math.max(0, val);
      persist();
    },

    setStep: (id, val) => {
      steps[id] = Math.max(1, val);
      persist();
    },

    setIcon: (id, iconPathOrBase64) => {
      icons[id] = iconPathOrBase64;
      persist();
    },

    resetIcon: (id) => {
      delete icons[id];
      persist();
    },

    addItem: (name) => {
      const id = 'drop_' + Date.now();
      items.push({ id, name, defaultIcon: null });
      counts[id] = 0;
      steps[id] = 1;
      persist();
      return id;
    },

    removeItem: (id) => {
      items = items.filter(i => i.id !== id);
      delete counts[id];
      delete icons[id];
      delete steps[id];
      persist();
    },

    moveItem: (index, offset) => {
      const target = index + offset;
      if (target < 0 || target >= items.length) return;
      [items[index], items[target]] = [items[target], items[index]];
      persist();
    },

    archiveCurrentEvent: (title) => {
      const entry = {
        id: Date.now(),
        title: title || new Date().toLocaleString('en-US', { month: 'short', year: 'numeric' }),
        date: new Date().toLocaleDateString(),
        snapshot: items.map(i => ({ name: i.name, count: counts[i.id] || 0 }))
      };
      history.unshift(entry);
      items.forEach(i => { counts[i.id] = 0; });
      persist();
    },

    deleteHistoryEntry: (id) => {
      history = history.filter(h => h.id !== id);
      persist();
    },

    clearAllHistory: () => {
      history = [];
      persist();
    },

    exportJSON: () => {
      const data = { items, counts, icons, steps, history, version: '1.2' };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = `drop_tracker_backup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    },

    importJSON: (jsonString) => {
      const parsed = JSON.parse(jsonString);
      if (parsed.items) items = parsed.items;
      if (parsed.counts) counts = parsed.counts;
      if (parsed.icons) icons = parsed.icons;
      if (parsed.steps) steps = parsed.steps;
      if (parsed.history) history = parsed.history;
      persist();
    }
  };
})();
