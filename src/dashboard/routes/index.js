const express = require('express');
const passport = require('passport');

const router = express.Router();

// Middleware to check if user is authenticated
function isAuthenticated(req, res, next) {
  if (req.isAuthenticated()) return next();
  return res.redirect('/login');
}

// Home page
router.get('/', (req, res) => {
  const client = req.discordClient;
  res.render('index', {
    user: req.user || null,
    botName: client?.user?.tag || 'BingSeol Bot',
    guildCount: client?.guilds?.cache?.size || 0,
    commandCount: client?.commands?.size || 0,
  });
});

// Login page
router.get('/login', (req, res) => {
  if (req.isAuthenticated()) return res.redirect('/dashboard');
  res.render('login', { user: null });
});

// Discord OAuth2 - start
router.get('/auth/discord', passport.authenticate('discord'));

// Discord OAuth2 - callback
router.get(
  '/auth/discord/callback',
  passport.authenticate('discord', { failureRedirect: '/login' }),
  (req, res) => {
    res.redirect('/dashboard');
  }
);

// Logout
router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});

// Dashboard overview (requires login)
router.get('/dashboard', isAuthenticated, (req, res) => {
  const client = req.discordClient;

  // Filter guilds the user is in and the bot is in
  const userGuildIds = req.user.guilds?.map((g) => g.id) || [];
  const botGuilds = client?.guilds?.cache
    ? [...client.guilds.cache.values()]
        .filter((g) => userGuildIds.includes(g.id))
        .map((g) => ({
          id: g.id,
          name: g.name,
          icon: g.iconURL({ size: 64 }),
          memberCount: g.memberCount,
        }))
    : [];

  res.render('dashboard', {
    user: req.user,
    botGuilds,
    guildCount: client?.guilds?.cache?.size || 0,
  });
});

// Guild-specific dashboard
router.get('/dashboard/:guildId', isAuthenticated, (req, res) => {
  const client = req.discordClient;
  const { guildId } = req.params;

  const guild = client?.guilds?.cache?.get(guildId);
  if (!guild) {
    return res.redirect('/dashboard');
  }

  const userGuildIds = req.user.guilds?.map((g) => g.id) || [];
  if (!userGuildIds.includes(guildId)) {
    return res.redirect('/dashboard');
  }

  const musicQueue = client?.musicQueues?.get(guildId);
  const currentSong = musicQueue?.songs?.[0] || null;
  const queueList = musicQueue?.songs?.slice(1) || [];

  res.render('guild', {
    user: req.user,
    guild: {
      id: guild.id,
      name: guild.name,
      icon: guild.iconURL({ size: 256 }),
      memberCount: guild.memberCount,
    },
    currentSong,
    queueList,
    looping: musicQueue?.looping || false,
  });
});

// 404 handler
router.use((req, res) => {
  res.status(404).render('404', { user: req.user || null });
});

module.exports = router;
