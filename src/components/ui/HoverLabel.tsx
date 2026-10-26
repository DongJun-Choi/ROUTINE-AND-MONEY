interface HoverLabelProps {
  text: string;
  placement?: "top" | "bottom";
}

// 아이콘만 있는 버튼 안에 넣어, 마우스를 올리거나 키보드로 포커스하면 이름을 말풍선으로 보여 준다.
// 버튼의 aria-label이 이름을 이미 알려 주므로 말풍선은 화면 낭독기에서 숨긴다. 부모에는 `group relative`가 필요하다.
export default function HoverLabel({ text, placement = "top" }: HoverLabelProps) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 rounded-md bg-tooltip px-2 py-1 text-xs leading-4 font-semibold whitespace-nowrap text-tooltip-text opacity-0 shadow-pop transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 ${placement === "top" ? "bottom-full mb-2" : "top-full mt-2"}`}
    >
      {text}
    </span>
  );
}
