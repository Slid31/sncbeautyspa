import { schedule, validate } from "node-cron";
import { runIntakeReminder } from "./intake-reminder";

// Persist started state across Next.js hot reloads in development.
const g = global as typeof globalThis & { __cronStarted?: boolean };

export function startCronJobs(): void {
  if (g.__cronStarted) {
    console.log("[CRON] Jobs already registered — skipping duplicate init");
    return;
  }
  g.__cronStarted = true;

  const defaultSchedule = "0 9 * * *";
  const rawSchedule = process.env.CRON_REMINDER_TIME ?? defaultSchedule;

  if (!validate(rawSchedule)) {
    console.error(
      `[CRON] Invalid CRON_REMINDER_TIME value "${rawSchedule}" — falling back to "${defaultSchedule}"`
    );
  }

  const cronSchedule = validate(rawSchedule) ? rawSchedule : defaultSchedule;

  console.log(`[CRON] Registering intake-reminder job with schedule "${cronSchedule}"`);

  schedule(cronSchedule, async () => {
    const ts = new Date().toISOString();
    console.log(`[CRON] intake-reminder started at ${ts}`);

    try {
      const result = await runIntakeReminder();

      console.log(
        `[CRON] intake-reminder finished — sent: ${result.processed}/${result.total}` +
          (result.failed.length > 0 ? `, failed: ${result.failed.join(", ")}` : "")
      );
    } catch (e) {
      console.error("[CRON] intake-reminder threw an unexpected error:", e);
    }
  });

  console.log("[CRON] All jobs registered");
}
