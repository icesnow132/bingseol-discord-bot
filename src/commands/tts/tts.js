const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const https = require('https');
const { Readable } = require('stream');

const TTS_MAX_CHARS = 200;

/**
 * Fetch TTS audio from Google Translate TTS API.
 * @param {string} text - Text to speak
 * @param {string} lang - Language code (e.g. 'en', 'ko')
 * @returns {Promise<Readable>} Audio stream
 */
function getTTSStream(text, lang) {
  return new Promise((resolve, reject) => {
    const encoded = encodeURIComponent(text.slice(0, TTS_MAX_CHARS));
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`;
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`TTS request failed with status ${res.statusCode}`));
        return;
      }
      resolve(res);
    }).on('error', reject);
  });
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tts')
    .setDescription('Speak text in a voice channel using text-to-speech')
    .addStringOption((option) =>
      option.setName('text').setDescription('Text to speak').setRequired(true).setMaxLength(TTS_MAX_CHARS)
    )
    .addStringOption((option) =>
      option
        .setName('language')
        .setDescription('Language (default: English)')
        .addChoices(
          { name: 'English', value: 'en' },
          { name: 'Korean', value: 'ko' },
          { name: 'Japanese', value: 'ja' },
          { name: 'Chinese (Simplified)', value: 'zh-CN' },
          { name: 'Spanish', value: 'es' },
          { name: 'French', value: 'fr' },
          { name: 'German', value: 'de' },
          { name: 'Russian', value: 'ru' },
          { name: 'Portuguese', value: 'pt' },
          { name: 'Italian', value: 'it' }
        )
    ),

  async execute(interaction) {
    const text = interaction.options.getString('text');
    const lang = interaction.options.getString('language') || 'en';
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '🔇 You must be in a voice channel to use TTS!', ephemeral: true });
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.reply({ content: '❌ I need permission to join and speak in your voice channel!', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      const audioStream = await getTTSStream(text, lang);

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: interaction.guildId,
        adapterCreator: interaction.guild.voiceAdapterCreator,
      });

      const player = createAudioPlayer();
      connection.subscribe(player);

      const resource = createAudioResource(audioStream);
      player.play(resource);

      player.once(AudioPlayerStatus.Idle, () => {
        // Only destroy if not in use by music queue
        const queue = interaction.client.musicQueues.get(interaction.guildId);
        if (!queue || !queue.connection) {
          connection.destroy();
        }
      });

      player.once('error', (err) => {
        console.error('TTS player error:', err);
        connection.destroy();
      });

      const languageNames = {
        en: 'English', ko: 'Korean', ja: 'Japanese', 'zh-CN': 'Chinese (Simplified)',
        es: 'Spanish', fr: 'French', de: 'German', ru: 'Russian', pt: 'Portuguese', it: 'Italian',
      };

      const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle('🔊 TTS Speaking')
        .setDescription(`"${text}"`)
        .addFields(
          { name: 'Language', value: languageNames[lang] || lang, inline: true },
          { name: 'Channel', value: voiceChannel.name, inline: true }
        )
        .setTimestamp();

      return interaction.editReply({ embeds: [embed] });
    } catch (err) {
      console.error('TTS error:', err);
      return interaction.editReply('❌ Failed to generate TTS audio. Please try again.');
    }
  },
};
