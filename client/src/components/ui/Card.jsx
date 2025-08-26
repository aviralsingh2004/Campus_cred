import React from 'react';
import { cn } from '../../utils/helpers';

const Card = ({ children, className, padding = true, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-lg shadow-md border border-gray-200',
        padding && 'p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className, ...props }) => {
  return (
    <div
      className={cn('border-b border-gray-200 pb-4 mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardTitle = ({ children, className, ...props }) => {
  return (
    <h3
      className={cn('text-lg font-semibold text-gray-900', className)}
      {...props}
    >
      {children}
    </h3>
  );
};

const CardContent = ({ children, className, ...props }) => {
  return (
    <div className={cn('space-y-4', className)} {...props}>
      {children}
    </div>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;

export default Card;
