import { prisma } from "@/config/prisma.config";

export const userRepository = {
  findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

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

  markVerified(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  },

  updatePasswordHash(userId: string, passwordHash: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  createEmailVerificationToken(data: { userId: string; token: string; expiresAt: Date }) {
    return prisma.emailVerificationToken.create({
      data,
    });
  },

  findEmailVerificationToken(token: string) {
    return prisma.emailVerificationToken.findUnique({
      where: { token },
    });
  },

  deleteEmailVerificationToken(id: string) {
    return prisma.emailVerificationToken.delete({
      where: { id },
    });
  },

  deleteEmailVerificationTokensByUserId(userId: string) {
    return prisma.emailVerificationToken.deleteMany({
      where: { userId },
    });
  },

  createPasswordResetToken(data: { userId: string; token: string; expiresAt: Date }) {
    return prisma.passwordResetToken.create({
      data,
    });
  },

  findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
    });
  },

  deletePasswordResetToken(id: string) {
    return prisma.passwordResetToken.delete({
      where: { id },
    });
  },

  deletePasswordResetTokensByUserId(userId: string) {
    return prisma.passwordResetToken.deleteMany({
      where: { userId },
    });
  },
};

