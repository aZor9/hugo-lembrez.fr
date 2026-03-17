import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis pour exécuter le seed.");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    update: { password: hashedPassword },
    create: {
      email,
      password: hashedPassword,
    },
  });

  const existingProfile = await prisma.profile.findFirst();
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        name: "Hugo Lembrez",
        title: "Développeur Full-Stack",
        bio: "Passionné par le développement web moderne et les technologies innovantes. Je crée des applications performantes et élégantes en utilisant les dernières technologies.",
      },
    });
  }

  console.log("✅ Seed terminé avec succès !");
  console.log(`   Email: ${email}`);
  console.log("   Mot de passe: (non affiché pour des raisons de sécurité)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
