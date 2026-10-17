const Storage = (() => {
  // Preset item drop images in icons/items/
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

  // Definition for Orange Chip Calculator items
  const CHIP_ITEMS = [
    { id: 'material', name: 'Advanced Chip Material', yield: 1, type: 'material', icon: 'icons/chips/advanced_chip_material.png', desc: '1 Material each', badge: '🧪' },
    { id: 'orange_chest', name: 'Orange Chip Chest', yield: 100, type: 'chest', icon: 'icons/chips/orange_chip_chest.png', desc: '100 Materials / chest', badge: '🟧' },
    { id: 'purple_chest', name: 'Purple Chip Chest', yield: 30, type: 'chest', icon: 'icons/chips/purple_chip_chest.png', desc: '30 Materials / chest', badge: '🟪' },
    { id: 'blue_chest', name: 'Blue Chip Chest', yield: 5, type: 'chest', icon: 'icons/chips/blue_chip_chest.png', desc: '5 Materials / chest', badge: '🟦' },
    { id: 'green_chest', name: 'Green Chip Chest', yield: 1, type: 'chest', icon: 'icons/chips/green_chip_chest.png', desc: '1 Material / chest', badge: '🟩' },
    { id: 'choice_chest', name: 'Orange Chip Choice Chest', yield: 1, type: 'direct_chip', icon: 'icons/chips/orange_chip_choice_chest.png', desc: '1 Orange Chip directly', badge: '🎁' }
  ];

  let items = JSON.parse(localStorage.getItem('loot_items')) || DEFAULT_ITEMS;
  let counts = JSON.parse(localStorage.getItem('loot_counts')) || {};
  let icons = JSON.parse(localStorage.getItem('loot_icons')) || {};
  let steps = JSON.parse(localStorage.getItem('loot_steps')) || {};
  let history = JSON.parse(localStorage.getItem('loot_history')) || [];
  let chipCounts = JSON.parse(localStorage.getItem('chip_calc_counts')) || {};

  items.forEach(item => {
    const def = DEFAULT_ITEMS.find(d => d.id === item.id);
    if (def) item.defaultIcon = def.defaultIcon;
  });

  function persist() {
    localStorage.setItem('loot_items', JSON.stringify(items));
    localStorage.setItem('loot_counts', JSON.stringify(counts));
    localStorage.setItem('loot_icons', JSON.stringify(icons));
    localStorage.setItem('loot_steps', JSON.stringify(steps));
    localStorage.setItem('loot_history', JSON.stringify(history));
    localStorage.setItem('chip_calc_counts', JSON.stringify(chipCounts));
  }

  return {
    getItems: () => items,
    getCounts: () => counts,
    getIcons: () => icons,
    getSteps: () => steps,
    getHistory: () => history,
    getPresetIcons: () => PRESET_ICONS,

    // Tracker Count & Setup
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
      const data = { items, counts, icons, steps, history, version: '1.3' };
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
    },

    // Chip Calculator Accessors
    getChipItems: () => CHIP_ITEMS,
    getChipCounts: () => chipCounts,
    setChipCount: (id, val) => {
      chipCounts[id] = Math.max(0, val);
      persist();
    },
    resetChipCounts: () => {
      chipCounts = {};
      persist();
    }
  };
})();
