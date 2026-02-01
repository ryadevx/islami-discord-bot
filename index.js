require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/config/config');
const { initRedis } = require('./src/config/redis');
const ReminderService = require('./src/services/reminderService');
const CommandHandler = require('./src/handlers/commandHandler');

(async () => {
  await initRedis();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const commandHandler = new CommandHandler(client);

  client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    const reminderService = new ReminderService(client);
    await reminderService.setupPrayerReminders();

    console.log('✅ Bot is fully ready');
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    await commandHandler.handleMessage(message);
  });

  client.login(config.DISCORD_TOKEN);
})();
