const express = require('express');
const session = require('express-session');
const passport = require('passport');
const { Strategy: DiscordStrategy } = require('passport-discord');
const path = require('path');
const routes = require('./routes/index');

function startDashboard(client) {
  const port = process.env.DASHBOARD_PORT || 3000;
  const isProduction = process.env.NODE_ENV === 'production';
  const callbackURL = process.env.CALLBACK_URL || `http://localhost:${port}/auth/discord/callback`;

  // Require OAuth credentials when the dashboard is in use
  if (!process.env.CLIENT_ID || !process.env.CLIENT_SECRET) {
    console.warn('⚠️  DASHBOARD: CLIENT_ID or CLIENT_SECRET is not set. Discord OAuth2 login will not work.');
  }

  if (!process.env.SESSION_SECRET) {
    if (isProduction) {
      throw new Error('SESSION_SECRET environment variable is required in production.');
    }
    console.warn('⚠️  DASHBOARD: SESSION_SECRET is not set. Using an insecure default — set SESSION_SECRET in production!');
  }

  // Set up Passport Discord strategy
  passport.use(
    new DiscordStrategy(
      {
        clientID: process.env.CLIENT_ID || '',
        clientSecret: process.env.CLIENT_SECRET || '',
        callbackURL,
        scope: ['identify', 'guilds'],
      },
      (_accessToken, _refreshToken, profile, done) => {
        done(null, profile);
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user));
  passport.deserializeUser((user, done) => done(null, user));

  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, 'views'));

  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET || 'bingseol-dev-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: isProduction,
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000,
      },
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // Make Discord client available to routes
  app.use((req, _res, next) => {
    req.discordClient = client;
    next();
  });

  app.use('/', routes);

  app.listen(port, () => {
    console.log(`🌐 Dashboard running at http://localhost:${port}`);
  });
}

module.exports = { startDashboard };
