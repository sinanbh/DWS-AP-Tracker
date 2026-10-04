# ⚔️ Event Drop Tracker

<p align="center">
  <img src="https://img.shields.io/badge/Status-Active-emerald?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Platform-Web%20%7C%20Mobile-blue?style=for-the-badge" alt="Platform">
  <img src="https://img.shields.io/badge/Storage-100%25%20Local-purple?style=for-the-badge" alt="Storage">
  <img src="https://img.shields.io/badge/Hosting-GitHub%20Pages-black?style=for-the-badge&logo=github" alt="GitHub Pages">
  <img src="https://img.shields.io/badge/Dependencies-Zero-red?style=for-the-badge" alt="Dependencies">
</p>

<p align="center">
  A sleek, mobile-optimized, single-file drop and loot counter built for fast-paced gaming events. Track drops with one tap, configure bulk increments, upload custom item art, and reorder on the fly without database latency or account logins.
</p>

---

## ⚡ Live Demo

Access the live tracker directly from your mobile browser:
👉 **`https://sinanbh.github.io/DWS-AP-Tracker/`**

> 📱 **Pro Tip:** In Chrome or Safari on mobile, tap **Options (⋮)** → **"Add to Home Screen"** or **"Install App"** to launch it as a fullscreen, distraction-free app without URL bars.

---

## ✨ Features at a Glance

| Feature | Description |
| :--- | :--- |
| 🎯 **Adaptive Stepper** | Change drop values by `+1`, `+5`, `+10`, or custom bulk numbers via the middle step field. |
| ⌨️ **Direct Keyboard Edit** | Tap directly into any item's total count to set exact numbers manually. |
| 🖼️ **Custom Icon Upload** | Tap any icon tile to load screenshot art straight from your phone's camera roll. |
| 🗂️ **Dynamic List Management** | Toggle **Edit List** to add new custom items, remove unwanted drops, and reorder priority (▲ / ▼). |
| 📋 **Instant Clipboard Export** | One-tap button generates a clean, formatted text summary ready to paste into game chats or Discord. |
| 📳 **Haptic Feedback** | Provides tactile vibration on tap (supported Android mobile devices). |
| 🔒 **100% Private & Client-Side** | Zero servers. Zero tracking. Data remains inside your device's browser sandbox. |

---

## 🎮 Default Tracked Items

The tracker comes preloaded with six essential war and survival progression assets:

* 🌀 **Power Core**
* 📜 **DX Blueprints**
* ⚙️ **Precision Parts**
* 🎖️ **Weapon Fragments**
* 🧱 **Titanium Alloys**
* 🧩 **Hero Shards**

*Need different items? Tap **Edit List** in the top-right corner to add your own or delete defaults.*

---

## 🛠️ How It Works

```text
[ User Tap / Input ]
        │
        ▼
[ JavaScript Event Handler ] ───► [ Web Vibration API (Haptic) ]
        │
        ▼
[ DOM Re-render (Instant) ]
        │
        ▼
[ LocalStorage Cache ]
  ├── loot_items  (Item manifest & order)
  ├── loot_counts (Active tally numbers)
  ├── loot_steps  (Per-item custom step amounts)
  └── loot_icons  (Base64-encoded image blobs)
