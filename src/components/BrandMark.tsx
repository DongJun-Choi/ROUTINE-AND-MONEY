const sizes = {
  sm: { box: "size-8 rounded-[10px]", icon: 18 },
  md: { box: "size-10 rounded-xl", icon: 22 },
};

export default function BrandMark({ size = "md" }: { size?: keyof typeof sizes }) {
  const { box, icon } = sizes[size];
  return (
    <span aria-hidden="true" className={`flex shrink-0 items-center justify-center bg-primary text-on-primary ${box}`}>
      <svg width={icon} height={icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18.5 14.5A7 7 0 1 1 17 7.4" />
        <path d="M18 3.5v4.2h-4.2" />
        <circle cx="12" cy="12" r="2.2" />
      </svg>
    </span>
  );
}
