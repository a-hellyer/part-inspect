import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  const existing = await prisma.company.findUnique({
    where: { slug: "acme-manufacturing" },
  });
  if (existing) {
    console.log("Demo data already exists — skipping seed");
    return;
  }

  const passwordHash = await bcrypt.hash("demo12345", 12);

  const company = await prisma.company.create({
    data: {
      name: "Acme Manufacturing",
      slug: "acme-manufacturing",
      users: {
        create: {
          email: "demo@acme.com",
          name: "Alex Inspector",
          passwordHash,
          role: "ADMIN",
        },
      },
      rejectCodes: {
        createMany: {
          data: [
            { code: "SCR", description: "Surface scratch", color: "#f97316" },
            { code: "DIM", description: "Dimensional out of spec", color: "#ef4444" },
            { code: "POR", description: "Porosity / void", color: "#8b5cf6" },
            { code: "BUR", description: "Burrs or sharp edges", color: "#eab308" },
          ],
        },
      },
    },
    include: { users: true, rejectCodes: true },
  });

  const part = await prisma.part.create({
    data: {
      companyId: company.id,
      name: "Bracket Assembly A-42",
      description:
        "Aluminum bracket for motor mount — inspect all mounting surfaces",
      imageUrl:
        "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80",
      modelType: "IMAGE",
    },
  });

  const batch = await prisma.batch.create({
    data: {
      companyId: company.id,
      partId: part.id,
      name: "Lot 2026-0815-A",
      quantity: 8,
      units: {
        create: Array.from({ length: 8 }, (_, i) => ({
          serialNumber: i + 1,
          status: i === 2 || i === 5 ? "REJECTED" : "GOOD",
        })),
      },
    },
    include: { units: true },
  });

  const scr = company.rejectCodes.find((c) => c.code === "SCR")!;
  const dim = company.rejectCodes.find((c) => c.code === "DIM")!;

  await prisma.reject.createMany({
    data: [
      {
        partUnitId: batch.units[2].id,
        rejectCodeId: scr.id,
        x: 0.35,
        y: 0.42,
        notes: "Light scratch on mounting face",
        createdById: company.users[0].id,
      },
      {
        partUnitId: batch.units[2].id,
        rejectCodeId: dim.id,
        x: 0.68,
        y: 0.55,
        notes: "Hole diameter +0.02mm",
        createdById: company.users[0].id,
      },
      {
        partUnitId: batch.units[5].id,
        rejectCodeId: scr.id,
        x: 0.52,
        y: 0.28,
        createdById: company.users[0].id,
      },
    ],
  });

  console.log("Demo data seeded!");
  console.log("  Login: demo@acme.com / demo12345");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
