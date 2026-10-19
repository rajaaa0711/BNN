import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LockKey,
  ShieldCheck,
  Eye,
  EyeSlash,
  SignIn,
  Buildings
} from '@phosphor-icons/react';
import { useAuth } from '../context/AuthContext';
import '../styles/design-system.css';
import '../styles/login.css';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('super_user');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    document.title = 'SIM-REHAB | Login Pegawai - BNNK Buleleng';
    try {
      const saved = localStorage.getItem('simRehabUser');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.username) setUsername(parsed.username);
        if (parsed.role) setRole(parsed.role);
      }
    } catch (e) {}

    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      alert('Mohon lengkapi NIP/Username dan Kata Sandi.');
      return;
    }

    login(trimmedUsername, password, role);
    navigate('/dashboard');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Panel Kiri: Identitas Resmi BNN */}
        <div className="login-brand-panel">
          <div className="brand-header">
            <img
              src="/assets/images/bnn.png"
              alt="Logo BNN RI"
              className="brand-logo"
            />
            <div className="brand-org-meta">
              <span className="brand-instansi">BADAN NARKOTIKA NASIONAL</span>
              <span className="brand-cabang">KABUPATEN BULELENG</span>
            </div>
          </div>

          <div className="brand-hero-text">
            <h1 className="brand-app-name">SIM-REHAB</h1>
            <p className="brand-app-desc">
              Sistem Informasi Administrasi Pasien Rehabilitasi
            </p>
          </div>

          <div className="brand-tagline-card">
            <div className="tagline-title">#WARONDRUGS &bull; SINGARAJA BERSINAR</div>
            <p className="tagline-desc">
              Layanan Rehabilitasi Medis &amp; Sosial: Pulih, Mandiri, dan Berdaya.
            </p>
          </div>

          <div className="brand-footer-note">
            <Buildings size={16} weight="bold" />
            <span>Klinik Pratama BNNK Buleleng</span>
          </div>
        </div>

        {/* Panel Kanan: Form Masuk */}
        <div className="login-form-panel">
          <div className="form-title-group">
            <h2 className="login-heading">Portal Masuk Pegawai</h2>
            <p className="login-subheading">
              Gunakan kredensial resmi staf rehabilitasi untuk mengakses sistem
            </p>
          </div>

          <form className="login-form" id="loginForm" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="username" className="form-label">
                NIP / Nama Pengguna (Username)
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <User size={18} weight="bold" />
                </span>
                <input
                  type="text"
                  id="username"
                  name="username"
                  className="form-input with-prefix"
                  placeholder="198705142012011001 / staf_rehab"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Kata Sandi
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <LockKey size={18} weight="bold" />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  className="form-input with-prefix with-suffix"
                  placeholder="••••••••••••"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  id="togglePassword"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Lihat kata sandi"}
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlash size={18} weight="bold" />
                  ) : (
                    <Eye size={18} weight="bold" />
                  )}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="role" className="form-label">
                Kewenangan Akses (Role)
              </label>
              <div className="input-with-icon">
                <span className="input-icon">
                  <ShieldCheck size={18} weight="bold" />
                </span>
                <select
                  id="role"
                  name="role"
                  className="form-select with-prefix"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="petugas_rehab">Petugas Rehabilitasi</option>
                  <option value="super_user">Super User (Kasi Rehab)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block btn-lg">
              <SignIn size={18} weight="bold" />
              <span>Masuk ke Sistem</span>
            </button>
          </form>

          <div className="login-security-info">
            <span>Sistem internal terenkripsi BNN RI</span>
          </div>
        </div>
      </div>
    </div>
  );
}
