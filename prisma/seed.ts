import { loadEnvConfig } from "@next/env";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

loadEnvConfig(process.cwd());

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

  const settings = await prisma.homeSectionSettings.findUnique({
    where: { key: "home" },
  });

  if (!settings) {
    await prisma.homeSectionSettings.create({
      data: {
        key: "home",
      },
    });
  }

  const categoriesCount = await prisma.stackCategory.count();
  if (categoriesCount === 0) {
    const categories = await Promise.all([
      prisma.stackCategory.create({ data: { name: "Langages de programmation", order: 0 } }),
      prisma.stackCategory.create({ data: { name: "Frameworks", order: 1 } }),
      prisma.stackCategory.create({ data: { name: "Bases de données", order: 2 } }),
      prisma.stackCategory.create({ data: { name: "Outils de développement", order: 3 } }),
    ]);

    const byName = new Map(categories.map((c) => [c.name, c.id]));

    const stackDefaults: Array<{ techId: string; label: string; category: string }> = [
      { techId: "html", label: "HTML", category: "Langages de programmation" },
      { techId: "css", label: "CSS", category: "Langages de programmation" },
      { techId: "javascript", label: "JavaScript", category: "Langages de programmation" },
      { techId: "typescript", label: "TypeScript", category: "Langages de programmation" },
      { techId: "php", label: "PHP", category: "Langages de programmation" },
      { techId: "python", label: "Python", category: "Langages de programmation" },
      { techId: "csharp", label: "C#", category: "Langages de programmation" },
      { techId: "react", label: "React", category: "Frameworks" },
      { techId: "nextjs", label: "Next.js", category: "Frameworks" },
      { techId: "vue", label: "Vue.js", category: "Frameworks" },
      { techId: "angular", label: "Angular", category: "Frameworks" },
      { techId: "tailwind", label: "Tailwind CSS", category: "Frameworks" },
      { techId: "bootstrap", label: "Bootstrap", category: "Frameworks" },
      { techId: "vite", label: "Vite", category: "Frameworks" },
      { techId: "express", label: "Express", category: "Frameworks" },
      { techId: "nestjs", label: "NestJS", category: "Frameworks" },
      { techId: "laravel", label: "Laravel", category: "Frameworks" },
      { techId: "django", label: "Django", category: "Frameworks" },
      { techId: "symfony", label: "Symfony", category: "Frameworks" },
      { techId: "prisma", label: "Prisma", category: "Frameworks" },
      { techId: "graphql", label: "GraphQL", category: "Frameworks" },
      { techId: "mysql", label: "MySQL", category: "Bases de données" },
      { techId: "postgresql", label: "PostgreSQL", category: "Bases de données" },
      { techId: "mongodb", label: "MongoDB", category: "Bases de données" },
      { techId: "redis", label: "Redis", category: "Bases de données" },
      { techId: "supabase", label: "Supabase", category: "Bases de données" },
      { techId: "git", label: "Git", category: "Outils de développement" },
      { techId: "github", label: "GitHub", category: "Outils de développement" },
      { techId: "gitlab", label: "GitLab", category: "Outils de développement" },
      { techId: "docker", label: "Docker", category: "Outils de développement" },
      { techId: "linux", label: "Linux", category: "Outils de développement" },
      { techId: "aws", label: "AWS", category: "Outils de développement" },
      { techId: "azure", label: "Azure", category: "Outils de développement" },
      { techId: "vercel", label: "Vercel", category: "Outils de développement" },
      { techId: "npm", label: "NPM", category: "Outils de développement" },
      { techId: "pnpm", label: "pnpm", category: "Outils de développement" },
      { techId: "yarn", label: "Yarn", category: "Outils de développement" },
      { techId: "kubernetes", label: "Kubernetes", category: "Outils de développement" },
      { techId: "postman", label: "Postman", category: "Outils de développement" },
      { techId: "insomnia", label: "Insomnia", category: "Outils de développement" },
      { techId: "playwright", label: "Playwright", category: "Outils de développement" },
      { techId: "jest", label: "Jest", category: "Outils de développement" },
      { techId: "bun", label: "Bun", category: "Outils de développement" },
      { techId: "figma", label: "Figma", category: "Outils de développement" },
      { techId: "dotnet", label: ".NET", category: "Outils de développement" },
    ];

    await Promise.all(
      stackDefaults.map((item, index) =>
        prisma.stackItem.create({
          data: {
            techId: item.techId,
            label: item.label,
            categoryId: byName.get(item.category)!,
            order: index,
          },
        })
      )
    );
  }

  const educationCount = await prisma.educationItem.count();
  if (educationCount === 0) {
    await Promise.all([
      prisma.educationItem.create({
        data: {
          title: "Baccalauréat (NSI, Mathématiques et option mathématiques expertes",
          school: "Lycée Clémenceau, Montpellier",
          period: "2020 - 2023",
          statusLabel: "Obtenu",
          order: 0,
        },
      }),
      prisma.educationItem.create({
        data: {
          title: "Baccalauréat STI2D SIN",
          school: "Lycée Clémenceau, Montpellier",
          period: "2023",
          statusLabel: "Obtenu",
          order: 1,
        },
      }),
    ]);
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
