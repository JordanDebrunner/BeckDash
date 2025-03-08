/**
 * Page Header Component
 * 
 * Reusable header component for page titles and actions
 */

import React, { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0 mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{title}</h1>
        {description && (
          <p className="mt-1 text-gray-500 dark:text-gray-400">{description}</p>
        )}
      </div>
      
      {action && <div>{action}</div>}
    </div>
  );
};

export default PageHeader; 