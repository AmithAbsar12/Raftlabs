import { MenuExperience } from "@/components/menu-experience";
import { menuItems } from "@/lib/menu";

export default function Home() {
  return <MenuExperience items={menuItems} />;
}
