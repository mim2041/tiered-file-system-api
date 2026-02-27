import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/config/env-config";

const prisma = new PrismaClient();

const basePackages = [
  {
    name: "Free",
    slug: "free",
    description: "Starter plan for trying the system",
    maxFolders: 10,
    maxNestingLevel: 2,
    maxFileSizeMb: 10,
    totalFileLimit: 100,
    filesPerFolderLimit: 25,
    mimeTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  {
    name: "Silver",
    slug: "silver",
    description: "Personal use plan",
    maxFolders: 50,
    maxNestingLevel: 4,
    maxFileSizeMb: 50,
    totalFileLimit: 1000,
    filesPerFolderLimit: 100,
    mimeTypes: ["image/jpeg", "image/png", "application/pdf", "video/mp4", "audio/mpeg"],
  },
  {
    name: "Gold",
    slug: "gold",
    description: "Professional plan",
    maxFolders: 200,
    maxNestingLevel: 8,
    maxFileSizeMb: 200,
    totalFileLimit: 5000,
    filesPerFolderLimit: 500,
    mimeTypes: ["image/jpeg", "image/png", "application/pdf", "video/mp4", "audio/mpeg"],
  },
  {
    name: "Diamond",
    slug: "diamond",
    description: "High-volume team plan",
    maxFolders: 1000,
    maxNestingLevel: 15,
    maxFileSizeMb: 1024,
    totalFileLimit: 50000,
    filesPerFolderLimit: 2000,
    mimeTypes: ["image/jpeg", "image/png", "application/pdf", "video/mp4", "audio/mpeg"],
  },
];

async function main() {
  // 1) Upsert default admin user
  const email = env.defaultAdmin.email.toLowerCase();
  const passwordHash = await bcrypt.hash(env.defaultAdmin.password, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "System Admin",
      passwordHash,
      role: "ADMIN",
      isVerified: true,
    },
  });

  // Ensure admin has a quota row
  await prisma.userQuota.upsert({
    where: { userId: admin.id },
    update: {},
    create: {
      userId: admin.id,
    },
  });

  // 2) Seed subscription packages if missing
  for (const pkg of basePackages) {
    const existing = await prisma.subscriptionPackage.findUnique({
      where: { slug: pkg.slug },
      include: { allowedFileTypes: true },
    });

    if (!existing) {
      await prisma.subscriptionPackage.create({
        data: {
          name: pkg.name,
          slug: pkg.slug,
          description: pkg.description,
          maxFolders: pkg.maxFolders,
          maxNestingLevel: pkg.maxNestingLevel,
          maxFileSizeMb: pkg.maxFileSizeMb,
          totalFileLimit: pkg.totalFileLimit,
          filesPerFolderLimit: pkg.filesPerFolderLimit,
          allowedFileTypes: {
            createMany: {
              data: pkg.mimeTypes.map((mimeType) => ({ mimeType })),
            },
          },
        },
      });
    }
  }

  console.log("✅ Seed complete.");
  console.log(`   Admin email: ${admin.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });