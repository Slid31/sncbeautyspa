import { NextRequest, NextResponse } from "next/server";
import { runIntakeReminder } from "@/lib/cron/intake-reminder";

// Manual trigger for testing or external schedulers.
// Requires: Authorization: Bearer {CRON_SECRET}

export async function GET(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = req.headers.get("authorization");

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const ts = new Date().toISOString();
  console.log(`[CRON] intake-reminder manual trigger at ${ts}`);

  const result = await runIntakeReminder();

  console.log(
    `[CRON] intake-reminder finished — sent: ${result.processed}/${result.total}` +
      (result.failed.length > 0 ? `, failed: ${result.failed.join(", ")}` : "")
  );

  return NextResponse.json({ ok: true, ...result });
}
