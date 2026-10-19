import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  MagnifyingGlass,
  Funnel,
  ArrowsClockwise,
  PencilSimple,
  Trash,
  User,
  MapPin,
  CalendarBlank,
  Users,
  Clock,
  CheckCircle,
  WarningCircle,
  Buildings,
  Phone
} from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import QuickActionModal from '../components/QuickActionModal';
import Toast from '../components/Toast';
import { usePatients } from '../context/PatientContext';
import {
  getPatientYear,
  matchPatientYear,
  matchPatientGender,
  matchPatientKecamatan,
  matchPatientLayanan,
  matchPatientRiwayat,
} from '../utils/patientUtils';
import '../styles/design-system.css';
import '../styles/monitoring-pasien.css';

export default function MonitoringPasienPage() {
  const { patients, updatePatientStatus, deletePatient } = usePatients();
  const [searchParams, setSearchParams] = useSearchParams();
  const tableContainerRef = useRef(null);

  const urlStatus = searchParams.get('status');
  const urlLayanan = searchParams.get('layanan');
  const urlTahun = searchParams.get('tahun');
  const urlKecamatan = searchParams.get('kecamatan');
  const urlGender = searchParams.get('gender');
  const urlRiwayat = searchParams.get('riwayat');
  const urlSearch = searchParams.get('search');

  const [currentFilter, setCurrentFilter] = useState(urlStatus || 'all');
  const [filterLayanan, setFilterLayanan] = useState(urlLayanan || 'all');
  const [filterTahun, setFilterTahun] = useState(urlTahun || 'all');
  const [filterKecamatan, setFilterKecamatan] = useState(urlKecamatan || 'all');
  const [filterGender, setFilterGender] = useState(urlGender || 'all');
  const [filterRiwayat, setFilterRiwayat] = useState(urlRiwayat || 'all');
  const [searchQuery, setSearchQuery] = useState(urlSearch || '');

  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    document.title = 'SIM-REHAB | Monitoring Pasien - BNNK Buleleng';
    setCurrentFilter(urlStatus || 'all');
    setFilterLayanan(urlLayanan || 'all');
    setFilterTahun(urlTahun || 'all');
    setFilterKecamatan(urlKecamatan || 'all');
    setFilterGender(urlGender || 'all');
    setFilterRiwayat(urlRiwayat || 'all');
    if (urlSearch !== null) setSearchQuery(urlSearch);
  }, [urlStatus, urlLayanan, urlTahun, urlKecamatan, urlGender, urlRiwayat, urlSearch]);

  const updateFilter = (updates) => {
    const newParams = new URLSearchParams(searchParams);

    const merged = {
      status: updates.status !== undefined ? updates.status : currentFilter,
      layanan: updates.layanan !== undefined ? updates.layanan : filterLayanan,
      tahun: updates.tahun !== undefined ? updates.tahun : filterTahun,
      kecamatan: updates.kecamatan !== undefined ? updates.kecamatan : filterKecamatan,
      gender: updates.gender !== undefined ? updates.gender : filterGender,
      riwayat: updates.riwayat !== undefined ? updates.riwayat : filterRiwayat,
      search: updates.search !== undefined ? updates.search : searchQuery,
    };

    if (updates.status !== undefined) setCurrentFilter(updates.status);
    if (updates.layanan !== undefined) setFilterLayanan(updates.layanan);
    if (updates.tahun !== undefined) setFilterTahun(updates.tahun);
    if (updates.kecamatan !== undefined) setFilterKecamatan(updates.kecamatan);
    if (updates.gender !== undefined) setFilterGender(updates.gender);
    if (updates.riwayat !== undefined) setFilterRiwayat(updates.riwayat);
    if (updates.search !== undefined) setSearchQuery(updates.search);

    Object.keys(merged).forEach((key) => {
      const val = merged[key];
      if (val && val !== 'all' && val !== 'semua' && String(val).trim() !== '') {
        newParams.set(key, val);
      } else {
        newParams.delete(key);
      }
    });

    setSearchParams(newParams, { replace: true });
  };

  const handleResetAllFilters = () => {
    setCurrentFilter('all');
    setFilterLayanan('all');
    setFilterTahun('all');
    setFilterKecamatan('all');
    setFilterGender('all');
    setFilterRiwayat('all');
    setSearchQuery('');
    setSearchParams({}, { replace: true });
  };

  const scopedPatients = useMemo(() => {
    return patients.filter((p) => {
      if (!matchPatientYear(p, filterTahun)) return false;
      if (!matchPatientKecamatan(p, filterKecamatan)) return false;
      if (!matchPatientGender(p, filterGender)) return false;
      if (!matchPatientRiwayat(p, filterRiwayat)) return false;
      if (!matchPatientLayanan(p, filterLayanan)) return false;
      return true;
    });
  }, [patients, filterTahun, filterKecamatan, filterGender, filterRiwayat, filterLayanan]);

  const countAll = scopedPatients.length;
  let countOngoing = 0;
  let countSelesai = 0;
  let countDropout = 0;

  scopedPatients.forEach((p) => {
    const st = String(p.statusProgres || 'ON GOING').toUpperCase();
    if (st.includes('DROP') || st.includes('DO')) {
      countDropout++;
    } else if (st.includes('SELESAI') || st.includes('PULIH')) {
      countSelesai++;
    } else {
      countOngoing++;
    }
  });

  const displayedPatients = useMemo(() => {
    return scopedPatients.filter((p) => {
      const st = String(p.statusProgres || 'ON GOING').toUpperCase();
      if (currentFilter === 'ongoing' && (st.includes('DROP') || st.includes('SELESAI') || st.includes('PULIH'))) {
        return false;
      }
      if (currentFilter === 'selesai' && (!st.includes('SELESAI') && !st.includes('PULIH'))) {
        return false;
      }
      if (currentFilter === 'dropout' && (!st.includes('DROP') && !st.includes('DO'))) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const str = [
          p.nama,
          p.nik,
          p.nomorSurat,
          p.kecamatan,
          p.desa,
          p.statusRawat,
          p.kepada,
          p.telepon,
          p.tahun,
        ].filter(Boolean).join(' ').toLowerCase();

        return str.includes(q);
      }

      return true;
    });
  }, [scopedPatients, currentFilter, searchQuery]);

  const handleEditClick = (p) => {
    setSelectedPatient(p);
    setIsModalOpen(true);
  };

  const handleSaveModal = (nik, updatedData) => {
    updatePatientStatus(nik, updatedData);
    setIsModalOpen(false);
    setToastMsg(`Status klien <strong>${selectedPatient?.nama || 'Klien'}</strong> berhasil diperbarui.`);
    setToastShow(true);
    setTimeout(() => setToastShow(false), 3000);
  };

  const handleDeleteClick = (p) => {
    const confirm = window.confirm(
      `Apakah Anda yakin ingin menghapus data rekam medis pasien:\n\nNama: ${p.nama}\nNIK: ${p.nik}\n\nTindakan ini tidak dapat dibatalkan.`
    );
    if (confirm) {
      deletePatient(p.nik);
      setToastMsg(`Data klien <strong>${p.nama}</strong> telah dihapus.`);
      setToastShow(true);
      setTimeout(() => setToastShow(false), 3000);
    }
  };

  const renderStatusBadge = (p) => {
    const st = String(p.statusProgres || 'ON GOING').toUpperCase();
    if (st.includes('DROP') || st.includes('DO')) {
      return (
        <span className="badge badge-dropout">
          <WarningCircle size={12} weight="fill" />
          <span>DROP OUT</span>
        </span>
      );
    }
    if (st.includes('SELESAI') || st.includes('PULIH')) {
      return (
        <span className="badge badge-completed">
          <CheckCircle size={12} weight="fill" />
          <span>SELESAI / PULIH</span>
        </span>
      );
    }
    return (
      <span className="badge badge-ongoing">
        <Clock size={12} weight="fill" />
        <span>ON GOING</span>
      </span>
    );
  };

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        <header className="page-header">
          <div className="header-left">
            <h1 className="page-title">Monitoring Pasien</h1>
            <p className="page-subtitle">
              Pusat Rekam Medis, Pemantauan Progres, &amp; Manajemen Data Klien
            </p>
          </div>
          <div className="header-right">
            <span className="date-badge">
              <Users size={15} weight="bold" />
              <span>Total Tampil: {displayedPatients.length} Klien</span>
            </span>
          </div>
        </header>

        <div className="monitoring-page-content">
          {/* Status Tabs Bar */}
          <div className="status-tabs-container">
            <button
              type="button"
              className={`status-tab-btn ${currentFilter === 'all' ? 'active' : ''}`}
              onClick={() => updateFilter({ status: 'all' })}
            >
              <Users size={16} weight="bold" />
              <span>Semua Klien</span>
              <span className="tab-counter">{countAll}</span>
            </button>

            <button
              type="button"
              className={`status-tab-btn ${currentFilter === 'ongoing' ? 'active' : ''}`}
              onClick={() => updateFilter({ status: 'ongoing' })}
            >
              <Clock size={16} weight="bold" />
              <span>On Going</span>
              <span className="tab-counter ongoing">{countOngoing}</span>
            </button>

            <button
              type="button"
              className={`status-tab-btn ${currentFilter === 'selesai' ? 'active' : ''}`}
              onClick={() => updateFilter({ status: 'selesai' })}
            >
              <CheckCircle size={16} weight="bold" />
              <span>Selesai / Pulih</span>
              <span className="tab-counter completed">{countSelesai}</span>
            </button>

            <button
              type="button"
              className={`status-tab-btn ${currentFilter === 'dropout' ? 'active' : ''}`}
              onClick={() => updateFilter({ status: 'dropout' })}
            >
              <WarningCircle size={16} weight="bold" />
              <span>Drop Out</span>
              <span className="tab-counter dropout">{countDropout}</span>
            </button>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="panel-card filter-toolbar">
            <div className="search-bar-row">
              <div className="search-input-box">
                <span className="search-icon">
                  <MagnifyingGlass size={16} weight="bold" />
                </span>
                <input
                  type="text"
                  className="form-input search-input"
                  placeholder="Cari berdasarkan Nama, NIK, No Surat, Wilayah, Status..."
                  value={searchQuery}
                  onChange={(e) => updateFilter({ search: e.target.value })}
                />
              </div>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleResetAllFilters}
                title="Kembalikan semua filter ke awal"
              >
                <ArrowsClockwise size={14} weight="bold" />
                <span>Reset</span>
              </button>
            </div>

            <div className="filter-dropdowns-row">
              <div className="mini-filter">
                <label className="filter-label">Tahun Anggaran:</label>
                <select
                  className="form-select select-sm"
                  value={filterTahun}
                  onChange={(e) => updateFilter({ tahun: e.target.value })}
                >
                  <option value="all">Semua Tahun</option>
                  <option value="2026">2026</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
              </div>

              <div className="mini-filter">
                <label className="filter-label">Layanan Rawat:</label>
                <select
                  className="form-select select-sm"
                  value={filterLayanan}
                  onChange={(e) => updateFilter({ layanan: e.target.value })}
                >
                  <option value="all">Semua Layanan</option>
                  <option value="rawat_jalan">Rawat Jalan (Klinik BNNK)</option>
                  <option value="rawat_inap">Rawat Inap (Rujukan)</option>
                </select>
              </div>

              <div className="mini-filter">
                <label className="filter-label">Kecamatan:</label>
                <select
                  className="form-select select-sm"
                  value={filterKecamatan}
                  onChange={(e) => updateFilter({ kecamatan: e.target.value })}
                >
                  <option value="all">Semua Kecamatan</option>
                  <option value="buleleng">Buleleng</option>
                  <option value="sukasada">Sukasada</option>
                  <option value="seririt">Seririt</option>
                  <option value="gerokgak">Gerokgak</option>
                  <option value="banjar">Banjar</option>
                  <option value="kubutambahan">Kubutambahan</option>
                  <option value="sawan">Sawan</option>
                  <option value="tejakula">Tejakula</option>
                  <option value="busungbiu">Busungbiu</option>
                </select>
              </div>

              <div className="mini-filter">
                <label className="filter-label">Gender:</label>
                <select
                  className="form-select select-sm"
                  value={filterGender}
                  onChange={(e) => updateFilter({ gender: e.target.value })}
                >
                  <option value="all">Semua Gender</option>
                  <option value="laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>

              <div className="mini-filter">
                <label className="filter-label">Riwayat:</label>
                <select
                  className="form-select select-sm"
                  value={filterRiwayat}
                  onChange={(e) => updateFilter({ riwayat: e.target.value })}
                >
                  <option value="all">Semua Riwayat</option>
                  <option value="ke-1">Klien Baru (Ke-1)</option>
                  <option value="relapse">Relapse / Kambuh</option>
                </select>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="panel-card table-panel" ref={tableContainerRef}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: '48px', textAlign: 'center' }}>No</th>
                    <th style={{ width: '180px' }}>No. Surat &amp; NIK</th>
                    <th>Nama &amp; Identitas Klien</th>
                    <th style={{ width: '150px' }}>Wilayah Domisili</th>
                    <th style={{ width: '190px' }}>Layanan &amp; Rujukan</th>
                    <th style={{ width: '140px', textAlign: 'center' }}>Status Progres</th>
                    <th style={{ width: '110px', textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedPatients.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="empty-table-state">
                        <div className="empty-message-wrap">
                          <Users size={36} weight="duotone" color="#94a3b8" />
                          <p className="empty-title">Tidak ada data pasien yang sesuai filter</p>
                          <p className="empty-sub">Coba ubah kata kunci pencarian atau reset filter di atas</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayedPatients.map((p, idx) => {
                      const isRel = !String(p.rehabKe || 'Ke-1').includes('1');
                      return (
                        <tr key={p.nik || idx}>
                          <td style={{ textAlign: 'center', fontWeight: 600, color: 'var(--text-muted)' }}>
                            {idx + 1}
                          </td>
                          <td>
                            <div className="cell-doc-meta">
                              <span className="doc-surat" title={p.nomorSurat || '-'}>
                                {p.nomorSurat || '-'}
                              </span>
                              <span className="doc-nik font-mono">
                                NIK: {p.nik || '-'}
                              </span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-patient-name">
                              <div className="name-row">
                                <strong className="patient-name">{p.nama}</strong>
                                {isRel ? (
                                  <span className="badge badge-relapse" title="Klien Pernah Relapse">
                                    {p.rehabKe}
                                  </span>
                                ) : (
                                  <span className="badge badge-outpatient">Ke-1</span>
                                )}
                              </div>
                              <div className="patient-submeta">
                                <span>{p.gender === 'L' || p.gender === 'laki' ? 'Laki-laki' : 'Perempuan'}</span>
                                <span>&bull;</span>
                                <span>{p.umur || '25 Thn'}</span>
                                <span>&bull;</span>
                                <span>{p.pekerjaan || 'Klien'}</span>
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="cell-location">
                              <span className="loc-desa">{p.desa || '-'}</span>
                              <span className="loc-kec">Kec. {p.kecamatan || '-'}</span>
                            </div>
                          </td>
                          <td>
                            <div className="cell-service">
                              <span className="service-title">{p.statusRawat || 'Rawat Jalan'}</span>
                              <span className="service-ref">{p.kepada || 'Klinik BNNK'}</span>
                            </div>
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            {renderStatusBadge(p)}
                          </td>
                          <td style={{ textAlign: 'center' }}>
                            <div className="action-buttons-group">
                              <button
                                type="button"
                                className="btn-table-action btn-edit"
                                title="Perbarui Status & Asesmen"
                                onClick={() => handleEditClick(p)}
                              >
                                <PencilSimple size={15} weight="bold" />
                                <span>Ubah</span>
                              </button>
                              <button
                                type="button"
                                className="btn-table-action btn-delete"
                                title="Hapus Rekam Medis"
                                onClick={() => handleDeleteClick(p)}
                              >
                                <Trash size={15} weight="bold" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Quick Action Modal */}
        <QuickActionModal
          isOpen={isModalOpen}
          patient={selectedPatient}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveModal}
        />

        {/* Toast Notifikasi */}
        <Toast show={toastShow} message={toastMsg} />
      </main>
    </div>
  );
}
