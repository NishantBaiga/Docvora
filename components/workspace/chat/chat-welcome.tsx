export default function chatWelcome() {
  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 text-center text-gray-600 dark:text-gray-400 space-y-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-12 h-12"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h2 className="text-2xl font-semibold">Upload a PDF to get started</h2>
    </div>
  );
}  