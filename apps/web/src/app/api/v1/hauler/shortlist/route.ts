import { NextResponse } from "next/server";
import { getTalentPoolShortlist } from "@wastehire/core";
import { dbListShortlist, supabaseConfigured } from "@/lib/supabase";

export async function GET() {
  try {
    if (supabaseConfigured()) {
      const rows = await dbListShortlist();
      if (rows) {
        return NextResponse.json({
          candidates: rows.map((r) => ({
            session_id: r.session_id,
            first_name: r.first_name ?? undefined,
            role_interest: r.role_interest || "other",
            cdl_class: r.cdl_class || "none",
            zip: r.zip || "",
            schedule_preference: r.schedule_preference ?? undefined,
            resume_text: r.resume_text ?? undefined,
          })),
          source: "supabase",
        });
      }
    }
  } catch (e) {
    console.error(e);
  }

  return NextResponse.json({
    candidates: getTalentPoolShortlist(),
    source: "memory",
  });
}
