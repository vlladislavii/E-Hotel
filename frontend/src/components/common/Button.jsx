import styles from './Button.module.css'

function Button({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  onClick,
  type = 'button',
  icon: Icon,
  className = ''
}) {
  const classes = [
    styles.btn,
    styles[variant],
    styles[size],
    className
  ].filter(Boolean).join(' ')

  return (
    <button
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
    >
      {Icon && <Icon size={size === 'small' ? 16 : 20} />}
      {children}
    </button>
  )
}

export default Button
