import React from 'react';
import { Link } from 'react-router-dom';
import './Sidebar.css';
import NProgress from 'nprogress';
import { FaHome, FaGlobe, FaChartBar, FaUser } from "react-icons/fa";
import { FaPeopleGroup } from "react-icons/fa6";
import { useSidebar } from '../../hooks/useSidebar';

const Sidebar = () => {

  const { sidebarExpanded } = useSidebar();

  const handleRefreshClick = (e, route) => {
    e.preventDefault();
    NProgress.start();
    window.location.href = route;
  };

  return (
    <div className={`sidebar ${!sidebarExpanded ? 'collapsed' : ''}`}>
      <div className="sidebar flex-shrink-0 p-3 rounded-0 bg-neutral-background">
        <ul className="sidebar-nav list-style-none p-0 m-0">
          <li className="relative list-none mt-0 mb-1" role="presentation">
            <Link 
              to="/home" 
              onClick={(e) => handleRefreshClick(e, "/home")}
              className="reddit-nav-link flex justify-between items-center relative px-3 py-3 gap-2 text-secondary-onBackground hover:bg-neutral-background-hover rounded-lg cursor-pointer no-underline"
            >
              <span className="sidebar-link-content">
                <FaHome className="sidebar-icon" />
                <span>Pagina principală</span>
              </span>
            </Link>
          </li>

          <li className="relative list-none mt-0 mb-1" role="presentation">
            <Link 
              to="/all"
              onClick={(e) => handleRefreshClick(e, "/all")}
              className="reddit-nav-link flex justify-between items-center relative px-3 py-3 gap-2 text-secondary-onBackground hover:bg-neutral-background-hover rounded-lg cursor-pointer no-underline"
            >
              <span className="sidebar-link-content">
                <FaGlobe className="sidebar-icon" />
                <span>Toate postările</span>
              </span>
            </Link>
          </li>
          <li className="relative list-none mt-3 mb-1 border-t pt-3" role="presentation">
            <Link 
              to="/organizations"
              onClick={(e) => handleRefreshClick(e, "/organizations")}
              className="reddit-nav-link flex justify-between items-center relative px-3 py-3 gap-2 text-secondary-onBackground hover:bg-neutral-background-hover rounded-lg cursor-pointer no-underline"
            >
              <span className="sidebar-link-content">
                <FaPeopleGroup className="sidebar-icon" />
                <span>Organizații</span>
              </span>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;