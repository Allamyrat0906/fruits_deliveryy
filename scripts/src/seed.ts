import { db, usersTable, fruitsTable } from "@workspace/db";
import bcrypt from "bcryptjs";

const fruits = [
  {
    name: "Яблоко Голден",
    slug: "yabloko-golden",
    description: "Сочные золотистые яблоки с нежным сладким вкусом. Выращены в Краснодарском крае.",
    price: 89,
    discountPrice: 69,
    stock: 150,
    category: "МЕСТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1570913149827-d2ac84ab3f9a?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Груша Конференция",
    slug: "grusa-konferencia",
    description: "Нежные сочные груши с тонким ароматом. Идеально подходят для десертов и свежего употребления.",
    price: 129,
    stock: 80,
    category: "МЕСТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1550828520-4cb496926fc9?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Клубника садовая",
    slug: "klubnika-sadovaya",
    description: "Ароматная садовая клубника, собранная вручную. Богата витамином C и антиоксидантами.",
    price: 249,
    discountPrice: 199,
    stock: 50,
    category: "МЕСТНЫЕ" as const,
    organic: true,
    imageUrl: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1543528176-61b239494933?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Банан Chiquita",
    slug: "banan-chiquita",
    description: "Спелые бананы из Эквадора. Богаты калием и натуральными сахарами для быстрой энергии.",
    price: 79,
    stock: 200,
    category: "ИМПОРТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Манго Альфонсо",
    slug: "mango-alfons",
    description: "Знаменитое манго сорта Альфонсо из Индии. Нежная мякоть с неповторимым тропическим ароматом.",
    price: 399,
    discountPrice: 329,
    stock: 40,
    category: "ТРОПИЧЕСКИЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Ананас свежий",
    slug: "ananas-svezhiy",
    description: "Сочные ананасы из Коста-Рики. Содержат бромелайн — натуральный фермент для пищеварения.",
    price: 299,
    stock: 60,
    category: "ТРОПИЧЕСКИЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1589820296156-2454bb8a6ad1?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Авокадо Хасс",
    slug: "avokado-hass",
    description: "Спелые авокадо сорта Хасс. Богаты полезными жирами, витаминами E и K.",
    price: 189,
    stock: 70,
    category: "ИМПОРТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Апельсин Навелина",
    slug: "apelsin-navelina",
    description: "Сладкие апельсины из Испании. Отличный источник витамина C. Сочные и ароматные.",
    price: 119,
    discountPrice: 89,
    stock: 120,
    category: "ИМПОРТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1547514701-42782101795e?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Виноград Кишмиш",
    slug: "vinograd-kishmish",
    description: "Сладкий виноград без косточек сорта Кишмиш. Выращен в Дагестане без применения пестицидов.",
    price: 279,
    stock: 45,
    category: "МЕСТНЫЕ" as const,
    organic: true,
    imageUrl: "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Киви зеленый",
    slug: "kivi-zelenyy",
    description: "Свежие киви из Новой Зеландии. Богаты витамином C и клетчаткой. Отличное дополнение к завтраку.",
    price: 159,
    stock: 90,
    category: "ИМПОРТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1585059895524-72359e06133a?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Папайя свежая",
    slug: "papaya-svezaya",
    description: "Экзотическая папайя из Бразилии. Содержит папаин — фермент для улучшения пищеварения.",
    price: 349,
    stock: 25,
    category: "ТРОПИЧЕСКИЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Черника органик",
    slug: "chernika-organik",
    description: "Дикая органическая черника из карельских лесов. Богата антиоксидантами и полезна для зрения.",
    price: 499,
    stock: 30,
    category: "ОРГАНИЧЕСКИЕ" as const,
    organic: true,
    imageUrl: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Персик Нектарин",
    slug: "persik-nektarin",
    description: "Сочные нектарины из Узбекистана. Сладкие с легкой кислинкой. Идеальны для летних десертов.",
    price: 219,
    stock: 65,
    category: "ИМПОРТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1517282009859-f000ec3b26fe?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Лимон Сицилия",
    slug: "limon-siciliya",
    description: "Ароматные лимоны с острова Сицилия. Богаты витамином C, отлично подходят для напитков и выпечки.",
    price: 99,
    stock: 110,
    category: "ИМПОРТНЫЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1587486913049-53fc88980cfc?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Малина органик",
    slug: "malina-organik",
    description: "Свежая органическая малина из подмосковных садов. Без пестицидов и химических удобрений.",
    price: 379,
    discountPrice: 299,
    stock: 35,
    category: "ОРГАНИЧЕСКИЕ" as const,
    organic: true,
    imageUrl: "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?w=800&h=800&fit=crop",
    ],
  },
  {
    name: "Дракон фрукт",
    slug: "drakon-frukt",
    description: "Экзотический питайя из Вьетнама. Красочный и вкусный тропический фрукт с нежной мякотью.",
    price: 599,
    stock: 20,
    category: "ТРОПИЧЕСКИЕ" as const,
    organic: false,
    imageUrl: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400&h=400&fit=crop",
    images: [
      "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=800&h=800&fit=crop",
    ],
  },
];

async function seed() {
  console.log("🌱 Заполнение базы данных...");

  const existing = await db.select().from(fruitsTable).limit(1);
  if (existing.length > 0) {
    console.log("ℹ️  Фрукты уже существуют — обновляем данные...");
    for (const fruit of fruits) {
      await db
        .insert(fruitsTable)
        .values(fruit as any)
        .onConflictDoUpdate({
          target: fruitsTable.slug,
          set: {
            discountPrice: (fruit as any).discountPrice ?? null,
            images: fruit.images,
          },
        });
    }
    console.log(`✅ Обновлено ${fruits.length} фруктов`);
  } else {
    await db.insert(fruitsTable).values(fruits as any[]);
    console.log(`✅ Добавлено ${fruits.length} фруктов`);
  }

  const adminPassword = await bcrypt.hash("admin123", 10);
  await db.insert(usersTable).values({
    name: "Администратор",
    email: "admin@fruitstore.ru",
    password: adminPassword,
    role: "ADMIN",
  }).onConflictDoNothing();
  console.log("✅ Администратор создан: admin@fruitstore.ru / admin123");

  const customerPassword = await bcrypt.hash("customer123", 10);
  await db.insert(usersTable).values({
    name: "Иван Иванов",
    email: "ivan@example.ru",
    password: customerPassword,
    role: "CUSTOMER",
  }).onConflictDoNothing();
  console.log("✅ Тестовый покупатель: ivan@example.ru / customer123");

  console.log("🎉 База данных успешно заполнена!");
}

seed().catch(console.error).finally(() => process.exit(0));
