import { menuItems } from "@/lib/menu";
export function GET() { return Response.json({ data: menuItems }); }
