import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserPlus,
  IdentificationCard,
  FileText,
  WarningCircle,
  FloppyDiskBack,
  ArrowCounterClockwise,
  CalendarBlank,
  Buildings,
  Phone,
  MapPin,
  ClockAfternoon,
  Info
} from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import { usePatients } from '../context/PatientContext';
import { desaBuleleng, kecamatanList } from '../data/bulelengData';
import '../styles/design-system.css';
import '../styles/input-pasien.css';

const INSTANSI_RUJUKAN_LIST = [
  {
    name: 'Klinik Pratama BNNK Buleleng',
    kabupaten: 'Buleleng',
    defaultStatus: 'Rawat Jalan Klinik Pratama BNNK Buleleng',
  },
  {
    name: 'UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali',
    kabupaten: 'Bangli',
    defaultStatus: 'Rawat Inap RSJ Bangli',
  },
  {
    name: 'Kepala Badan Narkotika Nasional Provinsi Bali Cq. Kepala Bidang Rehabilitasi',
    kabupaten: 'Denpasar',
    defaultStatus: 'Rawat Jalan BNNP Bali',
  },
  {
    name: 'Balai Besar Rehabilitasi BNN Lido, Bogor',
    kabupaten: 'Bogor',
    defaultStatus: 'Rawat Inap Balai Lido',
  },
  {
    name: 'Balai Rehabilitasi BNN Badoka, Makassar',
    kabupaten: 'Makassar',
    defaultStatus: 'Rawat Inap Balai Badoka',
  },
  {
    name: 'Balai Rehabilitasi BNN Tanah Merah, Samarinda',
    kabupaten: 'Samarinda',
    defaultStatus: 'Rawat Inap Balai Tanah Merah',
  },
  {
    name: 'Loka Rehabilitasi BNN Batam',
    kabupaten: 'Batam',
    defaultStatus: 'Rawat Inap Loka Batam',
  },
];

const PEKERJAAN_LIST = [
  'Tidak Bekerja',
  'Buruh',
  'Wiraswasta',
  'Swasta',
  'Petani / Pekebun',
  'Pedagang',
  'Pegawai Negeri Sipil (PNS)',
  'TNI / POLRI',
  'Pelajar / Mahasiswa',
  'Ibu Rumah Tangga',
  'Lainnya',
];

