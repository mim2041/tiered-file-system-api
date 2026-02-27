import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Seed logic (admin user, packages, etc.) will be implemented in later milestones.
  console.log("No seed data yet. Seed will be added with core features.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

