# ❄️ BingSeol Bot

A simple and powerful Discord bot for your server.

## ✨ Features
- 🎵 **Music playback** — Play songs from YouTube with a full queue, skip, pause, resume, loop
- 🔊 **Natural voice (TTS)** — Speak text in voice channels with multi-language support
- ⚙️ **Server management tools** — Kick, ban, timeout, clear messages, slowmode, and more
- 🌐 **Web dashboard** — Manage your servers from a sleek web interface

## 🚀 Invite Bot
👉 https://discord.com/oauth2/authorize?client_id=1157769236509380688&permissions=8&scope=applications.commands%20bot

## 💬 Support Server
👉 https://discord.gg/cH87hp5RQR

## 📌 Why this bot?
Fast, stable, and easy to use. No complicated setup needed.

---

## 🛠️ Self-Hosting

### Prerequisites
- [Node.js](https://nodejs.org/) v18+
- [FFmpeg](https://ffmpeg.org/) (or use the bundled `@ffmpeg-installer/ffmpeg`)
- A Discord Bot Token ([Discord Developer Portal](https://discord.com/developers/applications))

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/icesnow132/bingseol-discord-bot.git
   cd bingseol-discord-bot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your bot token and other values
   ```

4. **Deploy slash commands**
   ```bash
   npm run deploy
   ```

5. **Start the bot**
   ```bash
   npm start
   ```

### Environment Variables

| Variable | Description | Required |
|---|---|---|
| `DISCORD_TOKEN` | Bot token from Discord Developer Portal | ✅ |
| `CLIENT_ID` | Application/Client ID | ✅ |
| `CLIENT_SECRET` | Client secret (for web dashboard OAuth2) | Optional |
| `DASHBOARD_PORT` | Port for the web dashboard (default: 3000) | Optional |
| `SESSION_SECRET` | Secret for session encryption | Optional |
| `CALLBACK_URL` | OAuth2 callback URL (default: `http://localhost:3000/auth/discord/callback`) | Optional |
| `OWNER_ID` | Your Discord user ID | Optional |

---

## 📋 Commands

### 🎵 Music
| Command | Description |
|---|---|
| `/play <query>` | Play a song from YouTube by name or URL |
| `/skip` | Skip the current song |
| `/stop` | Stop music and disconnect from voice |
| `/pause` | Pause the current song |
| `/resume` | Resume the paused song |
| `/queue [page]` | Show the music queue |
| `/nowplaying` | Display the currently playing song |
| `/loop` | Toggle loop mode |

### 🔊 TTS (Text-to-Speech)
| Command | Description |
|---|---|
| `/tts <text> [language]` | Speak text in a voice channel. Supports: English, Korean, Japanese, Chinese, Spanish, French, German, Russian, Portuguese, Italian |

### ⚙️ Server Management
| Command | Description | Required Permission |
|---|---|---|
| `/kick <user> [reason]` | Kick a member | Kick Members |
| `/ban <user> [reason] [days]` | Ban a member | Ban Members |
| `/unban <user_id> [reason]` | Unban a user | Ban Members |
| `/timeout <user> <duration> [reason]` | Timeout a member | Moderate Members |
| `/clear <amount> [user]` | Bulk delete messages | Manage Messages |
| `/slowmode <seconds> [channel]` | Set channel slowmode | Manage Channels |
| `/serverinfo` | Display server information | — |
| `/userinfo [user]` | Display user information | — |
| `/ping` | Check bot latency | — |
| `/help` | Show all commands | — |

---

## 🌐 Web Dashboard

The bot includes a web dashboard accessible at `http://localhost:3000` (or your configured port).

Features:
- 📊 Server overview with member counts
- 🎵 Live music queue viewer per server
- 🔐 Discord OAuth2 login

---

## 📄 License

[ISC](LICENSE)
