const SIZE = {
  sm: 'px-3 py-1.5 text-sm min-h-[36px]',
  md: 'px-4 py-2 text-base min-h-[44px]',
  lg: 'px-6 py-3 text-lg min-h-[52px]',
}

const VARIANT = {
  primary: 'bg-teal-600 hover:bg-teal-700 text-white border border-transparent',
  secondary: 'bg-transparent border border-teal-600 text-teal-600 hover:bg-teal-50',
  ghost: 'bg-transparent border border-transparent text-teal-600 hover:bg-teal-50',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-transparent',
}

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  )
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  className = '',
  type = 'button',
  ...props
}) {
  const isDisabled = disabled || loading

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors duration-200',
        SIZE[size] ?? SIZE.md,
        VARIANT[variant] ?? VARIANT.primary,
        isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
        className,
      ].join(' ')}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
}
