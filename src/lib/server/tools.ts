/**
 * The actions the AI assistant is allowed to take. Each tool validates its own
 * input, because the AI's arguments are treated like any other untrusted input.
 */
import type { Tool } from "./gemini";
import { LEAD_STATUSES, cleanLead, upsertChatLead } from "./leads";
import type { Availability } from "./settings";

/** Online booking needs the database (that's what prevents double bookings). */
export function bookingEnabled() {
  return false;
}

export function buildTools({
  conversationId,
  channel,
}: {
  conversationId: string;
  channel: "chat" | "voice";
  availability: Availability;
}): Tool[] {
  const saveLead: Tool = {
    name: "save_lead",
    description:
      "Save or update the potential client's details for this conversation. Call it whenever you learn something useful, and again as you learn more. Always include a short summary of what they need.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Their full name" },
        email: { type: "string" },
        phone: { type: "string" },
        business_name: { type: "string" },
        industry: { type: "string", description: "e.g. plumbing, restaurant, salon, retail" },
        service: { type: "string", description: "The service they're interested in" },
        budget: { type: "string", description: "Only if they offered it" },
        requirements: { type: "string", description: "What they want built, in a few sentences" },
        summary: { type: "string", description: "2 to 4 sentence summary of the conversation and their needs" },
        status: { type: "string", enum: LEAD_STATUSES.filter((s) => s !== "meeting_confirmed" && s !== "converted") },
      },
    },
    run: async (args) => {
      const lead = cleanLead(args);
      if (!Object.keys(lead).length) return { saved: false, error: "No usable details were given." };
      const { status } = await upsertChatLead(conversationId, channel, lead);
      return { saved: true, status };
    },
  };

  return [saveLead];
}
