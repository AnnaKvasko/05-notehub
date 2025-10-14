interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchBox({
  value,
  onChange,
  className,
}: SearchBoxProps) {
  return (
    <input
      className={className}
      type="text"
      placeholder="Search notes"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
}
