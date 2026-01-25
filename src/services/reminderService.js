const cron = require('node-cron');
const config = require('../config/config');
const { getPrayerTimes } = require('./prayerService');

class ReminderService {
  constructor(client) {
    this.client = client;
    this.scheduledJobs = [];
    this.dailyResetJob = null;
  }

  async setupPrayerReminders() {
    const times = await getPrayerTimes();

    // ❌ Do NOT clear jobs if API failed
    if (!times) {
      console.error('❌ Prayer times unavailable, keeping existing schedule');
      return;
    }

    this.clearJobs();

    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

    prayers.forEach((prayer) => {
      const time = times[prayer];
      if (time) {
        this.schedulePrayerReminder(prayer, time);
      }
    });

    this.scheduleDailyReset();

    console.log('✅ Prayer reminders scheduled');
  }

  schedulePrayerReminder(prayer, time) {
    const [hours, minutes] = time.split(':').map(Number);
    const cronExpression = `${minutes} ${hours} * * *`;

    const job = cron.schedule(
      cronExpression,
      async () => {
        await this.sendPrayerReminder(prayer, time);
      },
      {
        timezone: config.TIMEZONE || 'Africa/Algiers',
        scheduled: true,
      }
    );

    this.scheduledJobs.push(job);
    console.log(`⏰ ${prayer} scheduled at ${time}`);
  }

  async sendPrayerReminder(prayer, time) {
    try {
      const channel = this.client.channels.cache.get(config.CHANNEL_ID);
      if (!channel) {
        console.error('❌ Channel not found');
        return;
      }

      await channel.send(`🕌 It's time for **${prayer}** prayer (${time})`);
      console.log(`📢 Sent ${prayer} reminder`);
    } catch (err) {
      console.error('❌ Error sending reminder:', err.message);
    }
  }

  scheduleDailyReset() {
    // ✅ Prevent duplicate midnight cron jobs
    if (this.dailyResetJob) return;

    this.dailyResetJob = cron.schedule(
      '0 0 * * *',
      async () => {
        console.log('🌙 Midnight: refreshing prayer schedule');
        await this.setupPrayerReminders();
      },
      {
        timezone: config.TIMEZONE || 'Africa/Algiers',
        scheduled: true,
      }
    );
  }

  clearJobs() {
    this.scheduledJobs.forEach((job) => job.stop());
    this.scheduledJobs = [];
  }
}

module.exports = ReminderService;
