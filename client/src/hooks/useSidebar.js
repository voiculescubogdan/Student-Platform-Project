import { useContext } from 'react';
import { SidebarContext } from '../state/contexts/SidebarContext';

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}