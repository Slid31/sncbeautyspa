import { prisma } from "@/lib/prisma";
import { sendIntakeReminderEmail } from "@/lib/email";

export type IntakeReminderResult = {
  total: number;
  processed: number;
  failed: string[];
};

export async function runIntakeReminder(): Promise<IntakeReminderResult> {
  const now = new Date();
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const in48h = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const appointments = await prisma.appointment.findMany({
    where: {
      status: "CONFIRMED",
      intakeFormToken: { not: null },
      intakeFormCompletedAt: null,
      date: { gte: in24h, lte: in48h },
      intakeFormTokenExpiresAt: { gt: now },
    },
    select: {
      id: true,
      date: true,
      locale: true,
      intakeFormToken: true,
      intakeFormTokenExpiresAt: true,
      client: { select: { firstName: true, email: true } },
      services: {
        select: {
          service: { select: { name: true, duration: true } },
        },
      },
    },
  });

  console.log(`[intake-reminder] Found ${appointments.length} appointment(s) needing reminder`);

  let processed = 0;
  const failed: string[] = [];

  for (const appt of appointments) {
    try {
      await sendIntakeReminderEmail({
        clientFirstName: appt.client.firstName,
        clientEmail: appt.client.email,
        appointmentDate: appt.date,
        services: appt.services.map((s) => ({
          name: s.service.name,
          duration: s.service.duration,
        })),
        intakeFormToken: appt.intakeFormToken!,
        intakeFormTokenExpiresAt: appt.intakeFormTokenExpiresAt!,
        locale: appt.locale,
      });

      processed++;
      console.log(`[intake-reminder] Sent reminder for appointment ${appt.id}`);
    } catch (e) {
      console.error(`[intake-reminder] Failed for appointment ${appt.id}:`, e);
      failed.push(appt.id);
    }
  }

  return { total: appointments.length, processed, failed };
}
