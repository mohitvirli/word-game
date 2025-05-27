# the.word.game

> A fun, turn-based word challenge built with Next.js.  
> Take turns spelling words of a fixed length, follow the last‐letter rule, and race the clock (optional)!

<img width="848" alt="image" src="https://github.com/user-attachments/assets/8e26e463-76aa-4e7a-ac71-536f6820a77d" />


## 🚀 Live Demo

Play it right now:  
https://word-game-gamma.vercel.app


## 🎮 Features

- **Local & Multiplayer**  
  - Local: add names and pass the device around.  
  - Multiplayer: share a Room ID and play online with friends.
- **Custom Word Length**  
  - Choose 3, 4 or 5 letter words.
- **Optional Turn Timer**  
  - Toggle on for a fast-paced experience.
- **Real-time Scoring**  
  - Earn 1 point per valid word.
- **No Repeats**  
  - Once used, words can’t be played again.

## 📖 How to Play

1. **Select Game Mode**  
   - **Local**: everyone plays on one screen.  
   - **Multiplayer**: create/join a room via a shared ID.
2. **Add Players**  
   - Type a name, click **Add**, repeat for each player.
3. **Choose Word Length**  
   - Pick **3 Letter**, **4 Letter** or **5 Letter**.
4. **Enable Turn Timer (Optional)**  
   - Toggle **Use Turn Time** for timed turns.
5. **Start Game**  
   - Click **Start Game** to begin.
6. **Follow the Rules**  
   - Players alternate turns entering a word of the chosen length.  
   - Each word **must** start with the **last letter** of the previous word.  
   - Words **cannot** be repeated.  
   - Each valid word = **1 point**.  
   - If the timer is on, submit your word **before time runs out**.


## 🛠️ Getting Started

### Prerequisites

- **Node.js** v14+  
- **npm**, **yarn**, or **pnpm** (or **bun**)

### Installation

```bash
git clone https://github.com/mohitvirli/word-game.git
cd word-game
npm install        # or yarn / pnpm install
```
### Run Locally

```bash
npm run dev        # or yarn dev / pnpm dev / bun dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## ☁️ Deployment

This project is optimized for Vercel—you can deploy with zero config:

1. Push your repo to GitHub.  
2. Import into [Vercel](https://vercel.com/).  
3. ⌛ Watch it go live!

Read more: https://nextjs.org/docs/deployment

## 🔧 Tech Stack

- **Next.js** / React  
- **TypeScript**  
- Styling: your choice (Tailwind, CSS Modules, Chakra UI…)  
- **WebSockets** (Socket.io) for realtime multiplayer

## 🤝 Contributing

1. Fork it  
2. Create your feature branch (`git checkout -b feature/YourFeatu

