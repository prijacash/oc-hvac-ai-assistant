import { connection } from "next/server";
import { statusPayload } from "@/lib/ai/config";

export async function GET() {
  await connection();
  return Response.json(statusPayload());
}
