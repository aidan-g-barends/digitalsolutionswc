/**
 * GET /api/admin/overview: headline numbers for the dashboard, plus which
 * integrations are configured (so you can see at a glance what still needs setting up).
 */
import { requireAdmin } from "@/lib/server/auth";
import { db, dbEnabled } from "@/lib/server/db";
import { aiEnabled } from "@/lib/server/gemini";
import { calendarEnabled } from "@/lib/server/google";
import { canEmailCustomers } from "@/lib/server/email";

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;

  const setup = {
    ai: aiEnabled(),
    database: dbEnabled(),
    email: Boolean(process.env.RESEND_API_KEY),
    customerEmails: canEmailCustomers(),
    calendar: calendarEnabled(),
  };
  if (!dbEnabled()) return Response.json({ setup, stats: null });

  const since = new Date(Date.now() - 30 * 86_400_000).toISOString();
  const [leads, conversations, upcoming] = await Promise.all([
    db<{ status: string; source: string; created_at: string }[]>("leads?select=status,source,created_at"),
    db<{ lead_id: string | null; channel: string }[]>(`conversations?select=lead_id,channel&started_at=gte.${encodeURIComponent(since)}`),
    db<{ id: string }[]>(`bookings?select=id&status=eq.confirmed&starts_at=gte.${encodeURIComponent(new Date().toISOString())}`),
  ]);

  const byStatus: Record<string, number> = {};
  for (const l of leads) byStatus[l.status] = (byStatus[l.status] ?? 0) + 1;
  const recent = leads.filter((l) => l.created_at >= since);
  const chatsWithLead = conversations.filter((c) => c.lead_id).length;

  return Response.json({
    setup,
    stats: {
      totalLeads: leads.length,
      leads30: recent.length,
      bySource30: {
        chat: recent.filter((l) => l.source === "chat").length,
        voice: recent.filter((l) => l.source === "voice").length,
        form: recent.filter((l) => l.source === "form").length,
      },
      byStatus,
      conversations30: conversations.length,
      voiceConversations30: conversations.filter((c) => c.channel === "voice").length,
      // Share of AI conversations (last 30 days) that produced a lead.
      chatConversion30: conversations.length ? Math.round((chatsWithLead / conversations.length) * 100) : 0,
      upcomingMeetings: upcoming.length,
      converted: byStatus.converted ?? 0,
    },
  });
}
