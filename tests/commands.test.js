const path = require('path');
const fs = require('fs');

const BASE = path.join(__dirname, '..');

describe('Command loading', () => {
  const commandFolders = ['music', 'tts', 'admin'];

  test('all command files export data and execute', () => {
    const loaded = [];
    for (const folder of commandFolders) {
      const commandsPath = path.join(BASE, 'src', 'commands', folder);
      const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        expect(command).toHaveProperty('data');
        expect(command).toHaveProperty('execute');
        expect(typeof command.execute).toBe('function');
        loaded.push(command.data.name);
      }
    }
    expect(loaded.length).toBeGreaterThan(0);
  });

  test('music commands are present', () => {
    const musicPath = path.join(BASE, 'src', 'commands', 'music');
    const files = fs.readdirSync(musicPath).map((f) => f.replace('.js', ''));
    expect(files).toContain('play');
    expect(files).toContain('skip');
    expect(files).toContain('stop');
    expect(files).toContain('queue');
    expect(files).toContain('pause');
    expect(files).toContain('resume');
    expect(files).toContain('loop');
    expect(files).toContain('nowplaying');
  });

  test('tts command is present', () => {
    const ttsPath = path.join(BASE, 'src', 'commands', 'tts');
    const files = fs.readdirSync(ttsPath).map((f) => f.replace('.js', ''));
    expect(files).toContain('tts');
  });

  test('admin commands are present', () => {
    const adminPath = path.join(BASE, 'src', 'commands', 'admin');
    const files = fs.readdirSync(adminPath).map((f) => f.replace('.js', ''));
    expect(files).toContain('kick');
    expect(files).toContain('ban');
    expect(files).toContain('unban');
    expect(files).toContain('timeout');
    expect(files).toContain('clear');
    expect(files).toContain('serverinfo');
    expect(files).toContain('userinfo');
    expect(files).toContain('slowmode');
    expect(files).toContain('ping');
    expect(files).toContain('help');
  });

  test('no duplicate command names', () => {
    const names = [];
    for (const folder of commandFolders) {
      const commandsPath = path.join(BASE, 'src', 'commands', folder);
      const commandFiles = fs.readdirSync(commandsPath).filter((f) => f.endsWith('.js'));
      for (const file of commandFiles) {
        const command = require(path.join(commandsPath, file));
        expect(names).not.toContain(command.data.name);
        names.push(command.data.name);
      }
    }
  });
});

describe('Event loading', () => {
  test('all event files export name, once, and execute', () => {
    const eventsPath = path.join(BASE, 'src', 'events');
    const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith('.js'));
    expect(eventFiles.length).toBeGreaterThan(0);
    for (const file of eventFiles) {
      const event = require(path.join(eventsPath, file));
      expect(event).toHaveProperty('name');
      expect(event).toHaveProperty('execute');
      expect(typeof event.execute).toBe('function');
    }
  });

  test('ready event exists and is once', () => {
    const event = require(path.join(BASE, 'src', 'events', 'ready.js'));
    expect(event.name).toBe('ready');
    expect(event.once).toBe(true);
  });

  test('interactionCreate event exists and is not once', () => {
    const event = require(path.join(BASE, 'src', 'events', 'interactionCreate.js'));
    expect(event.name).toBe('interactionCreate');
    expect(event.once).toBe(false);
  });
});

describe('Dashboard module', () => {
  test('startDashboard is exported as a function', () => {
    const dashboard = require(path.join(BASE, 'src', 'dashboard', 'index.js'));
    expect(typeof dashboard.startDashboard).toBe('function');
  });

  test('routes are exported as a function (express router)', () => {
    const routes = require(path.join(BASE, 'src', 'dashboard', 'routes', 'index.js'));
    expect(typeof routes).toBe('function');
  });
});

describe('TTS command options', () => {
  test('tts command supports multiple languages', () => {
    const tts = require(path.join(BASE, 'src', 'commands', 'tts', 'tts.js'));
    const languageOption = tts.data.options.find((o) => o.name === 'language');
    expect(languageOption).toBeDefined();
    const choices = languageOption.choices;
    expect(choices.length).toBeGreaterThanOrEqual(5);
    const values = choices.map((c) => c.value);
    expect(values).toContain('en');
    expect(values).toContain('ko');
    expect(values).toContain('ja');
  });
});
