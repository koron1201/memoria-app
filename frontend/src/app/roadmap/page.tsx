import { redirect } from "next/navigation";
import { DEFAULT_ROADMAP_HREF } from "@/lib/app-paths";

export default function RoadmapIndexPage() {
  redirect(DEFAULT_ROADMAP_HREF);
}
