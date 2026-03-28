const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, VoiceConnectionStatus } = require('@discordjs/voice');
const play = require('play-dl');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('play')
    .setDescription('Play a song from YouTube')
    .addStringOption((option) =>
      option.setName('query').setDescription('Song name or YouTube URL').setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');
    const voiceChannel = interaction.member.voice.channel;

    if (!voiceChannel) {
      return interaction.reply({ content: '🔇 You must be in a voice channel to play music!', ephemeral: true });
    }

    const permissions = voiceChannel.permissionsFor(interaction.client.user);
    if (!permissions.has('Connect') || !permissions.has('Speak')) {
      return interaction.reply({ content: '❌ I need permission to join and speak in your voice channel!', ephemeral: true });
    }

    await interaction.deferReply();

    try {
      let songInfo;
      if (play.yt_validate(query) === 'video') {
        const info = await play.video_info(query);
        songInfo = {
          title: info.video_details.title,
          url: info.video_details.url,
          duration: info.video_details.durationRaw,
          thumbnail: info.video_details.thumbnails?.[0]?.url,
          requestedBy: interaction.user.tag,
        };
      } else {
        const searchResults = await play.search(query, { limit: 1 });
        if (!searchResults || searchResults.length === 0) {
          return interaction.editReply('❌ No results found for your query.');
        }
        const video = searchResults[0];
        songInfo = {
          title: video.title,
          url: video.url,
          duration: video.durationRaw,
          thumbnail: video.thumbnails?.[0]?.url,
          requestedBy: interaction.user.tag,
        };
      }

      const guildId = interaction.guildId;
      if (!interaction.client.musicQueues.has(guildId)) {
        interaction.client.musicQueues.set(guildId, { songs: [], player: null, connection: null, looping: false });
      }
      const queue = interaction.client.musicQueues.get(guildId);
      queue.songs.push(songInfo);

      if (!queue.connection || queue.connection.state.status === VoiceConnectionStatus.Destroyed) {
        const connection = joinVoiceChannel({
          channelId: voiceChannel.id,
          guildId: interaction.guildId,
          adapterCreator: interaction.guild.voiceAdapterCreator,
        });
        queue.connection = connection;
        const player = createAudioPlayer();
        queue.player = player;
        connection.subscribe(player);

        player.on(AudioPlayerStatus.Idle, () => {
          if (queue.looping && queue.songs.length > 0) {
            const current = queue.songs[0];
            queue.songs.push({ ...current });
          }
          queue.songs.shift();
          if (queue.songs.length > 0) {
            playSong(queue, interaction.channel);
          } else {
            connection.destroy();
            interaction.client.musicQueues.delete(guildId);
          }
        });

        player.on('error', (err) => {
          console.error('Audio player error:', err);
          queue.songs.shift();
          if (queue.songs.length > 0) {
            playSong(queue, interaction.channel);
          } else {
            connection.destroy();
            interaction.client.musicQueues.delete(guildId);
          }
        });

        await playSong(queue, interaction.channel, true);

        const embed = new EmbedBuilder()
          .setColor(0x1db954)
          .setTitle('🎵 Now Playing')
          .setDescription(`[${songInfo.title}](${songInfo.url})`)
          .addFields(
            { name: 'Duration', value: songInfo.duration || 'Unknown', inline: true },
            { name: 'Requested by', value: songInfo.requestedBy, inline: true }
          )
          .setThumbnail(songInfo.thumbnail || null)
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      } else {
        const embed = new EmbedBuilder()
          .setColor(0x3498db)
          .setTitle('📋 Added to Queue')
          .setDescription(`[${songInfo.title}](${songInfo.url})`)
          .addFields(
            { name: 'Duration', value: songInfo.duration || 'Unknown', inline: true },
            { name: 'Position', value: `#${queue.songs.length}`, inline: true },
            { name: 'Requested by', value: songInfo.requestedBy, inline: true }
          )
          .setThumbnail(songInfo.thumbnail || null)
          .setTimestamp();
        return interaction.editReply({ embeds: [embed] });
      }
    } catch (err) {
      console.error('Play command error:', err);
      return interaction.editReply('❌ An error occurred while trying to play the song. Please try again.');
    }
  },
};

async function playSong(queue, channel, initial = false) {
  if (!queue.songs.length) return;
  const song = queue.songs[0];
  try {
    const stream = await play.stream(song.url, { quality: 2 });
    const resource = createAudioResource(stream.stream, { inputType: stream.type });
    queue.player.play(resource);

    if (!initial) {
      const embed = new EmbedBuilder()
        .setColor(0x1db954)
        .setTitle('🎵 Now Playing')
        .setDescription(`[${song.title}](${song.url})`)
        .addFields(
          { name: 'Duration', value: song.duration || 'Unknown', inline: true },
          { name: 'Requested by', value: song.requestedBy, inline: true }
        )
        .setThumbnail(song.thumbnail || null)
        .setTimestamp();
      channel.send({ embeds: [embed] });
    }
  } catch (err) {
    console.error('Error playing song:', err);
    channel.send(`❌ Error playing **${song.title}**. Skipping...`);
    queue.songs.shift();
    if (queue.songs.length > 0) {
      playSong(queue, channel);
    }
  }
}
