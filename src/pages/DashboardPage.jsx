import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CalendarBlank,
  Users,
  Heartbeat,
  Hospital,
  CheckCircle,
  WarningCircle,
  Funnel,
  ArrowRight,
  ChartPie,
  ChartBar,
  UserPlus,
  FileArrowDown,
  ArrowsClockwise
} from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import { usePatients } from '../context/PatientContext';
import {
  getPatientYear,
  matchPatientYear,
  matchPatientGender,
  matchPatientKecamatan,
  matchPatientStatus,
} from '../utils/patientUtils';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  DoughnutController,
} from 'chart.js';
import '../styles/design-system.css';
import '../styles/dashboard.css';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  BarController,
  DoughnutController
);

export default function DashboardPage() {
  const { patients } = usePatients();
  const navigate = useNavigate();

  const [filterTahun, setFilterTahun] = useState('2026');
  const [filterGender, setFilterGender] = useState('semua');
  const [filterKecamatan, setFilterKecamatan] = useState('semua');
  const [filterStatus, setFilterStatus] = useState('semua');

  const donutCanvasRef = useRef(null);
  const barCanvasRef = useRef(null);
  const donutChartRef = useRef(null);
  const barChartRef = useRef(null);

  useEffect(() => {
    document.title = 'SIM-REHAB | Dashboard Utama - BNNK Buleleng';
  }, []);

  const currentDateStr = useMemo(() => {
    const now = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return now.toLocaleDateString('id-ID', options);
  }, []);

  const filteredPatients = useMemo(() => {
    return patients.filter((p) => {
      if (!matchPatientYear(p, filterTahun)) return false;
      if (!matchPatientGender(p, filterGender)) return false;
      if (!matchPatientKecamatan(p, filterKecamatan)) return false;
      if (!matchPatientStatus(p, filterStatus)) return false;
      return true;
    });
  }, [patients, filterTahun, filterGender, filterKecamatan, filterStatus]);

  const statTotal = filteredPatients.length;
  let statRawatJalan = 0;
  let statRawatInap = 0;
  let statSelesai = 0;
  let statDropout = 0;

  filteredPatients.forEach((p) => {
    const stProgres = String(p.statusProgres || 'ON GOING').toUpperCase().trim();
    const isDO = stProgres.includes('DROP') || stProgres.includes('DO');
    const isSelesai = stProgres.includes('SELESAI') || stProgres.includes('PULIH');
    const isRawatInap = String(p.statusRawat || '').toLowerCase().includes('inap');

    if (isDO) {
      statDropout++;
    } else if (isSelesai) {
      statSelesai++;
    } else if (isRawatInap) {
      statRawatInap++;
    } else {
      statRawatJalan++;
    }
  });

  const countLaki = filteredPatients.filter((p) => {
    const g = (p.gender || p.jenisKelamin || 'laki').toLowerCase();
    return !g.includes('perempuan') && !g.startsWith('p');
  }).length;
  const countPerempuan = filteredPatients.filter((p) => {
    const g = (p.gender || p.jenisKelamin || '').toLowerCase();
    return g.includes('perempuan') || g.startsWith('p');
  }).length;
  const totalGender = countLaki + countPerempuan;
  const pctLaki = totalGender === 0 ? 0 : Math.round((countLaki / totalGender) * 100);
  const pctPerempuan = totalGender === 0 ? 0 : 100 - pctLaki;

  const countKe1 = filteredPatients.filter((p) =>
    String(p.rehabKe || 'Ke-1').includes('1')
  ).length;
  const countRelapse = filteredPatients.filter(
    (p) => !String(p.rehabKe || 'Ke-1').includes('1')
  ).length;
  const totalRiwayat = countKe1 + countRelapse;
  const pctKe1 =
    totalRiwayat === 0 ? 0 : Math.round((countKe1 / totalRiwayat) * 100);
  const pctRelapse = totalRiwayat === 0 ? 0 : 100 - pctKe1;

  const kecList = [
    'Buleleng',
    'Sukasada',
    'Seririt',
    'Gerokgak',
    'Banjar',
    'Kubutambahan',
    'Sawan',
    'Tejakula',
    'Busungbiu',
  ];

  const kecCounts = useMemo(() => {
    const map = {};
    kecList.forEach((k) => (map[k] = 0));
    filteredPatients.forEach((p) => {
      const kec = String(p.kecamatan || '').trim();
      const match = kecList.find(
        (k) => k.toLowerCase() === kec.toLowerCase()
      );
      if (match) map[match]++;
      else if (kec) {
        map['Buleleng'] = (map['Buleleng'] || 0) + 1;
      }
    });
    return map;
  }, [filteredPatients]);

  const handleCardClick = (filterType, val) => {
    const params = new URLSearchParams();
    if (filterTahun !== 'semua') params.set('tahun', filterTahun);
    if (filterGender !== 'semua') params.set('gender', filterGender);
    if (filterKecamatan !== 'semua') params.set('kecamatan', filterKecamatan);

    if (filterType === 'status') {
      params.set('status', val);
    } else if (filterType === 'layanan') {
      params.set('layanan', val);
    }
    navigate(`/monitoring-pasien?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setFilterTahun('2026');
    setFilterGender('semua');
    setFilterKecamatan('semua');
    setFilterStatus('semua');
  };

  // Render Donut Chart
  useEffect(() => {
    if (!donutCanvasRef.current) return;
    if (donutChartRef.current) donutChartRef.current.destroy();

    const ctx = donutCanvasRef.current.getContext('2d');
    const dataValues = [countLaki, countPerempuan];

    donutChartRef.current = new ChartJS(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Laki-laki', 'Perempuan'],
        datasets: [
          {
            data: dataValues.every((v) => v === 0) ? [1, 0] : dataValues,
            backgroundColor: ['#1d4ed8', '#ec4899'],
            borderColor: '#ffffff',
            borderWidth: 2,
            hoverOffset: 4,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: function (ctx) {
                const total = countLaki + countPerempuan;
                if (total === 0) return ' Tidak ada data';
                const val = ctx.raw || 0;
                const pct = Math.round((val / total) * 100);
                return ` ${ctx.label}: ${val} Klien (${pct}%)`;
              },
            },
          },
        },
      },
    });

    return () => {
      if (donutChartRef.current) donutChartRef.current.destroy();
    };
  }, [countLaki, countPerempuan]);

  // Render Bar Chart
  useEffect(() => {
    if (!barCanvasRef.current) return;
    if (barChartRef.current) barChartRef.current.destroy();

    const ctx = barCanvasRef.current.getContext('2d');
    const labels = kecList;
    const data = labels.map((k) => kecCounts[k] || 0);

    barChartRef.current = new ChartJS(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Jumlah Klien',
            data,
            backgroundColor: '#0b1f3a',
            hoverBackgroundColor: '#2563eb',
            borderRadius: 4,
            maxBarThickness: 36,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.raw} Klien terdaftar`,
            },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              precision: 0,
              font: { size: 11, family: 'Inter, sans-serif' },
              color: '#64748b',
            },
            grid: {
              color: '#e2e8f0',
            },
          },
          x: {
            ticks: {
              font: { size: 11, family: 'Inter, sans-serif' },
              color: '#334155',
            },
            grid: { display: false },
          },
        },
        onClick: (event, elements) => {
          if (elements.length > 0) {
            const idx = elements[0].index;
            const clickedKec = labels[idx];
            const params = new URLSearchParams();
            if (filterTahun !== 'semua') params.set('tahun', filterTahun);
            params.set('kecamatan', clickedKec.toLowerCase());
            navigate(`/monitoring-pasien?${params.toString()}`);
          }
        },
      },
    });

    return () => {
      if (barChartRef.current) barChartRef.current.destroy();
    };
  }, [kecCounts, filterTahun, navigate]);

  return (
    <div className="app-layout">
      <Sidebar />

      <main className="main-content">
        {/* Header Bar */}
        <header className="page-header">
          <div className="header-left">
            <h1 className="page-title">Dashboard Utama &amp; Statistik</h1>
            <p className="page-subtitle">
              Sistem Informasi Administrasi Pasien Rehabilitasi BNNK Buleleng
            </p>
          </div>
          <div className="header-right">
            <span className="date-badge">
              <CalendarBlank size={15} weight="bold" />
              <span>{currentDateStr}</span>
            </span>
          </div>
        </header>

        <div className="dashboard-content">
          {/* Toolbar Filter */}
          <section className="filter-card">
            <div className="filter-title-row">
              <span className="filter-heading">
                <Funnel size={16} weight="bold" />
                <span>Filter Data Dashboard</span>
              </span>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleResetFilters}
              >
                <ArrowsClockwise size={13} weight="bold" />
                <span>Reset Filter</span>
              </button>
            </div>

            <div className="filter-controls-grid">
              <div className="filter-field">
                <label htmlFor="filterTahun" className="form-label">
                  Tahun Anggaran
                </label>
                <select
                  id="filterTahun"
                  className="form-select"
                  value={filterTahun}
                  onChange={(e) => setFilterTahun(e.target.value)}
                >
                  <option value="semua">Semua Tahun (2018–2026)</option>
                  <option value="2026">Tahun 2026 (Aktif)</option>
                  <option value="2025">Tahun 2025</option>
                  <option value="2024">Tahun 2024</option>
                  <option value="2023">Tahun 2023</option>
                  <option value="2022">Tahun 2022</option>
                  <option value="2021">Tahun 2021</option>
                  <option value="2020">Tahun 2020</option>
                  <option value="2019">Tahun 2019</option>
                  <option value="2018">Tahun 2018</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="filterGender" className="form-label">
                  Jenis Kelamin
                </label>
                <select
                  id="filterGender"
                  className="form-select"
                  value={filterGender}
                  onChange={(e) => setFilterGender(e.target.value)}
                >
                  <option value="semua">Semua Gender</option>
                  <option value="laki">Laki-laki</option>
                  <option value="perempuan">Perempuan</option>
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="filterKecamatan" className="form-label">
                  Kecamatan (Buleleng)
                </label>
                <select
                  id="filterKecamatan"
                  className="form-select"
                  value={filterKecamatan}
                  onChange={(e) => setFilterKecamatan(e.target.value)}
                >
                  <option value="semua">Semua Kecamatan (9 Wilayah)</option>
                  {kecList.map((k) => (
                    <option key={k} value={k.toLowerCase()}>
                      Kecamatan {k}
                    </option>
                  ))}
                </select>
              </div>

              <div className="filter-field">
                <label htmlFor="filterStatus" className="form-label">
                  Status Rawatan
                </label>
                <select
                  id="filterStatus"
                  className="form-select"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="semua">Semua Status Rawat</option>
                  <option value="rawat_jalan">Rawat Jalan (Klinik BNNK)</option>
                  <option value="rawat_inap">Rawat Inap (Rujukan Balai/RSJ)</option>
                  <option value="selesai">Selesai / Pulih</option>
                  <option value="dropout">Drop Out (DO)</option>
                </select>
              </div>
            </div>
          </section>

          {/* 5 Stat Cards */}
          <section className="stats-grid">
            <div
              className="stat-card card-total"
              onClick={() => handleCardClick('status', 'all')}
              title="Klik untuk melihat seluruh data pasien"
            >
              <div className="stat-card-top">
                <span className="stat-label">Total Klien Terdaftar</span>
                <span className="stat-icon icon-total">
                  <Users size={20} weight="bold" />
                </span>
              </div>
              <div className="stat-value">{statTotal}</div>
              <div className="stat-foot">
                <span>Filter aktif: {filterTahun === 'semua' ? '2018–2026' : filterTahun}</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>

            <div
              className="stat-card card-outpatient"
              onClick={() => handleCardClick('layanan', 'rawat_jalan')}
              title="Klik untuk memfilter Rawat Jalan"
            >
              <div className="stat-card-top">
                <span className="stat-label">Rawat Jalan (Klinik BNNK)</span>
                <span className="stat-icon icon-outpatient">
                  <Heartbeat size={20} weight="bold" />
                </span>
              </div>
              <div className="stat-value">{statRawatJalan}</div>
              <div className="stat-foot">
                <span>Klinik Pratama BNNK</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>

            <div
              className="stat-card card-inpatient"
              onClick={() => handleCardClick('layanan', 'rawat_inap')}
              title="Klik untuk memfilter Rawat Inap"
            >
              <div className="stat-card-top">
                <span className="stat-label">Rawat Inap (Rujukan)</span>
                <span className="stat-icon icon-inpatient">
                  <Hospital size={20} weight="bold" />
                </span>
              </div>
              <div className="stat-value">{statRawatInap}</div>
              <div className="stat-foot">
                <span>RSJ / Balai Besar BNN</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>

            <div
              className="stat-card card-completed"
              onClick={() => handleCardClick('status', 'selesai')}
              title="Klik untuk memfilter Selesai/Pulih"
            >
              <div className="stat-card-top">
                <span className="stat-label">Selesai / Pulih</span>
                <span className="stat-icon icon-completed">
                  <CheckCircle size={20} weight="bold" />
                </span>
              </div>
              <div className="stat-value">{statSelesai}</div>
              <div className="stat-foot">
                <span>Lulus Program Rawatan</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>

            <div
              className="stat-card card-dropout"
              onClick={() => handleCardClick('status', 'dropout')}
              title="Klik untuk memfilter Drop Out"
            >
              <div className="stat-card-top">
                <span className="stat-label">Drop Out (DO)</span>
                <span className="stat-icon icon-dropout">
                  <WarningCircle size={20} weight="bold" />
                </span>
              </div>
              <div className="stat-value">{statDropout}</div>
              <div className="stat-foot">
                <span>Putus Kontak / Mangkir</span>
                <ArrowRight size={14} weight="bold" />
              </div>
            </div>
          </section>

          {/* Visualisasi Grafik */}
          <section className="charts-grid">
            {/* Chart 1: Demografi & Riwayat */}
            <div className="panel-card chart-panel">
              <div className="panel-card-header">
                <h3 className="panel-card-title">
                  <ChartPie size={18} weight="bold" color="#2563eb" />
                  <span>Distribusi Demografi &amp; Riwayat Klien</span>
                </h3>
              </div>
              <div className="panel-card-body">
                <div className="donut-wrapper">
                  <div className="donut-canvas-container">
                    <canvas ref={donutCanvasRef} />
                  </div>
                  <div className="donut-legends">
                    <div className="legend-group">
                      <span className="legend-group-title">Jenis Kelamin</span>
                      <div className="legend-row">
                        <span className="legend-dot dot-male" />
                        <span className="legend-label">Laki-laki:</span>
                        <strong className="legend-val">{countLaki} ({pctLaki}%)</strong>
                      </div>
                      <div className="legend-row">
                        <span className="legend-dot dot-female" />
                        <span className="legend-label">Perempuan:</span>
                        <strong className="legend-val">{countPerempuan} ({pctPerempuan}%)</strong>
                      </div>
                    </div>

                    <div className="legend-group" style={{ marginTop: '14px' }}>
                      <span className="legend-group-title">Riwayat Kedatangan</span>
                      <div className="legend-row">
                        <span className="legend-dot dot-new" />
                        <span className="legend-label">Klien Baru (Ke-1):</span>
                        <strong className="legend-val">{countKe1} ({pctKe1}%)</strong>
                      </div>
                      <div className="legend-row">
                        <span className="legend-dot dot-relapse" />
                        <span className="legend-label">Relapse (Kambuh):</span>
                        <strong className="legend-val">{countRelapse} ({pctRelapse}%)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chart 2: Sebaran Kecamatan */}
            <div className="panel-card chart-panel">
              <div className="panel-card-header">
                <h3 className="panel-card-title">
                  <ChartBar size={18} weight="bold" color="#0b1f3a" />
                  <span>Sebaran Klien di 9 Kecamatan Kab. Buleleng</span>
                </h3>
                <span className="chart-hint-badge">Klik batang untuk filter</span>
              </div>
              <div className="panel-card-body">
                <div className="bar-canvas-container">
                  <canvas ref={barCanvasRef} />
                </div>
              </div>
            </div>
          </section>

          {/* Quick Nav Action Strip */}
          <section className="dashboard-shortcuts">
            <div className="shortcut-card">
              <div className="shortcut-icon">
                <UserPlus size={22} weight="bold" />
              </div>
              <div className="shortcut-text">
                <strong className="shortcut-title">Input Pasien Baru</strong>
                <p className="shortcut-desc">Registrasi &amp; asesmen klien rehabilitasi baru</p>
              </div>
              <Link to="/input-pasien" className="btn btn-secondary btn-sm">
                <span>Buka Formulir</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>

            <div className="shortcut-card">
              <div className="shortcut-icon">
                <Users size={22} weight="bold" />
              </div>
              <div className="shortcut-text">
                <strong className="shortcut-title">Monitoring Pasien</strong>
                <p className="shortcut-desc">Tabel rekam medis, pencarian, dan update status</p>
              </div>
              <Link to="/monitoring-pasien" className="btn btn-secondary btn-sm">
                <span>Buka Tabel</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>

            <div className="shortcut-card">
              <div className="shortcut-icon">
                <FileArrowDown size={22} weight="bold" />
              </div>
              <div className="shortcut-text">
                <strong className="shortcut-title">Ekspor / Impor Data</strong>
                <p className="shortcut-desc">Ekspor dokumen resmi Excel/PDF &amp; impor data</p>
              </div>
              <Link to="/ekspor-impor" className="btn btn-secondary btn-sm">
                <span>Kelola Data</span>
                <ArrowRight size={13} weight="bold" />
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
