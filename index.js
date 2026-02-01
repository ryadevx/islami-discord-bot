require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const { initRedis } = require('./src/config/redis');

(async () => {
  await initRedis();

  const client = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
    ],
  });

  const ReminderService = require('./src/services/reminderService');
  const CommandHandler = require('./src/handlers/commandHandler');
  const commandHandler = new CommandHandler(client);

  client.once('ready', async () => {
    console.log(`🤖 Logged in as ${client.user.tag}`);

    const reminderService = new ReminderService(client);
    await reminderService.setupPrayerReminders();
  });

  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    await commandHandler.handleMessage(message);
  });

  client.login(process.env.DISCORD_TOKEN);
})();
