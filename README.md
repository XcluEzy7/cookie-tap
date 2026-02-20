# 🍪 Cookie Clicker PWA

A fully-featured, progressive web app (PWA) cookie clicker game that works offline and can be installed to your home screen!

![Cookie Clicker Screenshot](https://via.placeholder.com/800x400/F5DEB3/8B4513?text=Cookie+Clicker)

## ✨ Features

- 🎮 **Classic Cookie Clicker Gameplay** - Click the cookie, buy upgrades, watch the numbers grow!
- 📱 **PWA Support** - Install to home screen, works offline
- 🏆 **5 Upgrade Tiers** - Cursor, Grandma, Farm, Mine, Factory
- 💾 **Auto-Save** - Progress saved every 5 seconds
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 🔊 **Sound Effects** - Satisfying click and buy sounds
- 📊 **Statistics** - Track total cookies, CPS, and clicks
- 🚀 **Offline Progress** - Earn 50% of CPS while offline

## 🚀 Quick Start

### Option 1: Play Online

Visit: `https://yourusername.github.io/cookie-clicker/`

### Option 2: Run Locally

```bash
# Clone the repository
git clone https://github.com/yourusername/cookie-clicker.git
cd cookie-clicker

# Start a local server
python3 -m http.server 8080

# Open in browser
open http://localhost:8080
```

### Option 3: Open Directly

Simply open `index.html` in any modern web browser.

## 📁 Project Structure

```
cookie-clicker/
├── index.html          # Main game file (HTML + CSS + JS)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker for offline support
├── cookie-icon-192.png # App icon (192x192)
├── cookie-icon-512.png # App icon (512x512)
└── README.md           # This file
```

## 🎮 Game Mechanics

### Upgrades

| Upgrade | Base Cost | Base CPS | Icon |
|---------|-----------|----------|------|
| Cursor | 15 cookies | 0.1 CPS | 🖱️ |
| Grandma | 100 cookies | 1 CPS | 👵 |
| Farm | 1,100 cookies | 8 CPS | 🚜 |
| Mine | 12,000 cookies | 47 CPS | ⛏️ |
| Factory | 130,000 cookies | 260 CPS | 🏭 |

### Cost Scaling
Each upgrade costs 15% more than the previous purchase.

### Achievements
The game tracks:
- Total cookies baked (all-time)
- Total clicks
- Play time
- Cookies per second (CPS)

## 🛠️ Technologies Used

- **HTML5** - Semantic markup
- **CSS3** - Custom properties, animations, flexbox/grid
- **Vanilla JavaScript** - ES6+ features
- **Service Worker** - Offline caching
- **Web Audio API** - Sound generation
- **LocalStorage** - Game state persistence

## 📱 PWA Features

- **Installable** - Add to home screen on mobile/desktop
- **Offline Capable** - Service worker caches assets
- **Responsive** - Works on all screen sizes
- **App-like** - Standalone display, theme colors

## 🎨 Customization

### Changing Theme Colors

Edit the CSS variables in `index.html`:

```css
:root {
    --bg-color: #F5DEB3;
    --cookie-color: #CD853F;
    --accent-gold: #FFD700;
    /* ... more variables */
}
```

### Adding More Upgrades

Edit the `game.upgrades` object in the JavaScript:

```javascript
upgrades: {
    // ... existing upgrades
    newUpgrade: {
        owned: 0,
        baseCost: 1000000,
        baseCps: 1000,
        name: 'Super Factory',
        icon: '🚀'
    }
}
```

## 🤝 Contributing

Contributions welcome! Feel free to:
- Report bugs
- Suggest features
- Submit pull requests

## 📄 License

MIT License - feel free to use for your own projects!

## 🙏 Credits

Built with ❤️ by Agent Zero

---

**Click the cookie!** 🍪
