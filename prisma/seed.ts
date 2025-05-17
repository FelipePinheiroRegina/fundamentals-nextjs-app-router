import { PrismaClient } from "@/generated/prisma";
import {
  users,
  customers,
  invoices,
  revenue,
} from "@/app/lib/placeholder-data";
import { hash } from "bcryptjs";
const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.revenue.deleteMany();

  const hashedUsers = await Promise.all(
    users.map(async (user) => ({
      ...user,
      password: await hash(user.password, 6),
    }))
  );

  const userSeed = hashedUsers.map((user) =>
    prisma.user.create({
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password,
      },
    })
  );

  const customerSeed = customers.map((customer) => {
    return prisma.customer.create({
      data: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image_url: customer.image_url,
      },
    });
  });

  const invoiceSeed = invoices.map((invoice) => {
    return prisma.invoice.create({
      data: {
        customer_id: invoice.customer_id,
        amount: invoice.amount,
        status: invoice.status,
        date: new Date(invoice.date),
      },
    });
  });

  const revenueSeed = revenue.map((revenue) => {
    return prisma.revenue.create({
      data: {
        month: revenue.month,
        revenue: revenue.revenue,
      },
    });
  });

  await prisma.$transaction([
    ...userSeed,
    ...customerSeed,
    ...invoiceSeed,
    ...revenueSeed,
  ]);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
