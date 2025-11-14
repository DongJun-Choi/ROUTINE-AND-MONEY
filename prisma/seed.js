import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const categories = [
    {
      name: "식비",
      children: ["외식", "카페/음료", "배달", "장보기(마트/편의점)"],
    },
    {
      name: "생활",
      children: ["생활용품", "통신비", "공과금", "집 관련"],
    },
    {
      name: "교통",
      children: ["지하철", "버스", "택시"],
    },
    {
      name: "의료",
      children: ["병원", "약국", "보험료"],
    },
    {
      name: "쇼핑",
      children: ["의류", "잡화", "온라인 쇼핑"],
    },
    {
      name: "취미·여가",
      children: ["게임", "음악/영화", "독서", "운동"],
    },
    {
      name: "교육",
      children: ["학원/강의", "자격증", "도서"],
    },
    {
      name: "금융",
      children: ["예금/적금", "투자", "대출상환", "세금"],
    },
    {
      name: "기타",
      children: ["선물", "경조사", "기타"],
    },
  ];

  for (const category of categories) {
    const parent = await prisma.category.upsert({
      where: { name: category.name },
      update: {},
      create: { name: category.name },
    });

    for (const child of category.children) {
      await prisma.category.upsert({
        where: { name: child },
        update: {},
        create: { name: child, parentId: parent.id },
      });
    }
  }
}

main()
  .then(() => console.log("카테고리 seed 완료!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());