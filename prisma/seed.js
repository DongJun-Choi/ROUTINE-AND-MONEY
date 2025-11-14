import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {

  // 카테고리
  const categories = [
    {
      name: "식비",
      children: ["외식", "카페/음료", "배달", "장보기"],
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
      children: ["게임", "영화", "독서", "운동"],
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

  // 카테고리 룰
  console.log("카테고리 가져오는 중...");
  const allCategories = await prisma.category.findMany();
  const categoryMap = Object.fromEntries(
    allCategories.map((c) => [c.name, c.id])
  );

  const rules = [
    // 식비 → 외식
    { keyword: "버거", category: "외식" },
    { keyword: "찌개", category: "외식" },
    { keyword: "식당", category: "외식" },
    { keyword: "KFC", category: "외식" },
    { keyword: "맥도날드", category: "외식" },

    // 카페/음료
    { keyword: "카페", category: "카페/음료" },
    { keyword: "쥬씨", category: "카페/음료" },
    { keyword: "스타벅스", category: "카페/음료" },
    { keyword: "투썸", category: "카페/음료" },

    // 장보기
    { keyword: "GS25", category: "장보기" },
    { keyword: "CU", category: "장보기" },
    { keyword: "올리브영", category: "장보기" },

    // 교통
    { keyword: "버스", category: "버스" },
    { keyword: "지하철", category: "지하철" },
    { keyword: "티머니", category: "버스" },
    { keyword: "고속버스", category: "버스" },

    // 취미/여가
    { keyword: "PC방", category: "게임" },
    { keyword: "노래", category: "음악/영화" },
    { keyword: "영화", category: "음악/영화" },
  ];

  console.log("카테고리 규칙 생성 중...");

  await prisma.categoryRule.createMany({
    data: rules.map((r) => ({
      keyword: r.keyword,
      categoryId: categoryMap[r.category],
    })),
    skipDuplicates: true,
  });

  console.log("카테고리 + 규칙 seed 완료!");
}

main()
  .then(() => console.log("카테고리 seed 완료!"))
  .catch(console.error)
  .finally(() => prisma.$disconnect());