interface AmountTextProps {
  value: string;
  unit?: string;
  className?: string;
  unitClassName?: string;
}

// 숫자가 단위보다 먼저 읽히도록 단위는 한 단계 작고 가볍게 표시한다.
export default function AmountText({ value, unit = "원", className = "", unitClassName = "" }: AmountTextProps) {
  return (
    <span className={`whitespace-nowrap ${className}`}>
      {value}
      <span className={`ml-0.5 font-medium ${unitClassName}`}>{unit}</span>
    </span>
  );
}
