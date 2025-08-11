import { createContext, useState, useEffect } from 'react';

const SidebarContext = createContext({
  sidebarExpanded: true,
  toggleSidebar: () => {},
  setSidebarExpanded: () => {},
  isMobile: false
});

function SidebarProvider({ children }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarExpanded, setSidebarExpanded] = useState(!isMobile);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      
      if (mobile && sidebarExpanded) {
        setSidebarExpanded(false);
      }
    };

    window.addEventListener('resize', handleResize);
    
    return () => window.removeEventListener('resize', handleResize);
  }, [sidebarExpanded]);

  const toggleSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  const value = {
    sidebarExpanded,
    toggleSidebar,
    setSidebarExpanded,
    isMobile
  };

  return (
    <SidebarContext.Provider value={value}>
      {children}
    </SidebarContext.Provider>
  );
};

export { SidebarContext }
export default SidebarProvider;