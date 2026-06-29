import { prisma } from "./prisma";
import type { CastleCardData } from "@/components/CastleCard";

/** Active inflatables in display order. Returns [] if the DB is unreachable. */
export async function getActiveInflatables(): Promise<
  (CastleCardData & { id: string; description: string; dimensions: string | null })[]
> {
  try {
    const rows = await prisma.inflatable.findMany({
      where: { active: true },
      orderBy: { sortOrder: "asc" },
    });
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      slug: r.slug,
      theme: r.theme,
      ageSuitability: r.ageSuitability,
      pricePerDay: r.pricePerDay,
      images: r.images,
      description: r.description,
      dimensions: r.dimensions,
    }));
  } catch (e) {
    console.error("getActiveInflatables failed:", e);
    return [];
  }
}

export async function getInflatableBySlug(slug: string) {
  try {
    return await prisma.inflatable.findUnique({ where: { slug } });
  } catch (e) {
    console.error("getInflatableBySlug failed:", e);
    return null;
  }
}
