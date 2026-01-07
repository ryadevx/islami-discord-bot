const { checkRateLimit } = require('../utils/rateLimiter');
const Hadith = require('../services/hadith');
const ReminderService = require('../services/reminderService');
const { getPrayerTimes } = require('../services/prayerService');
const config = require('../config/config');

class CommandHandler {
  constructor(client) {
    this.client = client;
    this.hadith = new Hadith();
    
    this.commands = {
      '$wa': this.handleHadithCommand.bind(this),

    };
  }

  async handleMessage(message) {
    const content = message.content.trim();
    
    if (this.commands[content]) {
      try {
        await this.commands[content](message);
      } catch (error) {
        console.error(`eror handling command ${content}:`, error);
        await message.reply('an error occurred while processing your command');
      }
    }
  }

  async handleHadithCommand(message) {
    const userId = message.author.id;

    if (!checkRateLimit(userId)) {
      return message.reply('uve reached the maximum of 10 commands per 2 hours');
    }

    const result = await this.hadith.getRandomHadith();
    
    if (result) {
      const responseMessage = `**Hadith #${result.number || 'N/A'} - ${result.collection || 'Unknown'}**\n\n` +
        `**Arabic:**\n${result.hadith || 'no Arabic text available'}\n\n` +
        `**Translation:**\n${result.translation || 'no translation available'}\n\n` +
        `**Chapter:** ${result.chapter || 'Unknown'}`;
      
      await message.reply(responseMessage);
    } else {
      await message.reply('no hadith found');
    }
  }

  async handlePrayerCommand(message) {
    const times = await getPrayerTimes();
    
    if (times) {
      const prayerMessage = `🕌 **Prayer Times for ${config.CITY}, ${config.COUNTRY}**\n\n` +
        `🌅 **Fajr:** ${times.Fajr}\n` +
        `🌞 **Dhuhr:** ${times.Dhuhr}\n` +
        `🌇 **Asr:** ${times.Asr}\n` +
        `🌆 **Maghrib:** ${times.Maghrib}\n` +
        `🌙 **Isha:** ${times.Isha}`;
      
      await message.reply(prayerMessage);
    } else {
      await message.reply('could not fetch prayer times.');
    }
  }

  async handleTestPrayer(message) {
    const reminderService = new ReminderService(this.client);
    await reminderService.sendPrayerReminder('Fajr', '05:30');
    await message.reply('test prayer reminder sent!');
  }
}

module.exports = CommandHandler;
