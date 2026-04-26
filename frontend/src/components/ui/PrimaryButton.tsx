import { Button, ButtonProps } from '@/components/ui/button';
import { forwardRef } from 'react';

const PrimaryButton = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, ...props }, ref) => (
    <Button
      ref={ref}
      className={`gradient-primary border-0 text-primary-foreground font-semibold ${className || ''}`}
      {...props}
    />
  )
);

PrimaryButton.displayName = 'PrimaryButton';

export { PrimaryButton };