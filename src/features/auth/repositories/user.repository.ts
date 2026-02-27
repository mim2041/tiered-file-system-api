import { prisma } from "@/config/prisma.config";

export const userRepository = {
  findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  createUser(data: { email: string; name: string; passwordHash: string }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email,
          name: data.name,
          passwordHash: data.passwordHash,
          role: "USER",
          isVerified: false,
        },
      });

      await tx.userQuota.create({
        data: {
          userId: user.id,
        },
      });

      return user;
    });
  },
};

