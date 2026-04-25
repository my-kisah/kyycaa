import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaClient, ActivityStatus, Role } from "@prisma/client";
import slugify from "slugify";

const prisma = new PrismaClient();

async function main() {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "Admin12345!";
  const passwordHash = await hash(adminPassword, 12);

  for (const [index, email] of adminEmails.entries()) {
    const adminUsername = index === 0 ? "admin" : `admin${index + 1}`;

    await prisma.user.upsert({
      where: { email },
      update: {
        role: Role.ADMIN,
        passwordHash,
        name: "Website Owner",
        username: adminUsername,
      },
      create: {
        email,
        name: "Website Owner",
        username: adminUsername,
        role: Role.ADMIN,
        passwordHash,
      },
    });
  }

  const demoUser = await prisma.user.upsert({
    where: { email: "user@ceritakita.id" },
    update: {},
    create: {
      email: "user@ceritakita.id",
      name: "Alya Prameswari",
      username: "alya",
      role: Role.USER,
      passwordHash: await hash("User12345!", 12),
      image:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
    },
  });

  const firstAdmin =
    adminEmails[0] ??
    "admin@ceritakita.id";

  const admin = await prisma.user.upsert({
    where: { email: firstAdmin },
    update: { role: Role.ADMIN, passwordHash },
    create: {
      email: firstAdmin,
      name: "Website Owner",
      username: "admin",
      role: Role.ADMIN,
      passwordHash,
    },
  });

  const entries = [
    {
      title: "Malam Pertama di Bawah Lampu Kota",
      excerpt:
        "Catatan kecil tentang perjalanan sore, tawa panjang, dan lampu-lampu kota yang terasa hangat.",
      description:
        "Kami berjalan perlahan di trotoar yang masih lembap setelah hujan. Lampu kota memantul di jalan, kopi masih hangat di tangan, dan obrolan sederhana terasa seperti rumah. Momen kecil seperti ini yang ingin disimpan lebih lama, karena ternyata kebahagiaan tidak selalu datang dengan suara besar.",
      imageUrl:
        "https://images.unsplash.com/photo-1516589091380-5d8e87df6999?auto=format&fit=crop&w=1400&q=80",
      imagePath: "seed/malam-pertama",
      date: new Date("2026-02-14T19:30:00.000Z"),
      category: "Date Night",
      tags: "romantis, kota, kopi",
      status: ActivityStatus.ACTIVE,
      views: 132,
      commentsCount: 2,
    },
    {
      title: "Sarapan Minggu dan Bunga Kecil",
      excerpt:
        "Pagi yang tenang, meja kayu, dan bunga kecil yang membuat akhir pekan terasa lebih manis.",
      description:
        "Sarapan sederhana berubah menjadi kenangan yang sulit dilupakan karena ada perhatian kecil di setiap detailnya. Roti panggang, teh hangat, dan satu tangkai bunga di tengah meja membuat suasana terasa istimewa tanpa perlu berlebihan.",
      imageUrl:
        "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?auto=format&fit=crop&w=1400&q=80",
      imagePath: "seed/sarapan-minggu",
      date: new Date("2026-03-02T08:15:00.000Z"),
      category: "Weekend",
      tags: "sarapan, bunga, weekend",
      status: ActivityStatus.ACTIVE,
      views: 96,
      commentsCount: 1,
    },
    {
      title: "Surat yang Disimpan di Laci",
      excerpt:
        "Cerita tentang surat pendek yang dibaca berulang-ulang setiap rindu datang diam-diam.",
      description:
        "Tidak semua kenangan harus dibagikan pada semua orang. Ada juga momen yang tetap lembut ketika disimpan. Surat pendek itu hanya berisi beberapa kalimat, tetapi cukup untuk membuat hari yang melelahkan terasa lebih ringan.",
      imageUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1400&q=80",
      imagePath: "seed/surat-laci",
      date: new Date("2026-03-12T14:00:00.000Z"),
      category: "Letters",
      tags: "surat, rindu, cerita",
      status: ActivityStatus.HIDDEN,
      views: 54,
      commentsCount: 0,
    },
  ];

  for (const entry of entries) {
    const activity = await prisma.activity.upsert({
      where: { slug: slugify(entry.title, { lower: true, strict: true }) },
      update: {
        ...entry,
        createdById: admin.id,
      },
      create: {
        ...entry,
        slug: slugify(entry.title, { lower: true, strict: true }),
        createdById: admin.id,
      },
    });

    if (entry.commentsCount > 0) {
      await prisma.comment.deleteMany({
        where: { contentId: activity.id },
      });

      await prisma.comment.createMany({
        data: [
          {
            contentId: activity.id,
            userId: demoUser.id,
            userName: demoUser.name,
            userPhoto: demoUser.image,
            commentText: "Hal-hal sederhana seperti ini justru paling membekas. Manis sekali.",
          },
          {
            contentId: activity.id,
            userId: demoUser.id,
            userName: demoUser.name,
            userPhoto: demoUser.image,
            commentText: "Saya suka sekali nuansanya. Hangat dan elegan.",
          },
        ].slice(0, entry.commentsCount),
      });
    }
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
