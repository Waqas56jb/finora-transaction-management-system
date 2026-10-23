import { LoaderCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cx } from '../utils/cx';

const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  outline: 'btn-outline',
  ghost: 'btn-ghost',
  danger: 'btn-danger',
};

export function Button({
  variant = 'primary',
  loading = false,
  children,
  className,
  type = 'button',
  disabled,
  ...props
}) {
  return (
    <button
      type={type}
      className={cx('btn', VARIANTS[variant] || VARIANTS.primary, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

export function ButtonLink({ to, variant = 'primary', className, children, ...props }) {
  return (
    <Link to={to} className={cx('btn', VARIANTS[variant] || VARIANTS.primary, className)} {...props}>
      {children}
    </Link>
  );
}
