import { prisma } from "./prisma";

export const DEFAULT_SETTINGS = {
  id: "singleton",
  maxDeliveriesPerDay: 1,
  minLeadTimeDays: 1,
  deliveryPostcodePrefixes: ["LS"] as string[],
  companyEmail: "info@jumpingjacksleeds.co.uk",
  companyPhone: "07769781666",
  holdMinutes: 15,
  cancellationPolicy: "",
};

export type AppSettings = typeof DEFAULT_SETTINGS;

/** Always returns a settings row, creating the singleton with defaults if missing. */
export async function getSettings(): Promise<AppSettings> {
  const existing = await prisma.settings.findUnique({ where: { id: "singleton" } });
  if (existing) return existing as unknown as AppSettings;
  const created = await prisma.settings.create({ data: { id: "singleton" } });
  return created as unknown as AppSettings;
}
