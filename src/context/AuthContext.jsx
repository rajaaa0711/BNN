/**
 * ==============================================================================
 * File: src/context/AuthContext.jsx
 * Fungsi: Manajemen Autentikasi Pegawai & Hak Akses (Role-Based Access Control)
 * ==============================================================================
 * 
 * DESKRIPSI & ALUR KERJA:
 * Context ini bertindak sebagai pusat manajemen sesi login pegawai di BNNK Buleleng:
 * 
 * 1. Penyimpanan Sesi:
 *    - Menggunakan `localStorage` dan `sessionStorage` agar data login pegawai tetap
 *      tersimpan meskipun halaman di-refresh.
 * 
 * 2. Manajemen Role (Hak Akses Pegawai BNN):
 *    - `petugas_rehab` : Staf administrasi rehabilitasi (input data & monitoring).
 *    - `super_user`    : Kepala Seksi (Kasi) Rehabilitasi BNNK Buleleng (pengambil kebijakan).
 *    - `admin`         : Administrator sistem SIM-REHAB.
 *    - `dokter`        : Dokter / Tenaga Medis Klinik Pratama BNNK Buleleng.
 * 
 * 3. Fungsi yang Disediakan:
 *    - `user`   : Data profil user yang sedang login (username & role).
 *    - `login`  : Fungsi untuk menyimpan sesi user baru saat berhasil masuk.
 *    - `logout` : Fungsi untuk menghapus sesi dan mengembalikan user ke login.
 *    - `useAuth`: Custom Hook React untuk mengakses data login di komponen manapun.
 */

import React, { createContext, useContext, useState } from 'react';

// Membuat objek Context untuk autentikasi
const AuthContext = createContext(null);

/**
 * Daftar Label Role Pegawai BNN
 * Mengubah kode role teknis (misal: 'super_user') menjadi teks resmi yang ramah pengguna.
 */
export const roleLabels = {
  petugas_rehab: 'Petugas Rehabilitasi',
  super_user: 'Super User (Kasi Rehab)',
  admin: 'Administrator Sistem',
  dokter: 'Dokter / Tenaga Medis',
};

/**
 * Provider Autentikasi (AuthProvider)
 * Membungkus aplikasi agar state user, fungsi login, dan fungsi logout dapat diakses global.
 */
export function AuthProvider({ children }) {
  // Inisialisasi state user dari storage browser (agar tidak hilang saat refresh)
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('simRehabUser') || sessionStorage.getItem('simRehabUser');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (e) {
      // Jika terjadi error saat parsing JSON, fallback ke null
      return null;
    }
  });

  /**
   * Fungsi Login
   * Menyimpan data kredensial pegawai ke penyimpanan lokal browser dan memperbarui state.
   * @param {string} username - NIP atau username staf
   * @param {string} password - Kata sandi staf
   * @param {string} role - Hak akses / jabatan pegawai
   */
  const login = (username, password, role) => {
    const userData = { username, role };
    const jsonStr = JSON.stringify(userData);
    localStorage.setItem('simRehabUser', jsonStr);
    sessionStorage.setItem('simRehabUser', jsonStr);
    setUser(userData);
  };

  /**
   * Fungsi Logout
   * Menghapus seluruh sesi login staf dari browser dan mengosongkan state user.
   */
  const logout = () => {
    localStorage.removeItem('simRehabUser');
    sessionStorage.removeItem('simRehabUser');
    setUser(null);
  };

  return (
    // Menyediakan value user, login, dan logout ke seluruh komponen turunan
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom Hook useAuth
 * Mempermudah pemanggilan data auth di file lain (cukup: const { user, logout } = useAuth()).
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth harus digunakan di dalam komponen AuthProvider');
  }
  return context;
}
