import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  SquaresFour,
  UserPlus,
  Users,
  FileArrowDown,
  Gear,
  SignOut,
  UserCircle
} from '@phosphor-icons/react';
import { useAuth, roleLabels } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    navigate('/login');
  };

  const handleSettingsClick = (e) => {
    e.preventDefault();
    alert('Fitur Pengaturan Akun Pegawai SIM-REHAB dapat diakses oleh Administrator Sistem.');
  };

  const displayRole = user?.role
    ? roleLabels[user.role] || 'Super User (Kasi Rehab)'
    : 'Super User (Kasi Rehab)';

  const displayId = user?.username
    ? `ID: ${user.username}`
    : 'ID: 2121';

  return (
    <aside className="sidebar">
      {/* Header Sidebar: Logo & Nama Instansi */}
      <div className="sidebar-header">
        <img
          src="/assets/images/bnn.png"
          alt="Logo BNN"
          className="sidebar-logo"
        />
        <div className="sidebar-brand-text">
          <h1 className="sidebar-title">SIM-REHAB</h1>
          <span className="sidebar-subtitle">BNNK BULELENG</span>
        </div>
      </div>

      {/* Menu Navigasi Utama */}
      <nav className="sidebar-nav">
        <NavLink
          to="/dashboard"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <SquaresFour size={18} weight="bold" />
          </span>
          Dashboard Utama
        </NavLink>

        <NavLink
          to="/input-pasien"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <UserPlus size={18} weight="bold" />
          </span>
          Input Pasien Baru
        </NavLink>

        <NavLink
          to="/monitoring-pasien"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <Users size={18} weight="bold" />
          </span>
          Monitoring Pasien
        </NavLink>

        <NavLink
          to="/ekspor-impor"
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <span className="nav-icon">
            <FileArrowDown size={18} weight="bold" />
          </span>
          Ekspor / Impor Data
        </NavLink>

        <a
          href="#pengaturan"
          onClick={handleSettingsClick}
          className="nav-item"
          id="navSettings"
        >
          <span className="nav-icon">
            <Gear size={18} weight="bold" />
          </span>
          Pengaturan Akun
        </a>
      </nav>

      {/* Panel Pengguna */}
      <div className="sidebar-user">
        <div className="user-info-row">
          <div className="user-avatar">
            <UserCircle size={24} weight="fill" />
          </div>
          <div className="user-details">
            <p className="user-role" id="userRole" title={displayRole}>
              {displayRole}
            </p>
            <p className="user-id" id="userId">
              {displayId} &bull; Seksi Rehab
            </p>
          </div>
        </div>
        <button
          type="button"
          className="logout-btn"
          id="logoutBtn"
          onClick={handleLogout}
        >
          <SignOut size={14} weight="bold" />
          <span>Keluar Sesi</span>
        </button>
      </div>
    </aside>
  );
}
