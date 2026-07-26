import { LocalNotifications } from '@capacitor/local-notifications';

export async function requestNotificationPermission() {
  try {
    const status = await LocalNotifications.requestPermissions();
    return status.display === 'granted';
  } catch (err) {
    console.warn('[Notifications] Native plugin not available (web mode):', err);
    return false;
  }
}

export async function scheduleStreakReminder() {
  try {
    const granted = await requestNotificationPermission();
    if (!granted) return;

    // Clear existing
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel(pending);
    }

    // Schedule 8 PM streak reminder
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(20, 0, 0, 0);

    if (now.getTime() > notificationTime.getTime()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    // Register notification action types for interactive shade buttons
    await LocalNotifications.registerActionTypes({
      types: [
        {
          id: 'STREAK_ACTIONS',
          actions: [
            { id: 'MARK_DONE', title: '✅ Mark Completed' },
            { id: 'SNOOZE', title: '⏰ Snooze 15m' },
          ],
        },
      ],
    });

    await LocalNotifications.schedule({
      notifications: [
        {
          title: "⚠️ Streak at Risk!",
          body: "Don't break your chain today! Complete 1 focus session before midnight.",
          id: 1,
          schedule: { at: notificationTime, repeats: true, every: 'day' },
          actionTypeId: 'STREAK_ACTIONS',
        },
        {
          title: "🌅 Morning Battle Plan Ready",
          body: "Your daily focus targets are waiting. Let's crush today!",
          id: 2,
          schedule: { 
            at: new Date(notificationTime.getTime() - 11 * 60 * 60 * 1000), // 9 AM
            repeats: true, 
            every: 'day' 
          },
          actionTypeId: 'STREAK_ACTIONS',
        }
      ],
    });
    console.log('[Notifications] Scheduled daily reminders with interactive actions');
  } catch (err) {
    console.warn('[Notifications] Notification scheduling error:', err);
  }
}