export default function InputPasienPage() {
  const navigate = useNavigate();
  const { patients, addPatient } = usePatients();

  // 1. Identitas Klien
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [tglLahir, setTglLahir] = useState('');
  const [umur, setUmur] = useState('-');
  const [gender, setGender] = useState('laki');
  const [telepon, setTelepon] = useState('');
  const [pekerjaan, setPekerjaan] = useState('Tidak Bekerja');
  const [kecamatan, setKecamatan] = useState('buleleng');
  const [desa, setDesa] = useState('singaraja');
  const [kabupatenAsal, setKabupatenAsal] = useState('Buleleng');
  const [alamat, setAlamat] = useState('');

  // 2. Administrasi & Rujukan
  const [nomorSurat, setNomorSurat] = useState('-');
  const [tglKedatanganDate, setTglKedatanganDate] = useState(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });
  const [tahunRehab, setTahunRehab] = useState('2026');
  const [kepada, setKepada] = useState('Klinik Pratama BNNK Buleleng');
  const [kabupatenRujukan, setKabupatenRujukan] = useState('Buleleng');
  const [statusRawat, setStatusRawat] = useState('Rawat Jalan Klinik Pratama BNNK Buleleng');
  const [keterangan, setKeterangan] = useState('');

  // Toast
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    document.title = 'SIM-REHAB | Input Pasien Baru - BNNK Buleleng';
  }, []);

  const handleKepadaChange = (val) => {
    setKepada(val);
    const match = INSTANSI_RUJUKAN_LIST.find((item) => item.name === val);
    if (match) {
      setKabupatenRujukan(match.kabupaten);
      setStatusRawat(match.defaultStatus);
    }
  };

  // Deteksi Relapse
  const existingHistory = useMemo(() => {
    const trimmedNik = nik.trim();
    const trimmedNama = nama.trim().toLowerCase();

    if (!trimmedNik && !trimmedNama) return [];

    return patients.filter((p) => {
      const matchNik =
        trimmedNik.length >= 8 &&
        String(p.nik || '').trim() === trimmedNik;
      const matchNama =
        trimmedNama.length >= 3 &&
        String(p.nama || '').trim().toLowerCase() === trimmedNama;
      return matchNik || matchNama;
    });
  }, [patients, nik, nama]);

  const isRelapse = existingHistory.length > 0;

  // Hitung Umur Otomatis
  useEffect(() => {
    if (!tglLahir) {
      setUmur('-');
      return;
    }
    const birthDate = new Date(tglLahir);
    if (isNaN(birthDate.getTime())) {
      setUmur('-');
      return;
    }
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    setUmur(age >= 0 ? `${age} Tahun` : '-');
  }, [tglLahir]);

  // Dependent dropdown Desa
  const desaOptions = useMemo(() => {
    return desaBuleleng[kecamatan] || [];
  }, [kecamatan]);

  useEffect(() => {
    if (desaOptions.length > 0) {
      setDesa(desaOptions[0].val);
    }
  }, [desaOptions]);

  const handleResetForm = () => {
    setNik('');
    setNama('');
    setTglLahir('');
    setUmur('-');
    setGender('laki');
    setTelepon('');
    setPekerjaan('Tidak Bekerja');
    setKecamatan('buleleng');
    setDesa('singaraja');
    setKabupatenAsal('Buleleng');
    setAlamat('');
    setNomorSurat('-');
    setTahunRehab('2026');
    setKepada('Klinik Pratama BNNK Buleleng');
    setKabupatenRujukan('Buleleng');
    setStatusRawat('Rawat Jalan Klinik Pratama BNNK Buleleng');
    setKeterangan('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!nama.trim()) {
      alert('Nama Pasien wajib diisi!');
      return;
    }
    if (!nik.trim()) {
      alert('NIK Pasien wajib diisi!');
      return;
    }

    const kecLabel =
      kecamatanList.find((k) => k.val === kecamatan)?.label || kecamatan;
    const desaLabel = desaOptions.find((d) => d.val === desa)?.label || desa;

    let dateFormatted = tglKedatanganDate;
    if (tglKedatanganDate) {
      const parts = tglKedatanganDate.split('-');
      if (parts.length === 3) {
        dateFormatted = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }

    let rawatType = 'Rawat Jalan\n(Klinik BNNK)';
    if (statusRawat.toLowerCase().includes('inap')) {
      const rujukanSingkat = kepada.includes('Lido')
        ? '(Balai Lido)'
        : kepada.includes('RSJ')
        ? '(RSJ Bangli)'
        : kepada.includes('Badoka')
        ? '(Balai Badoka)'
        : `(${kabupatenRujukan})`;
      rawatType = `Rawat Inap\n${rujukanSingkat}`;
    }

    const newPatientData = {
      nik: nik.trim(),
      nama: nama.trim().toUpperCase(),
      tglLahir: tglLahir || '-',
      umur: umur !== '-' ? umur : '25 Tahun',
      gender: gender === 'laki' ? 'L' : 'P',
      jenisKelamin: gender === 'laki' ? 'L' : 'P',
      telepon: telepon.trim() || '-',
      pekerjaan: pekerjaan,
      kecamatan: kecLabel,
      desa: desaLabel,
      kabupatenAsal: kabupatenAsal,
      alamat: alamat.trim() || `${desaLabel}, Kec. ${kecLabel}`,
      nomorSurat: nomorSurat.trim() || '-',
      tglKedatangan: dateFormatted,
      tglKedatanganRaw: tglKedatanganDate,
      tahun: tahunRehab,
      kepada: kepada,
      tujuanRujukan: kepada,
      kabupaten: kabupatenRujukan,
      statusRawat: statusRawat,
      layananTeks: rawatType,
      statusProgres: 'ON GOING',
      rehabKe: isRelapse ? `Ke-${existingHistory.length + 1}` : 'Ke-1',
      keterangan: keterangan.trim() || 'Klien registrasi baru klinik',
    };

    addPatient(newPatientData);

    setToastMsg(`Data klien <strong>${newPatientData.nama}</strong> berhasil disimpan ke SIM-REHAB.`);
    setToastShow(true);

    setTimeout(() => {
      setToastShow(false);
      navigate('/monitoring-pasien?status=ongoing');
    }, 1500);
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1 className="page-title">Input Pasien Baru</h1>
            <p className="page-subtitle">
              Formulir Registrasi, Rekam Medis &amp; Asesmen Klien BNNK Buleleng
            </p>
          </div>
          <div className="header-right">
            <span className="date-badge">
              <CalendarBlank size={15} weight="bold" />
              <span>Tahun Program: {tahunRehab}</span>
            </span>
          </div>
        </header>

        <div className="form-page-content">
          {/* Relapse Alert Notice if detected */}
          {isRelapse && (
            <div className="alert-relapse-box">
              <WarningCircle size={24} weight="fill" color="#b91c1c" />
              <div className="alert-relapse-text">
                <strong>Terdeteksi Riwayat Klien Sebelumnya (Relapse / Kambuh):</strong>
                <p>
                  Klien dengan NIK/Nama ini sudah pernah terdaftar sebanyak {existingHistory.length} kali di SIM-REHAB. 
                  Sistem otomatis menandai kedatangan ini sebagai <em>Rehabilitasi Ke-{existingHistory.length + 1}</em>.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="intake-form-grid" noValidate>
            {/* Panel 1: Data Identitas Klien */}
            <div className="panel-card form-panel">
              <div className="panel-card-header">
                <h2 className="panel-card-title">
                  <IdentificationCard size={18} weight="bold" color="#1d4ed8" />
                  <span>1. Data Identitas &amp; Demografi Klien</span>
                </h2>
              </div>

              <div className="panel-card-body form-body-grid">
                <div className="form-group">
                  <label htmlFor="nik" className="form-label">
                    Nomor Induk Kependudukan (NIK 16 Digit) <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="nik"
                    className="form-input font-mono"
                    placeholder="Contoh: 5108051405900001"
                    maxLength={16}
                    value={nik}
                    onChange={(e) => setNik(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="nama" className="form-label">
                    Nama Lengkap Pasien <span className="req">*</span>
                  </label>
                  <input
                    type="text"
                    id="nama"
                    className="form-input"
                    placeholder="Masukkan nama lengkap sesuai KTP..."
                    value={nama}
                    onChange={(e) => setNama(e.target.value)}
                    required
                  />
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="tglLahir" className="form-label">
                      Tanggal Lahir
                    </label>
                    <input
                      type="date"
                      id="tglLahir"
                      className="form-input"
                      value={tglLahir}
                      onChange={(e) => setTglLahir(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Umur (Otomatis)</label>
                    <input
                      type="text"
                      className="form-input"
                      value={umur}
                      readOnly
                      disabled
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="gender" className="form-label">
                      Jenis Kelamin
                    </label>
                    <select
                      id="gender"
                      className="form-select"
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                    >
                      <option value="laki">Laki-laki (L)</option>
                      <option value="perempuan">Perempuan (P)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="telepon" className="form-label">
                      Nomor Telepon / WhatsApp
                    </label>
                    <input
                      type="text"
                      id="telepon"
                      className="form-input"
                      placeholder="081234567890"
                      value={telepon}
                      onChange={(e) => setTelepon(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="pekerjaan" className="form-label">
                    Pekerjaan Klien
                  </label>
                  <select
                    id="pekerjaan"
                    className="form-select"
                    value={pekerjaan}
                    onChange={(e) => setPekerjaan(e.target.value)}
                  >
                    {PEKERJAAN_LIST.map((pek) => (
                      <option key={pek} value={pek}>
                        {pek}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="kecamatan" className="form-label">
                      Kecamatan Domisili (Buleleng)
                    </label>
                    <select
                      id="kecamatan"
                      className="form-select"
                      value={kecamatan}
                      onChange={(e) => setKecamatan(e.target.value)}
                    >
                      {kecamatanList.map((k) => (
                        <option key={k.val} value={k.val}>
                          Kecamatan {k.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="desa" className="form-label">
                      Desa / Kelurahan
                    </label>
                    <select
                      id="desa"
                      className="form-select"
                      value={desa}
                      onChange={(e) => setDesa(e.target.value)}
                    >
                      {desaOptions.map((d) => (
                        <option key={d.val} value={d.val}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="alamat" className="form-label">
                    Alamat Lengkap / Dusun / Banjar
                  </label>
                  <input
                    type="text"
                    id="alamat"
                    className="form-input"
                    placeholder="Contoh: Jl. Ahmad Yani No. 12, Banjar Tegal..."
                    value={alamat}
                    onChange={(e) => setAlamat(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Panel 2: Administrasi & Rujukan */}
            <div className="panel-card form-panel">
              <div className="panel-card-header">
                <h2 className="panel-card-title">
                  <FileText size={18} weight="bold" color="#0b1f3a" />
                  <span>2. Administrasi Rujukan &amp; Program Rawatan</span>
                </h2>
              </div>

              <div className="panel-card-body form-body-grid">
                <div className="form-row-2">
                  <div className="form-group">
                    <label htmlFor="nomorSurat" className="form-label">
                      Nomor Surat / Register BNN
                    </label>
                    <input
                      type="text"
                      id="nomorSurat"
                      className="form-input"
                      placeholder="Contoh: R/04/II/Ka/RH.00/2026/BNNK-BLL"
                      value={nomorSurat}
                      onChange={(e) => setNomorSurat(e.target.value)}
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="tglKedatangan" className="form-label">
                      Tanggal Kedatangan Resmi
                    </label>
                    <input
                      type="date"
                      id="tglKedatangan"
                      className="form-input"
                      value={tglKedatanganDate}
                      onChange={(e) => setTglKedatanganDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="tahunRehab" className="form-label">
                    Tahun Anggaran Program
                  </label>
                  <select
                    id="tahunRehab"
                    className="form-select"
                    value={tahunRehab}
                    onChange={(e) => setTahunRehab(e.target.value)}
                  >
                    <option value="2026">Tahun 2026</option>
                    <option value="2025">Tahun 2025</option>
                    <option value="2024">Tahun 2024</option>
                    <option value="2023">Tahun 2023</option>
                    <option value="2022">Tahun 2022</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="kepada" className="form-label">
                    Kepada / Instansi Tujuan Rujukan
                  </label>
                  <select
                    id="kepada"
                    className="form-select"
                    value={kepada}
                    onChange={(e) => handleKepadaChange(e.target.value)}
                  >
                    {INSTANSI_RUJUKAN_LIST.map((ins) => (
                      <option key={ins.name} value={ins.name}>
                        {ins.name} ({ins.kabupaten})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="statusRawat" className="form-label">
                    Status Rawatan
                  </label>
                  <select
                    id="statusRawat"
                    className="form-select"
                    value={statusRawat}
                    onChange={(e) => setStatusRawat(e.target.value)}
                  >
                    <option value="Rawat Jalan Klinik Pratama BNNK Buleleng">
                      Rawat Jalan Klinik Pratama BNNK Buleleng
                    </option>
                    <option value="Rawat Inap RSJ Bangli">
                      Rawat Inap RSJ Bangli
                    </option>
                    <option value="Rawat Jalan BNNP Bali">
                      Rawat Jalan BNNP Bali
                    </option>
                    <option value="Rawat Inap Balai Lido">
                      Rawat Inap Balai Besar Lido, Bogor
                    </option>
                    <option value="Rawat Inap Balai Badoka">
                      Rawat Inap Balai Badoka, Makassar
                    </option>
                    <option value="Rawat Inap Balai Tanah Merah">
                      Rawat Inap Balai Tanah Merah, Samarinda
                    </option>
                    <option value="Rawat Inap Loka Batam">
                      Rawat Inap Loka Rehabilitasi Batam
                    </option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="keterangan" className="form-label">
                    Catatan Asesmen / Konseling Awal
                  </label>
                  <textarea
                    id="keterangan"
                    className="form-textarea"
                    rows="4"
                    placeholder="Tuliskan ringkasan asesmen klinis awal, latar belakang klien, dan rencana intervensi..."
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                  />
                </div>

                {/* Form Action Controls */}
                <div className="form-action-bar">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleResetForm}
                  >
                    <ArrowCounterClockwise size={15} weight="bold" />
                    <span>Reset Form</span>
                  </button>

                  <button type="submit" className="btn btn-primary btn-lg">
                    <FloppyDiskBack size={18} weight="bold" />
                    <span>Simpan Rekam Medis Klien</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>

        <Toast show={toastShow} message={toastMsg} />
      </main>
    </div>
  );
}
