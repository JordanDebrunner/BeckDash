/**
 * Category Badge Component
 *
 * Displays a badge for event categories with appropriate colors
 */

import React from 'react';
import { EventCategory } from '../../types/Event';

// Props interface
interface CategoryBadgeProps {
  category?: EventCategory;
  color?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Category Badge component
 */
const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category = 'default',
  color,
  className = '',
  size = 'md',
}) => {
  // Category colors
  const categoryColors: Record<EventCategory | string, string> = {
    default: 'bg-blue-500 text-white',
    work: 'bg-violet-500 text-white',
    personal: 'bg-pink-500 text-white',
    family: 'bg-emerald-500 text-white',
    health: 'bg-red-500 text-white',
    finance: 'bg-amber-500 text-white',
    travel: 'bg-indigo-500 text-white',
    education: 'bg-teal-500 text-white',
    other: 'bg-gray-500 text-white',
  };

  // Size classes
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  // Custom style for color prop
  const customStyle = color ? { backgroundColor: color } : {};

  // Get display name for the category
  const getCategoryDisplay = (category: EventCategory | string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${
        color ? 'text-white' : categoryColors[category]
      } ${className}`}
      style={customStyle}
    >
      {getCategoryDisplay(category)}
    </span>
  );
};

export default CategoryBadge;