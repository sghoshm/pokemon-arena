# 🕹️ Pokémon Arena – Turn-Based Battle Game

A retro-style Pokémon battle simulator built with **React** and **Vite**, inspired by classic Pokémon games.  
Choose a Pokémon, battle an AI opponent, manage attack accuracy and limited uses, and win by reducing the opponent’s HP to zero.

🌐 **Live Demo:** https://pokemonsan.netlify.app/  
📦 **Repository:** https://github.com/sghoshm/pokemon-arena

---

## 📖 Overview

Pokémon Arena is a browser-based turn-by-turn battle game where:
- The player selects a Pokémon
- An AI opponent is chosen randomly
- Each Pokémon has unique attacks with damage, accuracy, and limited uses
- Battles include animations, sound effects, and a live battle log
- Styled using **NES.css** for a retro Nintendo-like feel

---

## 🎮 Gameplay Flow

1. **Selection Phase**
   - Player selects a Pokémon
   - Opponent Pokémon is randomly assigned

2. **Battle Phase**
   - Player chooses an attack
   - Accuracy determines hit or miss
   - Damage reduces opponent HP
   - Turns alternate automatically

3. **Win Condition**
   - First Pokémon to reach **0 HP loses**

4. **Reset**
   - Restart the game and select new Pokémon

---

## ⚙️ Tech Stack

- **React** – UI & state management
- **Vite** – Fast build & dev environment
- **NES.css** – Retro UI styling
- **CSS** – Animations, layout, HP bars
- **Netlify** – Deployment & hosting

---

## 📁 Project Structure

pokemon-arena/
├── index.html
├── src/
│ ├── main.jsx
│ ├── App.jsx
│ ├── App.css
│ ├── pokemonData.js
│ └── assets/
│ └── sounds/
│ └── attack.mp3
└── README.md


---

## 🧩 File Breakdown

### `index.html`
- Root HTML file
- Contains `<div id="root"></div>`
- Loads NES.css via CDN

### `main.jsx`
- React entry point
- Renders the `App` component
- Uses `React.StrictMode` for development checks

### `pokemonData.js`
- Contains Pokémon data
- Each Pokémon includes:
  - Name
  - HP
  - Sprite
  - Attacks (damage, accuracy, uses)

### `App.jsx`
Handles all game logic:
- Pokémon selection
- Turn-based combat
- Attack accuracy & damage
- Battle logs
- Win detection
- Game reset

### `App.css`
- Battle arena layout
- HP bar animations
- Attack shake effects
- Retro-themed UI adjustments

---

## 🧠 Game Logic

- Attacks consume **limited uses**
- Accuracy determines hit or miss
- Damage reduces HP (never below 0)
- AI randomly selects valid attacks
- 1-second delays simulate turn flow

---

## 🔊 Audio

- Attack sound plays on each move
- Managed via `useRef`
- Enhances battle feedback

---

## 📝 Battle Log

- Displays all actions during battle
- Updates in real time
- Styled using NES.css lists
- Safe rendering (controlled content only)

---

## 🚀 Deployment

Hosted on **Netlify**  
🔗 https://pokemonsan.netlify.app/

---

## 🔮 Future Enhancements

- Responsive & centered layout
- Status effects (poison, burn, etc.)
- Multiple Pokémon per trainer
- Abilities and special moves
- Mobile support
- Multiplayer battles

---

## ⚠️ Disclaimer

This project is for **educational and personal use only**.  
Pokémon names, sprites, and concepts are owned by **Nintendo / Game Freak**.

---

## 👤 Author

**Sumon Ghosh**  
GitHub: https://github.com/sghoshm

⭐ If you like this project, consider starring the repository!
