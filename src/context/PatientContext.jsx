/**
 * ==============================================================================
 * File: src/context/PatientContext.jsx
 * Fungsi: Manajemen Data Pasien Terpusat (Global State & CRUD Operations)
 * ==============================================================================
 * 
 * DESKRIPSI & ALUR KERJA:
 * Context ini mengelola data pasien secara sementara berbasis sesi (Session-Based):
 * 
 * 1. Penyimpanan Data Sementara (Session Storage):
 *    - Seluruh data klien rehabilitasi disimpan di `sessionStorage`
 *      dengan kunci `'simRehabPatients'`.
 *    - Data hanya tersimpan selama browser/tab aktif dalam sesi tersebut.
 *    - Ketika server dimatikan, browser ditutup, atau proyek selesai,
 *      seluruh data otomatis terhapus bersih (kembali ke 0 data).
 * 
 * 2. Normalisasi & Validasi Data (Fungsi `normalizePatientList`):
 *    - Menjamin bahwa setiap data pasien memiliki 17 kolom standar resmi BNN.
 *    - Mengisi nilai default jika ada kolom yang kosong (contoh: nomor surat '-',
 *      kabupaten asal 'Buleleng', status progres 'ON GOING').
 *    - Membersihkan data nomor HP jika tidak sengaja terisi teks nama rumah sakit/instansi.
 * 
 * 3. Operasi CRUD yang Disediakan:
 *    - `patients`           : Daftar seluruh pasien yang ada di sesi saat ini.
 *    - `addPatient`         : Menambah data klien baru (Create).
 *    - `updatePatientStatus`: Memperbarui status perkembangan/rujukan klien (Update).
 *    - `deletePatient`      : Menghapus data rekam medis berdasarkan NIK (Delete).
 *    - `importPatients`     : Menggabungkan data hasil impor dari file Excel/CSV.
 *    - `clearAllPatients`   : Mengosongkan seluruh data pasien.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { defaultSeedPatients } from '../data/seedPatients';

// Membuat objek Context khusus data pasien
const PatientContext = createContext(null);

/**
 * Fungsi Normalisasi Data Pasien
 * Menyeragamkan format data dari berbagai sumber (input form maupun impor Excel)
 * agar sesuai dengan struktur resmi 17 kolom BNN.
 * @param {Array} list - Daftar data mentah pasien
 * @returns {Array} Daftar data pasien yang sudah dibersihkan dan diseragamkan
 */
function normalizePatientList(list) {
  if (!Array.isArray(list) || list.length === 0) {
    return [];
  }

  const normalized = list.map((p) => {
    const item = { ...p };

    // 1. Standarisasi Nomor Surat & Kabupaten Asal
    if (!item.nomorSurat) item.nomorSurat = '-';
    if (!item.kabupatenAsal) item.kabupatenAsal = 'Buleleng';

    // 2. Penentuan Kabupaten Rujukan Berdasarkan Instansi Tujuan
    if (!item.kabupaten) {
      if ((item.statusRawat || '').includes('Bangli') || (item.tujuanRujukan || '').includes('Bangli')) {
        item.kabupaten = 'Bangli';
      } else if ((item.statusRawat || '').includes('BNNP') || (item.tujuanRujukan || '').includes('Bali')) {
        item.kabupaten = 'Denpasar';
      } else if ((item.statusRawat || '').includes('Lido') || (item.tujuanRujukan || '').includes('Lido')) {
        item.kabupaten = 'Bogor';
      } else {
        item.kabupaten = 'Buleleng';
      }
    }

    // 3. Penentuan Nama Resmi Instansi Rujukan
    if (!item.kepada) {
      if (item.statusRawat === 'Rawat Inap RSJ Bangli' || (item.tujuanRujukan || '').includes('RSJ')) {
        item.kepada = 'UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali';
      } else if (item.statusRawat === 'Rawat Jalan BNNP Bali') {
        item.kepada = 'Kepala Badan Narkotika Nasional Provinsi Bali Cq. Kepala Bidang Rehabilitasi';
      } else if ((item.tujuanRujukan || '').includes('Lido')) {
        item.kepada = 'Balai Besar Rehabilitasi BNN Lido, Bogor';
      } else {
        item.kepada = 'Klinik Pratama BNNK Buleleng';
      }
    }

    // 4. Filter Sanitasi Nomor Telepon / HP
    const isInvalidPhone = (val) => {
      if (!val) return true;
      const s = String(val).trim().toLowerCase();
      if (s === '-' || s === '' || s === 'null' || s === 'undefined') return true;
      if (
        s.includes('rawat') ||
        s.includes('jalan') ||
        s.includes('inap') ||
        s.includes('bnn') ||
        s.includes('rsj') ||
        s.includes('lido') ||
        s.includes('klinik') ||
        s.includes('uptd') ||
        s.includes('bali') ||
        s.includes('surat') ||
        s.includes('singaraja') ||
        s.includes('buleleng') ||
        s.includes('kab')
      ) {
        return true;
      }
      return false;
    };

    if (isInvalidPhone(item.noHp)) item.noHp = '-';
    if (isInvalidPhone(item.telepon)) item.telepon = '-';
    if ((!item.noHp || item.noHp === '-') && item.telepon && !isInvalidPhone(item.telepon)) item.noHp = item.telepon;
    if ((!item.telepon || item.telepon === '-') && item.noHp && !isInvalidPhone(item.noHp)) item.telepon = item.noHp;

    // 5. Standarisasi Jenis Kelamin (Gender)
    if (!item.jenisKelamin) {
      item.jenisKelamin = (item.gender || 'laki') === 'perempuan' ? 'Perempuan' : 'Laki-Laki';
    }
    if (!item.gender) {
      item.gender = (item.jenisKelamin || '').toLowerCase().includes('p') ? 'perempuan' : 'laki';
    }

    // 6. Standarisasi Progres & Status
    if (!item.pekerjaan) item.pekerjaan = 'Tidak Bekerja';
    if (!item.statusProgres) item.statusProgres = 'ON GOING';
    if (!item.rehabKe) item.rehabKe = 'Ke-1';
    if (!item.tahunRehab) {
      item.tahunRehab = item.tglKedatangan ? item.tglKedatangan.slice(-4) : new Date().getFullYear().toString();
    }

    // 7. Format Teks Layanan untuk Tampilan Tabel & Cetak
    if (!item.layananTeks) {
      if (String(item.statusRawat || '').toLowerCase().includes('inap')) {
        const rujukanSingkat = (item.kepada || item.tujuanRujukan || '').includes('Lido')
          ? '(Balai Lido)'
          : (item.kepada || item.tujuanRujukan || '').includes('RSJ')
          ? '(RSJ Bangli)'
          : '(Rujukan)';
        item.layananTeks = `Rawat Inap\n${rujukanSingkat}`;
      } else {
        item.layananTeks = (item.statusRawat || '').includes('BNNP')
          ? 'Rawat Jalan\n(BNNP Bali)'
          : 'Rawat Jalan\n(Klinik BNNK)';
      }
    }
    return item;
  });

  return normalized;
}

/**
 * Provider Data Pasien (PatientProvider)
 * Komponen yang membungkus aplikasi agar state pasien dan fungsi CRUD dapat diakses di mana saja.
 */
export function PatientProvider({ children }) {
  // Membersihkan sisa data localStorage lama jika ada
  useEffect(() => {
    try {
      localStorage.removeItem('simRehabPatients');
    } catch (e) {}
  }, []);

  // Inisialisasi state patients dari sessionStorage (sementara per sesi)
  const [patients, setPatients] = useState(() => {
    try {
      const data = sessionStorage.getItem('simRehabPatients');
      if (!data) {
        sessionStorage.setItem('simRehabPatients', JSON.stringify([]));
        return [];
      }
      const parsed = JSON.parse(data);
      const normalized = normalizePatientList(parsed);
      sessionStorage.setItem('simRehabPatients', JSON.stringify(normalized));
      return normalized;
    } catch (e) {
      return [];
    }
  });

  /**
   * Event Listener Storage:
   * Menyelaraskan data secara otomatis jika user membuka sistem SIM-REHAB di lebih dari satu tab browser.
   */
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key === 'simRehabPatients' && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPatients(normalizePatientList(parsed));
        } catch (err) {}
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  /**
   * Fungsi untuk menyimpan dan memperbarui data pasien ke state dan sessionStorage
   */
  const saveAndSetPatients = useCallback((newPatients) => {
    setPatients(newPatients);
    sessionStorage.setItem('simRehabPatients', JSON.stringify(newPatients));
  }, []);

  /**
   * Fungsi Tambah Pasien Baru (Create)
   * Menyisipkan pasien baru di urutan paling atas daftar.
   */
  const addPatient = useCallback((newPatient) => {
    setPatients((prev) => {
      const updated = [newPatient, ...prev];
      sessionStorage.setItem('simRehabPatients', JSON.stringify(updated));
      return updated;
    });
    return newPatient;
  }, []);

  /**
   * Fungsi Hapus Pasien (Delete)
   * Menghapus rekam medis pasien berdasarkan NIK (Nomor Induk Kependudukan).
   */
  const deletePatient = useCallback((nik) => {
    setPatients((prev) => {
      const updated = prev.filter(
        (p) => String(p.nik).trim() !== String(nik).trim()
      );
      sessionStorage.setItem('simRehabPatients', JSON.stringify(updated));
      return updated;
    });
  }, []);

  /**
   * Fungsi Perbarui Status & Data Pasien (Update)
   * Memperbarui informasi perkembangan rekam medis klien berdasarkan NIK.
   */
  const updatePatientStatus = useCallback(
    (nik, updatedFields) => {
      setPatients((prev) => {
        const updated = prev.map((p) => {
          if (String(p.nik).trim() === String(nik).trim()) {
            if (typeof updatedFields === 'string') {
              return { ...p, statusProgres: updatedFields };
            }
            return { ...p, ...updatedFields };
          }
          return p;
        });
        sessionStorage.setItem('simRehabPatients', JSON.stringify(updated));
        return updated;
      });
    },
    []
  );

  /**
   * Fungsi Impor Pasien dari File Excel / CSV
   * Mendukung mode 'append' (menambah/memperbarui data) dan 'overwrite' (menimpa seluruh database).
   */
  const importPatients = useCallback((incomingList, mode = 'append') => {
    setPatients((prev) => {
      let merged = [];
      if (mode === 'overwrite') {
        merged = [...incomingList];
      } else {
        merged = [...prev];
        incomingList.forEach((newItem) => {
          const idx = merged.findIndex(
            (p) => String(p.nik).trim() === String(newItem.nik).trim()
          );
          if (idx !== -1) {
            // Jika NIK sudah ada, perbarui data yang lama
            merged[idx] = { ...merged[idx], ...newItem };
          } else {
            // Jika NIK baru, tambahkan ke list
            merged.push(newItem);
          }
        });
      }
      sessionStorage.setItem('simRehabPatients', JSON.stringify(merged));
      return merged;
    });
  }, []);

  /**
   * Fungsi Mengosongkan Seluruh Data (Clear All)
   */
  const clearAllPatients = useCallback(() => {
    setPatients([]);
    sessionStorage.setItem('simRehabPatients', JSON.stringify([]));
  }, []);

  return (
    <PatientContext.Provider
      value={{
        patients,
        addPatient,
        deletePatient,
        updatePatientStatus,
        importPatients,
        clearAllPatients,
      }}
    >
      {children}
    </PatientContext.Provider>
  );
}

/**
 * Custom Hook usePatients
 * Mempermudah komponen lain dalam mengakses data dan fungsi CRUD pasien.
 */
export function usePatients() {
  const context = useContext(PatientContext);
  if (!context) {
    throw new Error('usePatients harus digunakan di dalam PatientProvider');
  }
  return context;
}
