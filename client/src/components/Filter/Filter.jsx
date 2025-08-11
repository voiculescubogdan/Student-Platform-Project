import React, { useState, useEffect } from "react"
import OrganizationStore from "../../state/stores/OrganizationStore"
import { FaTimes } from "react-icons/fa"
import "./Filter.css"

function Filter({ onFilterChange, selectedOrganizations = [], showOnlyFollowed = false }) {
    const [organizations, setOrganizations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [localSelectedOrgs, setLocalSelectedOrgs] = useState([...selectedOrganizations]);
    const [showModal, setShowModal] = useState(false);
    const [modalSearchTerm, setModalSearchTerm] = useState("");
    const [modalSelectedOrgs, setModalSelectedOrgs] = useState([...selectedOrganizations]);

    useEffect(() => {
      setLocalSelectedOrgs([...selectedOrganizations]);
      setModalSelectedOrgs([...selectedOrganizations]);
    }, [selectedOrganizations]);
    
    useEffect(() => {
      async function fetchOrganizations() {
        try {
          setLoading(true);

          const { organizations } = showOnlyFollowed 
            ? await OrganizationStore.getFollowedOrganizations()
            : await OrganizationStore.getAllOrganizations();

          setOrganizations(organizations || []);
        } catch (err) {
          setError('Eroare la încărcarea organizațiilor');
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
      
      fetchOrganizations();
    }, [showOnlyFollowed]);

    useEffect(() => {
      if (showModal) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [showModal]);

    const filteredOrganizations = organizations.filter(org => 
      org.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const modalFilteredOrganizations = organizations.filter(org => 
      org.name.toLowerCase().includes(modalSearchTerm.toLowerCase())
    );

    const limitedOrganizations = filteredOrganizations.slice(0, 3);
    const hasMoreOrganizations = filteredOrganizations.length > 3;

    const handleOrgToggle = (orgId) => {
      let newSelection;
      if (localSelectedOrgs.includes(orgId)) {
        newSelection = localSelectedOrgs.filter(id => id !== orgId);
      } else {
        newSelection = [...localSelectedOrgs, orgId];
      }
      setLocalSelectedOrgs(newSelection);
    };

    const handleModalOrgToggle = (orgId) => {
      let newSelection;
      if (modalSelectedOrgs.includes(orgId)) {
        newSelection = modalSelectedOrgs.filter(id => id !== orgId);
      } else {
        newSelection = [...modalSelectedOrgs, orgId];
      }
      setModalSelectedOrgs(newSelection);
    };
    
    const handleSelectAllToggle = () => {
      if (localSelectedOrgs.length === organizations.length) {
        setLocalSelectedOrgs([]);
      } else {
        const allOrgIds = organizations.map(org => org.org_id);
        setLocalSelectedOrgs(allOrgIds);
      }
    };

    const handleModalSelectAllToggle = () => {
      if (modalSelectedOrgs.length === organizations.length) {
        setModalSelectedOrgs([]);
      } else {
        const allOrgIds = organizations.map(org => org.org_id);
        setModalSelectedOrgs(allOrgIds);
      }
    };

    const applyFilters = () => {
      onFilterChange(localSelectedOrgs);
    };

    const openModal = () => {
      setModalSelectedOrgs([...localSelectedOrgs]);
      setModalSearchTerm("");
      setShowModal(true);
    };

    const closeModal = () => {
      setShowModal(false);
    };

    const applyModalSelection = () => {
      setLocalSelectedOrgs([...modalSelectedOrgs]);
      onFilterChange(modalSelectedOrgs);
      setShowModal(false);
    };

    const getButtonText = () => {
      if (selectedOrganizations.length === 0) {
        return 'Organizații';
      } else if (selectedOrganizations.length === 1) {
        const org = organizations.find(o => o.org_id === selectedOrganizations[0]);
        return org?.name || 'O organizație';
      } else {
        return `${selectedOrganizations.length} organizații`;
      }
    };

    return (
        <>
          <div className="dropdown">
            <button 
              className="filter-main-btn dropdown-toggle" 
              type="button" 
              id="organizationDropdown" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              <span>{getButtonText()}</span>
              {selectedOrganizations.length > 0 && (
                <span className="filter-badge">{selectedOrganizations.length}</span>
              )}
            </button>
            
            <div className="dropdown-menu filter-dropdown-menu" aria-labelledby="organizationDropdown">
              <div className="filter-header">
                <h6 className="filter-title">Filtrează după organizații</h6>
                
                <input
                  type="text"
                  className="filter-search"
                  placeholder="Caută organizații..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="filter-content">
                <div className="select-all-section">
                  <div className="filter-checkbox-item">
                    <label className="filter-label select-all-label">
                      <input
                        className="filter-checkbox"
                        type="checkbox"
                        checked={localSelectedOrgs.length === organizations.length && organizations.length > 0}
                        onChange={handleSelectAllToggle}
                      />
                      Selectează toate
                    </label>
                  </div>
                </div>
                
                {loading ? (
                  <div className="filter-loading">
                    Se încarcă organizațiile...
                  </div>
                ) : error ? (
                  <div className="filter-error">
                    {error}
                  </div>
                ) : filteredOrganizations.length === 0 ? (
                  <div className="filter-no-results">
                    Nu s-au găsit organizații
                  </div>
                ) : (
                  <div className="org-checkbox-list limited">
                    {limitedOrganizations.map((org) => (
                      <div className="filter-checkbox-item" key={org.org_id}>
                        <label className="filter-label">
                          <input
                            className="filter-checkbox"
                            type="checkbox"
                            checked={localSelectedOrgs.includes(org.org_id)}
                            onChange={() => handleOrgToggle(org.org_id)}
                          />
                          {org.name}
                        </label>
                      </div>
                    ))}
                    
                    {organizations.length > 3 && (
                      <button 
                        className="show-more-btn"
                        onClick={openModal}
                        type="button"
                      >
                        Mai multe
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="filter-apply-section">
                <button 
                  className="filter-apply-btn" 
                  onClick={applyFilters}
                  disabled={loading}
                >
                  {loading ? 'Se încarcă...' : 'Aplică filtrele'}
                </button>
              </div>
            </div>
          </div>

          {showModal && (
            <div className="organizations-modal-backdrop" onClick={closeModal}>
              <div className="organizations-modal" onClick={(e) => e.stopPropagation()}>
                <div className="organizations-modal-header">
                  <h6 className="organizations-modal-title">Selectează organizații</h6>
                  <button 
                    className="organizations-modal-close" 
                    onClick={closeModal}
                    type="button"
                  >
                    <FaTimes />
                  </button>
                </div>
                
                <div className="organizations-modal-content">
                  <input
                    type="text"
                    className="organizations-modal-search"
                    placeholder="Caută organizații..."
                    value={modalSearchTerm}
                    onChange={(e) => setModalSearchTerm(e.target.value)}
                  />
                  
                  <div className="filter-checkbox-item">
                    <label className="filter-label select-all-label">
                      <input
                        className="filter-checkbox"
                        type="checkbox"
                        checked={modalSelectedOrgs.length === organizations.length && organizations.length > 0}
                        onChange={handleModalSelectAllToggle}
                      />
                      Selectează toate ({organizations.length})
                    </label>
                  </div>
                  
                  <div className="organizations-modal-list">
                    {modalFilteredOrganizations.length === 0 ? (
                      <div className="filter-no-results">
                        Nu s-au găsit organizații
                      </div>
                    ) : (
                      modalFilteredOrganizations.map((org) => (
                        <div className="filter-checkbox-item" key={org.org_id}>
                          <label className="filter-label">
                            <input
                              className="filter-checkbox"
                              type="checkbox"
                              checked={modalSelectedOrgs.includes(org.org_id)}
                              onChange={() => handleModalOrgToggle(org.org_id)}
                            />
                            {org.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>
                
                <div className="organizations-modal-footer">
                  <button 
                    className="organizations-modal-btn organizations-modal-btn-cancel"
                    onClick={closeModal}
                  >
                    Anulează
                  </button>
                  <button 
                    className="organizations-modal-btn organizations-modal-btn-apply"
                    onClick={applyModalSelection}
                  >
                    Aplică selecția ({modalSelectedOrgs.length})
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
    );
}

export default Filter;