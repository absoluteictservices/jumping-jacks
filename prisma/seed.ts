import { PrismaClient } from "@prisma/client";
import { CATALOGUE, CANCELLATION_POLICY } from "../src/lib/catalogue";

const prisma = new PrismaClient();

async function main() {
  await prisma.settings.upsert({
    where: { id: "singleton" },
    update: {},
    create: {
      id: "singleton",
      maxDeliveriesPerDay: 1,
      minLeadTimeDays: 1,
      deliveryPostcodePrefixes: ["LS"],
      companyEmail: "info@jumpingjacksleeds.co.uk",
      companyPhone: "07769781666",
      holdMinutes: 15,
      cancellationPolicy: CANCELLATION_POLICY,
    },
  });

  for (const inf of CATALOGUE) {
    await prisma.inflatable.upsert({
      where: { slug: inf.slug },
      update: {
        name: inf.name,
        description: inf.description,
        theme: inf.theme,
        dimensions: inf.dimensions,
        ageSuitability: inf.ageSuitability,
        pricePerDay: inf.pricePerDay,
        images: inf.images,
        sortOrder: inf.sortOrder,
      },
      create: inf,
    });
  }

  console.log("Seed complete:", CATALOGUE.length, "inflatables + settings.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
