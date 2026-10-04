import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const electronics = await prisma.category.upsert({
    where: { slug: "electronics" },
    update: {},
    create: { slug: "electronics", nameEn: "Electronics", nameAr: "إلكترونيات" },
  });

  const home = await prisma.category.upsert({
    where: { slug: "home" },
    update: {},
    create: { slug: "home", nameEn: "Home & Kitchen", nameAr: "المنزل والمطبخ" },
  });

  for (let i = 1; i <= 20; i++) {
    await prisma.product.upsert({
      where: { slug: `demo-product-${i}` },
      update: {},
      create: {
        slug: `demo-product-${i}`,
        nameEn: `Demo Product ${i}`,
        nameAr: `منتج تجريبي ${i}`,
        description: `This is demo product number ${i}.`,
        price: (Math.random() * 50 + 5).toFixed(3),
        stock: 50,
        images: [`https://picsum.photos/seed/p${i}/600/600`],
        categoryId: i % 2 === 0 ? electronics.id : home.id,
      },
    });
  }

  console.log("Seed done ✅");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });