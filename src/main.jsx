/**
 * ==============================================================================
 * File: src/main.jsx
 * Fungsi: Titik Masuk Utama (Entry Point) Aplikasi SIM-REHAB BNNK Buleleng
 * ==============================================================================
 * 
 * DESKRIPSI & ALUR KERJA:
 * File ini adalah gerbang pertama saat aplikasi React dimuat di browser.
 * Fungsinya adalah menghubungkan kode React dengan elemen HTML (<div id="root">)
 * di file index.html, serta membungkus seluruh aplikasi dengan Provider State Global:
 * 
 * 1. <React.StrictMode>   : Mode ketat React untuk mendeteksi potensi bug sejak dini.
 * 2. <BrowserRouter>       : Mengaktifkan sistem routing/navigasi SPA (Single Page Application).
 * 3. <AuthProvider>        : Menyediakan data autentikasi (login/logout/role) ke semua komponen.
 * 4. <PatientProvider>     : Menyediakan data pasien rehabilitasi (CRUD) ke semua halaman.
 * 5. <App />               : Komponen induk yang mengatur rute dan tampilan halaman.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PatientProvider } from './context/PatientContext';
import App from './App';

// Render aplikasi ke dalam elemen DOM dengan id 'root'
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* BrowserRouter membungkus aplikasi agar fitur navigasi URL berjalan */}
    <BrowserRouter>
      {/* AuthProvider menyediakan informasi login user ke seluruh aplikasi */}
      <AuthProvider>
        {/* PatientProvider menyediakan database klien rehabilitasi ke seluruh halaman */}
        <PatientProvider>
          {/* Komponen utama aplikasi */}
          <App />
        </PatientProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
