import React from 'react';
import { NavigationMenu } from './NavigationMenu';

export const Sidebar: React.FC = () => {
  return (
    <aside
      aria-label="Desktop navigation sidebar"
      className="hidden md:block w-[240px] shrink-0 sticky top-0 h-screen overflow-y-auto border-r border-[var(--border-default)] bg-[var(--bg-surface)] no-print"
    >
      <NavigationMenu />
    </aside>
  );
};
