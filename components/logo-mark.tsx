export function LogoMark({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      aria-hidden="true"
      className={className}
      fill="none"
    >
      <rect width="40" height="40" rx="12" fill="#C4490B" />
      <circle cx="20" cy="20" r="5" fill="#FFF8EE" />
      <path
        d="M20 6v5.2M20 28.8V34M6 20h5.2M28.8 20H34M9.2 9.2l3.6 3.6M27.2 27.2l3.6 3.6M30.8 9.2l-3.6 3.6M12.8 27.2 9.2 30.8"
        stroke="#FFF8EE"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}
