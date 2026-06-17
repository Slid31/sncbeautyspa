export async function register() {
  // node-cron is a Node.js-only package; never run in the Edge runtime.
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { startCronJobs } = await import("./lib/cron/scheduler");
    startCronJobs();
  }
}
