/**
 * ==============================================================================
 * File: src/App.jsx
 * Fungsi: Pengatur Rute Navigasi (Routing) & Proteksi Halaman (Security Guard)
 * ==============================================================================
 * 
 * DESKRIPSI & ALUR KERJA:
 * File ini mengatur alur navigasi halaman di aplikasi SIM-REHAB menggunakan React Router:
 * 
 * 1. Komponen ProtectedRoute:
 *    - Bertindak sebagai "satpam/penjaga keamanan rute".
 *    - Memeriksa apakah user sudah login (`user !== null`).
 *    - Jika user BELUM login, secara otomatis dialihkan (redirect) ke halaman `/login`.
 *    - Jika user SUDAH login, mengizinkan akses ke halaman tujuan.
 * 
 * 2. Daftar Rute Aplikasi:
 *    - `/login`              -> Halaman Masuk Pegawai BNN
 *    - `/dashboard`          -> Dashboard Statistik & Grafik Rekapitulasi
 *    - `/input-pasien`       -> Formulir Registrasi & Rekam Medis Klien Baru
 *    - `/monitoring-pasien`  -> Tabel Monitoring, Riwayat, & Pencarian Klien
 *    - `/ekspor-impor`       -> Modul Ekspor Excel Resmi BNN & Impor Data
 *    - `*` (Wildcard)        -> Mengarahkan rute tidak valid ke dashboard atau login
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import InputPasienPage from './pages/InputPasienPage';
import MonitoringPasienPage from './pages/MonitoringPasienPage';
import EksporImporPage from './pages/EksporImporPage';

/**
 * Komponen ProtectedRoute (Penjaga Rute Terproteksi)
 * Digunakan untuk mengunci halaman agar hanya bisa dibuka jika user sudah login.
 * @param {object} props.children - Komponen halaman yang ingin diproteksi
 */
function ProtectedRoute({ children }) {
  // Mengambil state user dari AuthContext
  const { user } = useAuth();

  // Jika data user tidak ada (belum login), arahkan kembali ke halaman login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Jika user sudah login, tampilkan konten halaman (children)
  return children;
}

/**
 * Komponen Utama App
 * Mendefinisikan seluruh struktur rute URL aplikasi SIM-REHAB
 */
export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Rute Awal ('/'): Jika sudah login ke /dashboard, jika belum ke /login */}
      <Route
        path="/"
        element={user ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />}
      />

      {/* Rute Publik: Halaman Login (bisa diakses tanpa login) */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rute Terproteksi 1: Dashboard Utama & Statistik */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />

      {/* Rute Terproteksi 2: Formulir Input Pasien Baru */}
      <Route
        path="/input-pasien"
        element={
          <ProtectedRoute>
            <InputPasienPage />
          </ProtectedRoute>
        }
      />

      {/* Rute Terproteksi 3: Tabel Monitoring & Pencarian Klien */}
      <Route
        path="/monitoring-pasien"
        element={
          <ProtectedRoute>
            <MonitoringPasienPage />
          </ProtectedRoute>
        }
      />

      {/* Rute Terproteksi 4: Ekspor Dokumen BNN & Impor Spreadsheet */}
      <Route
        path="/ekspor-impor"
        element={
          <ProtectedRoute>
            <EksporImporPage />
          </ProtectedRoute>
        }
      />

      {/* Rute Fallback (Wildcard): Jika URL tidak dikenali, redirect otomatis */}
      <Route
        path="*"
        element={<Navigate to={user ? "/dashboard" : "/login"} replace />}
      />
    </Routes>
  );
}
