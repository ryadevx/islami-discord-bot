require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./src/config/config');
const ReminderService = require('./src/services/reminderService');
const CommandHandler = require('./src/handlers/commandHandler');
const { initRedis } = require('./redis');

(async () => {
  await initRedis();
})();

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

  console.log('✅ Bot is ready and prayer reminders are active!');
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  await commandHandler.handleMessage(message);
});

client.login(config.DISCORD_TOKEN);
