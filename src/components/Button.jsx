// Reusable button component with a default style.
// Extend this component to support variants, sizes, and icons.

export default function Button({ children, type = 'button', onClick, className = '' }) {
  return (
    <button type={type} onClick={onClick} className={`btn ${className}`}>
      {children}
    </button>
  )
}
