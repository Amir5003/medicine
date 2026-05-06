/**
 * Base card component.
 * Use `hover` prop to enable lift effect on hover.
 */
export default function Card({ children, hover = false, className = '', ...props }) {
  return (
    <div
      className={[
        'bg-white rounded-2xl shadow-card border border-gray-100',
        hover ? 'transition-shadow duration-200 hover:shadow-card-hover' : '',
        className,
      ].join(' ')}
      {...props}
    >
      {children}
    </div>
  )
}
