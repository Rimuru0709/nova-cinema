export default function RecliningSeatIcon(props) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="7" y="2" width="5" height="3" rx="1" />
      <path d="M8 5v9h8" />
      <path d="M11 10h6a2 2 0 0 1 2 2v2" />
      <path d="M7 14l-2 5" />
      <path d="M15 14l2 5" />
    </svg>
  );
}
