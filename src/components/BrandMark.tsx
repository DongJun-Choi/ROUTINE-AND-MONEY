import Image from "next/image";

const sizes = {
  sm: 32,
  md: 40,
};

// 라이트 테마에는 진한 파랑 심볼을, 어두운 면에서는 대비가 맞는 밝은 파랑 심볼을 쓴다.
// 옆에 서비스 이름이 함께 있어 심볼은 꾸밈으로 보고 대체 텍스트를 비운다.
export default function BrandMark({ size = "md" }: { size?: keyof typeof sizes }) {
  const pixels = sizes[size];
  return (
    <span aria-hidden="true" className="flex shrink-0 items-center justify-center" style={{ width: pixels, height: pixels }}>
      <Image src="/brand/symbol-on-light.png" alt="" width={pixels} height={pixels} priority className="dark:hidden" />
      <Image src="/brand/symbol-on-dark.png" alt="" width={pixels} height={pixels} priority className="hidden dark:block" />
    </span>
  );
}
