import React, { useState, useEffect, useRef } from "react";
import "./Navbar.css";
import { Link, useNavigate } from "react-router-dom";
import NProgress from "nprogress";
import { FaRegComments, FaSearch, FaBars, FaRegBell, FaPlus, FaChevronDown, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { BsArrowsExpand, BsArrowsCollapse } from "react-icons/bs";
import { useSidebar } from '../../hooks/useSidebar';
import { useAuth } from '../../hooks/useAuth';
import OrganizationStore from '../../state/stores/OrganizationStore';

const Navbar = () => {
  const { sidebarExpanded, toggleSidebar, setSidebarExpanded } = useSidebar();
  const { user, isAuthenticated, logout } = useAuth();
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [activeButton, setActiveButton] = useState(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  const userDropdownRef = useRef(null);
  const searchDropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const navigate = useNavigate();
  
  const notificationsCount = user?.notifications_count || 0;

  const handleRefreshClick = (e, route) => {
    e.preventDefault();
    NProgress.start();
    window.location.href = route;
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchResults.length > 0) {
      handleOrganizationSelect(searchResults[0]);
    }
  };

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          setIsSearching(true);
          const response = await OrganizationStore.getAllOrganizations();
          const allOrganizations = response.organizations || [];
          
          const filtered = allOrganizations.filter(org => 
            org.name.toLowerCase().includes(searchQuery.toLowerCase())
          );
          
          setSearchResults(filtered.slice(0, 5));
          setShowSearchDropdown(filtered.length > 0);
        } catch (error) {
          console.error('Eroare la căutarea organizațiilor:', error);
          setSearchResults([]);
          setShowSearchDropdown(false);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowSearchDropdown(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [searchQuery]);

  const handleOrganizationSelect = (organization) => {
    navigate(`/organization/${organization.org_id}`);
    setSearchQuery('');
    setShowSearchDropdown(false);
    setSearchResults([]);
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchDropdownRef.current && !searchDropdownRef.current.contains(event.target)) {
        setShowSearchDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSidebarToggle = (e) => {
    e.preventDefault();
    if (navbarOpen) {
      setNavbarOpen(false);
    }
    toggleSidebar();
  };

  const handleNavbarToggle = (e) => {
    e.preventDefault();
    
    if (sidebarExpanded && window.innerWidth < 768) {
      if (typeof setSidebarExpanded === 'function') {
        setSidebarExpanded(false);
      } else {
        if (sidebarExpanded) {
          toggleSidebar();
        }
      }
    }
    
    setNavbarOpen(!navbarOpen);
  };

  const userInitial = user?.username ? user.username.charAt(0).toUpperCase() : "U";

  const toggleUserDropdown = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    setShowUserDropdown(!showUserDropdown);
  };

  const handleLogout = async () => {
    setActiveButton('logout');
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setActiveButton(null);
    }
  };

  const handleProfileClick = () => {
    setActiveButton('profile');
    try {
      if (user?.user_id) {
        navigate(`/user/${user.user_id}`);
      }
    } catch (error) {
      console.error('Navigation error:', error);
    } finally {
      setActiveButton(null);
    }
  };

  const handleSettingsClick = () => {
    setActiveButton('settings');
    setTimeout(() => {
      setActiveButton(null);
      navigate('/settings');
    }, 500);
  };

  return (
    <nav className="navbar navbar-expand-md navbar-light fixed-top bg-light rounded-0">
      <div className="container-fluid">
        <button
          className="btn d-md-none sidebar-toggle-mobile me-2"
          onClick={handleSidebarToggle}
        >
          <FaBars />
        </button>

        <Link to="/home" onClick={(e) => handleRefreshClick(e, "/home")} className="navbar-brand ms-2">
          <span className="navbar-link-content">
            <FaRegComments className="navbar-icon" />
            <span>Student Platform</span>
          </span>
        </Link>

        <button
          className="btn d-none d-md-flex sidebar-toggle-desktop align-items-center"
          onClick={toggleSidebar}
        >
          {sidebarExpanded ? (
            <>
              <BsArrowsCollapse className="me-2" />
              <span>Restrânge navigarea</span>
            </>
          ) : (
            <>
              <BsArrowsExpand className="me-2" />
              <span>Extinde navigarea</span>
            </>
          )}
        </button>

        <button
          className="navbar-toggler collapsed"
          type="button"
          onClick={handleNavbarToggle}
          aria-controls="navbarCollapse"
          aria-expanded={navbarOpen}
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className={`navbar-collapse collapse ${navbarOpen ? 'show' : ''}`} id="navbarCollapse">
          <div className="container-fluid d-flex justify-content-between align-items-center">
            {sidebarExpanded ? (
                <div className="d-none d-md-block sidebar-placeholder sidebar-expanded"></div>
                ) : (
                <div className="d-none d-md-block sidebar-placeholder sidebar-collapsed"></div>
            )}
            
            <div className="d-flex justify-content-center flex-fill">
              <div className="search-container" ref={searchDropdownRef}>
                <form
                  className={`d-flex search-form ${!sidebarExpanded ? "sidebar-collapsed" : ""}`}
                  role="search"
                  onSubmit={handleSearch}
                >
                  <div className="input-group search-input-group">
                    <span className="input-group-text search-icon-container">
                      <FaSearch className="search-icon" />
                    </span>
                    <input
                      ref={searchInputRef}
                      className="form-control search-input"
                      type="search"
                      placeholder="Caută organizații..."
                      aria-label="Search organizations"
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      onFocus={() => {
                        if (searchResults.length > 0) {
                          setShowSearchDropdown(true);
                        }
                      }}
                    />
                  </div>
                </form>
                
                {showSearchDropdown && (
                  <div className="search-dropdown">
                    {isSearching ? (
                      <div className="search-dropdown-item searching">
                        <span>Se caută...</span>
                      </div>
                    ) : (
                      searchResults.map((organization) => (
                        <div
                          key={organization.org_id}
                          className="search-dropdown-item"
                          onClick={() => handleOrganizationSelect(organization)}
                        >
                          <div className="search-result">
                            <span className="organization-name org-name">{organization.name}</span>
                            {organization.description && (
                              <span className="organization-description org-desc">
                                {organization.description.length > 50 
                                  ? `${organization.description.substring(0, 50)}...` 
                                  : organization.description
                                }
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                    
                    {!isSearching && searchResults.length === 0 && searchQuery.length >= 2 && (
                      <div className="search-dropdown-item no-results">
                        <span>Nu s-au găsit organizații</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {!sidebarExpanded ? (
                <div className="d-none d-md-block sidebar-placeholder sidebar-balance"></div>
            ) : null}
            
            <ul className="navbar-nav mb-2 mb-md-0 navbar-buttons">
              {user?.user_type !== 'Student' ? (
                <li className="nav-item reddit-nav-item mx-1">
                  <Link 
                    to="/create-post"
                    className="btn btn-sm btn-light rounded d-flex align-items-center" 
                    style={{height: '36px'}} 
                    title="Creeaza">
                    <FaPlus className="reddit-nav-icon" />
                    <span className="d-none d-md-inline">Creează</span>
                  </Link>
                </li>
              ) : (
                <li className="nav-item reddit-nav-item mx-1">
                  <div 
                    className="btn btn-sm rounded d-flex align-items-center create-placeholder" 
                    style={{height: '36px', visibility: 'hidden', pointerEvents: 'none'}}>
                    <FaPlus className="reddit-nav-icon" />
                    <span className="d-none d-md-inline">Creează</span>
                  </div>
                </li>
              )}
              
              <li className="nav-item reddit-nav-item mx-1 notification-wrapper">
                <Link 
                  to="/notifications"
                  className="btn btn-sm btn-light rounded d-flex align-items-center justify-content-center notifications-btn" 
                  style={{height: '36px', width: '36px'}} 
                  title="Notificări">
                  <FaRegBell className="reddit-nav-icon" />
                  <span className="d-none">Notificări</span>
                  {notificationsCount > 0 && (
                    <span className="notifications-badge" title={`${notificationsCount} notificări noi`}>
                      {notificationsCount > 99 ? '99+' : notificationsCount}
                    </span>
                  )}
                </Link>
              </li>
              
              <li className="nav-item reddit-nav-item user-dropdown mx-1 position-relative" ref={userDropdownRef}>
                <button 
                  className="btn btn-sm btn-light rounded d-flex align-items-center" 
                  style={{height: '36px'}}
                  onClick={toggleUserDropdown}
                >
                  <div className="rounded-circle bg-danger text-white d-flex justify-content-center align-items-center" 
                       style={{width: '28px', height: '28px', fontSize: '14px', fontWeight: 'bold'}}>
                    {userInitial}
                  </div>
                  <div className="user-dropdown-info d-none d-md-flex align-items-center ms-2">
                    <span className="text-truncate" style={{maxWidth: '100px'}}>
                      {user?.username || "Utilizator"}
                    </span>
                    <FaChevronDown className="dropdown-arrow ms-2" />
                  </div>
                </button>
                
                {showUserDropdown && (
                  <div className="reddit-dropdown-menu dropdown-menu-end shadow show">
                    <button 
                      className={`reddit-dropdown-item ${activeButton === 'profile' ? 'active' : ''}`}
                      onClick={handleProfileClick}
                    >
                      <FaUser className="dropdown-icon" />
                      <span>Profil</span>
                    </button>
                    <button 
                      className={`reddit-dropdown-item ${activeButton === 'settings' ? 'active' : ''}`}
                      onClick={handleSettingsClick}
                    >
                      <FaCog className="dropdown-icon" />
                      <span>Setări</span>
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      className={`reddit-dropdown-item logout-item ${activeButton === 'logout' ? 'active' : ''}`}
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt className="dropdown-icon" />
                      <span>Deconectare</span>
                    </button>
                  </div>
                )}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;