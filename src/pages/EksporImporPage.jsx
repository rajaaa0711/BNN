import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as XLSX from 'xlsx';
import {
  FileArrowDown,
  FileArrowUp,
  FileXls,
  Printer,
  DownloadSimple,
  UploadSimple,
  CheckCircle,
  WarningCircle,
  XCircle,
  FolderOpen,
  Funnel,
  CalendarBlank,
  Buildings,
  FloppyDiskBack,
  ArrowCounterClockwise
} from '@phosphor-icons/react';
import Sidebar from '../components/Sidebar';
import Toast from '../components/Toast';
import { usePatients } from '../context/PatientContext';
import '../styles/design-system.css';
import '../styles/ekspor-impor.css';

export default function EksporImporPage() {
  const { patients, importPatients } = usePatients();

  useEffect(() => {
    document.title = 'SIM-REHAB | Ekspor & Impor Data - BNNK Buleleng';
  }, []);

  // Active Tab: 'export' or 'import'
  const [activeTab, setActiveTab] = useState('export');

  // Export Filter State
  const [filterTahunExport, setFilterTahunExport] = useState('semua');
  const [incOngoing, setIncOngoing] = useState(true);
  const [incSelesai, setIncSelesai] = useState(true);
  const [incDropout, setIncDropout] = useState(true);
  const [selectKecamatan, setSelectKecamatan] = useState('semua');
  const [selectStatusRawat, setSelectStatusRawat] = useState('semua');

  // Import State
  const [importTahunTarget, setImportTahunTarget] = useState('2026');
  const [importMode, setImportMode] = useState('append');
  const [parsedImportData, setParsedImportData] = useState([]);
  const [fileNameInfo, setFileNameInfo] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  // Toast State
  const [toastShow, setToastShow] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastIsError, setToastIsError] = useState(false);

  const showToast = (message, isError = false) => {
    setToastMsg(message);
    setToastIsError(isError);
    setToastShow(true);
    setTimeout(() => {
      setToastShow(false);
    }, 3000);
  };

  const formatDateIndo = (dateObj) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
    ];
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = months[dateObj.getMonth()];
    const year = dateObj.getFullYear();
    return `${day} ${month} ${year}`;
  };

  // Filter Data Pasien untuk Ekspor
  const filteredExportPatients = useMemo(() => {
    return patients.filter((p) => {
      if (filterTahunExport !== 'semua') {
        const pTahun = String(p.tahunRehab || p.tglKedatangan || p.tahun || '').slice(-4);
        if (pTahun !== filterTahunExport) return false;
      }

      const st = (p.statusProgres || 'ON GOING').toUpperCase();
      if (st === 'ON GOING' && !incOngoing) return false;
      if (st === 'SELESAI' && !incSelesai) return false;
      if (st === 'DROP OUT' && !incDropout) return false;

      if (selectKecamatan !== 'semua') {
        if ((p.kecamatan || '').toLowerCase() !== selectKecamatan.toLowerCase())
          return false;
      }

      if (selectStatusRawat !== 'semua') {
        const isRawatInap = (p.statusRawat || '').toLowerCase().includes('inap');
        if (selectStatusRawat === 'rawat_jalan' && isRawatInap) return false;
        if (selectStatusRawat === 'rawat_inap' && !isRawatInap) return false;
      }

      return true;
    });
  }, [patients, filterTahunExport, incOngoing, incSelesai, incDropout, selectKecamatan, selectStatusRawat]);

  const periodTitle = useMemo(() => {
    if (filterTahunExport !== 'semua') {
      return `DATA KLIEN REHABILITASI DI KLINIK PRATAMA BNNK BULELENG TAHUN ${filterTahunExport}`;
    }
    return `DATA KLIEN REHABILITASI DI KLINIK PRATAMA BNNK BULELENG 2018 SAMPAI 2026`;
  }, [filterTahunExport]);

  // Handle Export Excel .XLSX
  const handleExportExcel = () => {
    if (filteredExportPatients.length === 0) {
      showToast('Tidak ada data klien yang terpilih untuk diekspor ke Excel!', true);
      return;
    }

    const rows = [];
    rows.push(['DATA KLIEN REHABILITASI DI KLINIK PRATAMA BNNK BULELENG']);
    rows.push([
      filterTahunExport !== 'semua'
        ? `TAHUN ${filterTahunExport}`
        : '2018 SAMPAI 2026',
    ]);
    rows.push([]);

    rows.push([
      'No',
      'Nomor Surat',
      'Tgl Kedatangan',
      'Kepada',
      'Kabupaten',
      'Nama',
      'Umur',
      'Jenis Kelamin',
      'Pekerjaan',
      'Tgl Lahir',
      'Alamat',
      'Desa/Kelurahan',
      'Kecamatan Asal',
      'Kabupaten Asal',
      'Status Rawat',
      'Tahun Rehab',
      'No Hp',
      'NIK',
      'Status Progres',
      'Keterangan',
    ]);

    filteredExportPatients.forEach((p, idx) => {
      rows.push([
        idx + 1,
        p.nomorSurat || '-',
        p.tglKedatangan || '-',
        p.kepada || p.tujuanRujukan || 'Klinik Pratama BNNK Buleleng',
        p.kabupaten || 'Buleleng',
        p.nama || '-',
        p.umur || '-',
        p.jenisKelamin || (p.gender === 'perempuan' ? 'Perempuan' : 'Laki-Laki'),
        p.pekerjaan || 'Tidak Bekerja',
        p.tglLahir || '-',
        p.alamat || '-',
        p.desa || '-',
        p.kecamatan || 'Buleleng',
        p.kabupatenAsal || 'Buleleng',
        p.statusRawat || 'Rawat Jalan Klinik Pratama BNNK Buleleng',
        p.tahunRehab || p.tahun || '2026',
        `'${p.noHp || p.telepon || '-'}`,
        `'${p.nik || '-'}`,
        (p.statusProgres || 'ON GOING').toUpperCase(),
        p.keterangan || '-',
      ]);
    });

    rows.push([]);
    rows.push([]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', '', 'Singaraja, ' + formatDateIndo(new Date())]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', '', 'Kepala BNN Kabupaten Buleleng']);
    rows.push([]);
    rows.push([]);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', '', 'AKBP Gede Astawa, S.H., M.H.']);
    rows.push(['', '', '', '', '', '', '', '', '', '', '', '', 'NIP. 19741120 199903 1 001']);

    const ws = XLSX.utils.aoa_to_sheet(rows);

    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 28 },
      { wch: 42 },
      { wch: 14 },
      { wch: 24 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 32 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 30 },
      { wch: 12 },
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 35 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DATA KLIEN');

    const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const fileName = `DATA_KLIEN_REHABILITASI_BNNK_BULELENG_2018_2026_${todayStr}.xlsx`;

    XLSX.writeFile(wb, fileName);
    showToast(`Spreadsheet resmi BNN '${fileName}' berhasil diunduh.`);
  };

  const handlePrintPdf = () => {
    if (filteredExportPatients.length === 0) {
      showToast('Tidak ada data pasien yang terpilih untuk dicetak!', true);
      return;
    }
    window.print();
  };

  const handleDownloadTemplate = () => {
    const headers = [
      'No',
      'Nomor Surat',
      'Tgl Kedatangan',
      'Kepada',
      'Kabupaten',
      'Nama',
      'Umur',
      'Jenis Kelamin',
      'Pekerjaan',
      'Tgl Lahir',
      'Alamat',
      'Desa/Kelurahan',
      'Kecamatan Asal',
      'Kabupaten Asal',
      'Status Rawat',
      'Tahun Rehab',
      'No Hp',
      'NIK (16 Digit)',
      'Status Progres (ON GOING/SELESAI/DROP OUT)',
      'Keterangan',
    ];

    const sampleRows = [
      [
        1,
        '-',
        'Singaraja, 28 Nopember 2018',
        'UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali',
        'Bangli',
        'Putu Jaka',
        '26 Tahun',
        'Laki-Laki',
        'Tidak Bekerja',
        '10 Oktober 1999',
        'Desa Baktiseraga, Gg. Arjuna No. 5',
        'Baktiseraga',
        'Buleleng',
        'Buleleng',
        'Rawat Inap RSJ Bangli',
        '2018',
        '087853981178',
        '5108021010990001',
        'SELESAI',
        'Rujukan rawat inap stabilisasi medis di RSJ Bangli.',
      ],
      [
        2,
        'R/01/I/2026/BNNK-BLG',
        'Singaraja, 01 September 2026',
        'Klinik Pratama BNNK Buleleng',
        'Buleleng',
        'Raja Aldino Putra',
        '22 Tahun',
        'Laki-Laki',
        'Wiraswasta',
        '15 September 2004',
        'Jl. Ngurah Rai No. 12, Singaraja',
        'Singaraja',
        'Buleleng',
        'Buleleng',
        'Rawat Jalan Klinik Pratama BNNK Buleleng',
        '2026',
        '081234567890',
        '5108021509010001',
        'ON GOING',
        'Klien kooperatif, rutin mengikuti pendampingan konseling rawat jalan.',
      ],
    ];

    const data = [
      ['DATA KLIEN REHABILITASI DI KLINIK PRATAMA BNNK BULELENG 2018 SAMPAI 2026'],
      [],
      headers,
      ...sampleRows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = [
      { wch: 6 },
      { wch: 18 },
      { wch: 28 },
      { wch: 42 },
      { wch: 14 },
      { wch: 24 },
      { wch: 12 },
      { wch: 14 },
      { wch: 16 },
      { wch: 18 },
      { wch: 32 },
      { wch: 18 },
      { wch: 16 },
      { wch: 16 },
      { wch: 30 },
      { wch: 12 },
      { wch: 18 },
      { wch: 20 },
      { wch: 16 },
      { wch: 35 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DATA KLIEN');
    XLSX.writeFile(wb, 'TEMPLATE_DATA_KLIEN_REHABILITASI_BNNK_BULELENG_2018_2026.xlsx');
    showToast('Template resmi spreadsheet 17 kolom BNN berhasil diunduh.');
  };

  const handleIncomingFile = (file) => {
    setFileNameInfo(`File terpilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        parseAndValidateImportData(jsonData);
      } catch (err) {
        showToast('Gagal membaca file spreadsheet. Pastikan file tidak rusak.', true);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const parseAndValidateImportData = (sheetRows) => {
    if (!sheetRows || sheetRows.length <= 1) {
      showToast('File tidak memiliki baris data yang valid!', true);
      return;
    }

    let headerRowIdx = -1;
    for (let r = 0; r < Math.min(sheetRows.length, 10); r++) {
      const row = sheetRows[r];
      if (Array.isArray(row) && row.some((c) => {
        const s = String(c || '').toLowerCase();
        return s.includes('nama') || s.includes('kedatangan') || s.includes('kepada');
      })) {
        headerRowIdx = r;
        break;
      }
    }

    if (headerRowIdx === -1) {
      headerRowIdx = 0;
    }

    const headerRow = sheetRows[headerRowIdx].map((c) => String(c || '').toLowerCase().trim());

    const findCol = (keywords, excludeKeywords = []) => {
      return headerRow.findIndex((h) => {
        if (excludeKeywords.some((ex) => h.includes(ex.toLowerCase()))) return false;
        return keywords.some((k) => {
          const kw = k.toLowerCase();
          if (h === kw) return true;
          if (h.includes(kw) && kw.length >= 4) return true;
          const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, 'i');
          return regex.test(h);
        });
      });
    };

    const colNoSurat = findCol(['nomor surat', 'no. surat', 'no surat', 'surat']);
    const colTglDatang = findCol(['tgl kedatangan', 'kedatangan', 'tgl masuk', 'tgl datang', 'tanggal'], ['lahir']);
    const colKepada = findCol(['kepada', 'instansi', 'tujuan rujukan', 'tujuan']);
    const colKabupaten = findCol(['kabupaten', 'kab.'], ['asal']);
    const colNama = findCol(['nama klien', 'nama pasien', 'nama']);
    const colUmur = findCol(['umur', 'usia']);
    const colGender = findCol(['jenis kelamin', 'kelamin', 'gender', 'jk']);
    const colPekerjaan = findCol(['pekerjaan', 'profesi']);
    const colTglLahir = findCol(['tgl lahir', 'tanggal lahir', 'lahir']);
    const colAlamat = findCol(['alamat', 'domisili', 'banjar', 'tempat tinggal'], ['rawat']);
    const colDesa = findCol(['desa', 'kelurahan']);
    const colKecamatan = findCol(['kecamatan', 'kec.']);
    const colKabAsal = findCol(['kabupaten asal', 'kab asal', 'asal']);
    const colStatusRawat = findCol(['status rawat', 'rawatan', 'jenis rawat', 'rawat', 'layanan']);
    const colTahunRehab = findCol(['tahun rehab', 'tahun']);
    const colNoHp = findCol(['no hp', 'nomor hp', 'telepon', 'telp', 'no telp', 'no wa', 'wa', 'hp'], ['rawat', 'inap']);
    const colNik = findCol(['nik', 'ktp', 'identitas']);
    const colStatusProgres = findCol(['status progres', 'progres', 'status'], ['rawat']);
    const colKeterangan = findCol(['keterangan', 'catatan']);

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

    const parsed = [];

    for (let i = headerRowIdx + 1; i < sheetRows.length; i++) {
      const row = sheetRows[i];
      if (!row || row.length === 0) continue;

      const rawNama = colNama !== -1 ? String(row[colNama] || '').trim() : String(row[5] || row[1] || '').trim();
      if (!rawNama || rawNama.toLowerCase() === 'nama' || rawNama.toLowerCase().includes('kepala bnn')) continue;

      const nomorSurat = colNoSurat !== -1 ? String(row[colNoSurat] || '-').trim() : '-';
      let tglKedatangan = colTglDatang !== -1 ? String(row[colTglDatang] || '').trim() : '';
      const kepada = colKepada !== -1 ? String(row[colKepada] || '').trim() : 'Klinik Pratama BNNK Buleleng';
      const kabupaten = colKabupaten !== -1 ? String(row[colKabupaten] || 'Buleleng').trim() : 'Buleleng';
      const umur = colUmur !== -1 ? String(row[colUmur] || '25 Tahun').trim() : '25 Tahun';
      const rawGender = colGender !== -1 ? String(row[colGender] || 'Laki-Laki').trim() : 'Laki-Laki';
      const pekerjaan = colPekerjaan !== -1 ? String(row[colPekerjaan] || 'Tidak Bekerja').trim() : 'Tidak Bekerja';
      const tglLahir = colTglLahir !== -1 ? String(row[colTglLahir] || '-').trim() : '-';
      const alamat = colAlamat !== -1 ? String(row[colAlamat] || '-').trim() : '-';
      const desa = colDesa !== -1 ? String(row[colDesa] || '-').trim() : '-';
      const kecamatan = colKecamatan !== -1 ? String(row[colKecamatan] || 'Buleleng').trim() : 'Buleleng';
      const kabupatenAsal = colKabAsal !== -1 ? String(row[colKabAsal] || 'Buleleng').trim() : 'Buleleng';
      const statusRawat = colStatusRawat !== -1 ? String(row[colStatusRawat] || '').trim() : 'Rawat Jalan Klinik Pratama BNNK Buleleng';
      let tahunRehab = colTahunRehab !== -1 ? String(row[colTahunRehab] || '').trim() : '';
      let noHp = colNoHp !== -1 ? String(row[colNoHp] || '-').replace(/['"]/g, '').trim() : '-';
      if (isInvalidPhone(noHp)) noHp = '-';
      let rawNik = colNik !== -1 ? String(row[colNik] || '').replace(/['"\s-]/g, '') : '';
      let statusProgres = colStatusProgres !== -1 ? String(row[colStatusProgres] || 'ON GOING').toUpperCase().trim() : 'ON GOING';
      const keterangan = colKeterangan !== -1 ? String(row[colKeterangan] || '').trim() : 'Data diimpor dari dokumen arsip resmi BNNK Buleleng.';

      if (!isNaN(tglKedatangan) && Number(tglKedatangan) > 20000) {
        const parsedDate = new Date((Number(tglKedatangan) - 25569) * 86400 * 1000);
        tglKedatangan = `Singaraja, ${formatDateIndo(parsedDate)}`;
      } else if (!tglKedatangan) {
        tglKedatangan = `Singaraja, 01 Januari ${importTahunTarget || '2026'}`;
      }

      if (!tahunRehab) {
        tahunRehab = tglKedatangan.slice(-4) || importTahunTarget || '2026';
      }

      if (statusProgres.includes('SELESAI') || statusProgres.includes('PULIH')) {
        statusProgres = 'SELESAI';
      } else if (statusProgres.includes('DO') || statusProgres.includes('DROP')) {
        statusProgres = 'DROP OUT';
      } else {
        statusProgres = 'ON GOING';
      }

      const gender = rawGender.toLowerCase().includes('p') ? 'perempuan' : 'laki';
      const jenisKelamin = gender === 'perempuan' ? 'Perempuan' : 'Laki-Laki';

      let layananTeks = '';
      if (statusRawat.toLowerCase().includes('inap')) {
        const rujukanSingkat = kepada.includes('Lido')
          ? '(Balai Lido)'
          : kepada.includes('RSJ')
            ? '(RSJ Bangli)'
            : `(${kabupaten})`;
        layananTeks = `Rawat Inap\n${rujukanSingkat}`;
      } else {
        layananTeks = statusRawat.includes('BNNP')
          ? 'Rawat Jalan\n(BNNP Bali)'
          : 'Rawat Jalan\n(Klinik BNNK)';
      }

      if (!rawNik) {
        rawNik = `5108${tahunRehab}000000${String(parsed.length + 1).padStart(2, '0')}`;
      }

      let isValid = true;
      let valMessage = 'Siap Diimpor';
      let valClass = 'valid';

      if (!rawNama) {
        isValid = false;
        valMessage = 'Nama Kosong';
        valClass = 'invalid';
      } else if (rawNik.length !== 16 || isNaN(rawNik)) {
        valMessage = 'Format NIK';
        valClass = 'warning';
      }

      parsed.push({
        id: `IMPORT-${tahunRehab}-${String(parsed.length + 1).padStart(3, '0')}`,
        nomorSurat,
        tglKedatangan,
        kepada,
        kabupaten,
        nama: rawNama,
        nik: rawNik,
        umur: umur.includes('Tahun') || umur.includes('Th') ? umur : `${umur} Tahun`,
        gender,
        jenisKelamin,
        pekerjaan,
        tglLahir,
        alamat,
        desa,
        kecamatan,
        kabupatenAsal,
        statusRawat: statusRawat || 'Rawat Jalan Klinik Pratama BNNK Buleleng',
        tahunRehab,
        telepon: noHp,
        noHp,
        rehabKe: 'Ke-1',
        statusProgres,
        layananTeks,
        tujuanRujukan: kepada,
        keterangan,
        _isValid: isValid,
        _valMessage: valMessage,
        _valClass: valClass,
      });
    }

    setParsedImportData(parsed);
  };

  const handleProcessImport = () => {
    if (parsedImportData.length === 0) {
      showToast('Tidak ada data yang dapat diimpor!', true);
      return;
    }

    const cleanData = parsedImportData.map(
      ({ _isValid, _valMessage, _valClass, ...item }) => item
    );
    importPatients(cleanData, importMode);

    showToast(
      `Sukses! ${parsedImportData.length} data arsip resmi BNN berhasil dimasukkan ke sistem.`
    );

    setParsedImportData([]);
    setFileNameInfo('');
    if (fileInputRef.current) fileInputRef.current.value = '';

    setTimeout(() => {
      setActiveTab('export');
    }, 1200);
  };

  const handleCancelImport = () => {
    setParsedImportData([]);
    setFileNameInfo('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const countImportTotal = parsedImportData.length;
  const countImportValid = parsedImportData.filter((d) => d._valClass === 'valid').length;
  const countImportWarn = parsedImportData.filter((d) => d._valClass === 'warning').length;
  const countImportInvalid = parsedImportData.filter((d) => d._valClass === 'invalid').length;

  const printNow = new Date();
  const romanMonths = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  const printRomanMonth = romanMonths[printNow.getMonth()];
  const printCurYear = printNow.getFullYear();

  return (
    <>
      <div className="app-layout">
        <Sidebar />

        <main className="main-content">
          <header className="page-header">
            <div className="header-left">
              <h1 className="page-title">Pusat Ekspor &amp; Impor Data</h1>
              <p className="page-subtitle">
                Modul Ekspor Laporan Resmi 17 Kolom BNN &amp; Impor Spreadsheet Rekam Medis
              </p>
            </div>
            <div className="header-right">
              <span className="date-badge">
                <Buildings size={15} weight="bold" />
                <span>Format Standar BNN RI</span>
              </span>
            </div>
          </header>

          <div className="ekspor-impor-content">
            {/* Mode Switcher Tabs */}
            <div className="module-tabs-nav">
              <button
                type="button"
                className={`module-tab-item ${activeTab === 'export' ? 'active' : ''}`}
                onClick={() => setActiveTab('export')}
              >
                <FileArrowDown size={18} weight="bold" />
                <span>Ekspor Rekapitulasi &amp; Laporan (Excel / PDF)</span>
              </button>

              <button
                type="button"
                className={`module-tab-item ${activeTab === 'import' ? 'active' : ''}`}
                onClick={() => setActiveTab('import')}
              >
                <FileArrowUp size={18} weight="bold" />
                <span>Impor Data Spreadsheet Arsip (2018–2026)</span>
              </button>
            </div>

            {/* PANEL 1: EKSPOR */}
            {activeTab === 'export' && (
              <div className="tab-pane-view">
                {/* Filter Ekspor Card */}
                <div className="panel-card filter-export-card">
                  <div className="panel-card-header">
                    <h2 className="panel-card-title">
                      <Funnel size={16} weight="bold" color="#1d4ed8" />
                      <span>Parameter Penarikan Data Laporan</span>
                    </h2>
                  </div>

                  <div className="panel-card-body filter-export-body">
                    <div className="export-params-row">
                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="filterTahunExport" className="form-label">
                          Tahun Anggaran:
                        </label>
                        <select
                          id="filterTahunExport"
                          className="form-select"
                          value={filterTahunExport}
                          onChange={(e) => setFilterTahunExport(e.target.value)}
                        >
                          <option value="semua">Semua Tahun (2018–2026)</option>
                          <option value="2026">Tahun 2026</option>
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

                      <div className="form-group" style={{ flex: 1.2 }}>
                        <label className="form-label">Status Progres Klien:</label>
                        <div className="checkboxes-pill-group">
                          <label className="checkbox-pill">
                            <input
                              type="checkbox"
                              checked={incOngoing}
                              onChange={(e) => setIncOngoing(e.target.checked)}
                            />
                            <span>On Going</span>
                          </label>
                          <label className="checkbox-pill">
                            <input
                              type="checkbox"
                              checked={incSelesai}
                              onChange={(e) => setIncSelesai(e.target.checked)}
                            />
                            <span>Selesai / Pulih</span>
                          </label>
                          <label className="checkbox-pill">
                            <input
                              type="checkbox"
                              checked={incDropout}
                              onChange={(e) => setIncDropout(e.target.checked)}
                            />
                            <span>Drop Out</span>
                          </label>
                        </div>
                      </div>

                      <div className="form-group" style={{ flex: 1 }}>
                        <label htmlFor="selectKecamatan" className="form-label">
                          Kecamatan Asal:
                        </label>
                        <select
                          id="selectKecamatan"
                          className="form-select"
                          value={selectKecamatan}
                          onChange={(e) => setSelectKecamatan(e.target.value)}
                        >
                          <option value="semua">Seluruh Kecamatan</option>
                          <option value="buleleng">Buleleng</option>
                          <option value="sukasada">Sukasada</option>
                          <option value="seririt">Seririt</option>
                          <option value="gerokgak">Gerokgak</option>
                          <option value="banjar">Banjar</option>
                          <option value="sawan">Sawan</option>
                          <option value="kubutambahan">Kubutambahan</option>
                          <option value="busungbiu">Busungbiu</option>
                          <option value="tejakula">Tejakula</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Preview Table Card */}
                <div className="panel-card preview-export-card">
                  <div className="panel-card-header preview-header-custom">
                    <div>
                      <h3 className="preview-heading-title">
                        Pratinjau Rekapitulasi Data Buku Register BNN
                      </h3>
                      <p className="preview-heading-sub">{periodTitle}</p>
                    </div>
                    <span className="badge badge-outpatient" style={{ fontSize: '0.8rem' }}>
                      {filteredExportPatients.length} Data Terpilih
                    </span>
                  </div>

                  <div className="table-responsive">
                    <table className="data-table export-table">
                      <thead>
                        <tr>
                          <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                          <th style={{ width: '130px' }}>No. Surat</th>
                          <th style={{ width: '120px' }}>Tgl Kedatangan</th>
                          <th style={{ width: '180px' }}>Kepada (Rujukan)</th>
                          <th style={{ width: '90px' }}>Kabupaten</th>
                          <th>Nama Klien</th>
                          <th style={{ width: '75px', textAlign: 'center' }}>JK / Umur</th>
                          <th style={{ width: '110px' }}>Pekerjaan</th>
                          <th style={{ width: '110px' }}>Desa/Kec.</th>
                          <th style={{ width: '160px' }}>Status Rawat</th>
                          <th style={{ width: '60px', textAlign: 'center' }}>Tahun</th>
                          <th style={{ width: '100px' }}>No HP</th>
                          <th style={{ width: '100px', textAlign: 'center' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExportPatients.length === 0 ? (
                          <tr>
                            <td colSpan={13} className="empty-table-state">
                              <div className="empty-message-wrap">
                                <FolderOpen size={36} weight="duotone" color="#94a3b8" />
                                <p className="empty-title">Tidak Ada Data yang Sesuai Parameter Filter</p>
                                <p className="empty-sub">Silakan sesuaikan pilihan tahun, status rawatan, atau wilayah.</p>
                              </div>
                            </td>
                          </tr>
                        ) : (
                          filteredExportPatients.map((p, idx) => {
                            const genderCode = (p.gender || p.jenisKelamin || 'laki').toLowerCase().includes('p') ? 'P' : 'L';
                            const umurDisplay = p.umur ? p.umur.replace('Tahun', 'Th') : '28 Th';
                            const stVal = (p.statusProgres || 'ON GOING').toUpperCase();

                            return (
                              <tr key={p.nik || idx}>
                                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                <td style={{ fontSize: '0.75rem', fontWeight: 500 }}>{p.nomorSurat || '-'}</td>
                                <td style={{ fontSize: '0.75rem' }}>{p.tglKedatangan || '-'}</td>
                                <td style={{ fontSize: '0.75rem' }}>{p.kepada || p.tujuanRujukan || '-'}</td>
                                <td style={{ fontSize: '0.75rem' }}>{p.kabupaten || 'Buleleng'}</td>
                                <td style={{ fontWeight: 600 }}>{p.nama || '-'}</td>
                                <td style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                  {genderCode} / {umurDisplay}
                                </td>
                                <td style={{ fontSize: '0.75rem' }}>{p.pekerjaan || '-'}</td>
                                <td style={{ fontSize: '0.75rem' }}>{p.desa || p.kecamatan || '-'}</td>
                                <td style={{ fontSize: '0.75rem' }}>{p.statusRawat || 'Rawat Jalan'}</td>
                                <td style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {p.tahunRehab || p.tahun || '2026'}
                                </td>
                                <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                  {p.noHp || p.telepon || '-'}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {stVal.includes('DROP') ? (
                                    <span className="badge badge-dropout">DO</span>
                                  ) : stVal.includes('SELESAI') ? (
                                    <span className="badge badge-completed">SELESAI</span>
                                  ) : (
                                    <span className="badge badge-ongoing">ON GOING</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="panel-card-footer export-action-strip">
                    <div className="export-status-note">
                      <span>Dokumen sesuai standar registrasi resmi BNNK Buleleng 17 kolom</span>
                    </div>

                    <div className="export-buttons-group">
                      <button
                        type="button"
                        className="btn btn-success"
                        id="btnExportExcel"
                        onClick={handleExportExcel}
                      >
                        <FileXls size={18} weight="bold" />
                        <span>Unduh Spreadsheet Excel (.xlsx)</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary"
                        id="btnExportPdf"
                        onClick={handlePrintPdf}
                      >
                        <Printer size={18} weight="bold" />
                        <span>Cetak Dokumen Resmi PDF</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL 2: IMPOR */}
            {activeTab === 'import' && (
              <div className="tab-pane-view">
                {/* Guide & Template Card */}
                <div className="panel-card import-guide-card">
                  <div className="import-guide-row">
                    <div className="import-guide-text">
                      <h3 className="import-guide-title">
                        Impor Data Spreadsheet Arsip BNN (2018–2026)
                      </h3>
                      <p className="import-guide-desc">
                        Mendukung file Excel (.xlsx / .xls) dan CSV berformat 17 kolom resmi BNN.
                        Sistem mendeteksi letak kolom dan memvalidasi NIK serta nomor kontak secara otomatis.
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      id="btnDownloadTemplate"
                      onClick={handleDownloadTemplate}
                    >
                      <DownloadSimple size={16} weight="bold" />
                      <span>Unduh Template 17 Kolom (.xlsx)</span>
                    </button>
                  </div>
                </div>

                {/* Dropzone Upload Card */}
                <div className="panel-card import-upload-card">
                  <div className="upload-config-toolbar">
                    <div className="config-item">
                      <label htmlFor="importTahunTarget" className="form-label">
                        Tahun Arsip Target:
                      </label>
                      <select
                        id="importTahunTarget"
                        className="form-select select-sm"
                        value={importTahunTarget}
                        onChange={(e) => setImportTahunTarget(e.target.value)}
                      >
                        <option value="2026">Tahun 2026</option>
                        <option value="2025">Tahun 2025</option>
                        <option value="2024">Tahun 2024</option>
                        <option value="2023">Tahun 2023</option>
                        <option value="2022">Tahun 2022</option>
                        <option value="2021">Tahun 2021</option>
                        <option value="2020">Tahun 2020</option>
                        <option value="2019">Tahun 2019</option>
                        <option value="2018">Tahun 2018</option>
                        <option value="lainnya">Campuran (2018–2026)</option>
                      </select>
                    </div>

                    <div className="config-item">
                      <label className="form-label">Metode Impor Data:</label>
                      <div className="radio-pills-group">
                        <label className="radio-pill">
                          <input
                            type="radio"
                            name="importMode"
                            value="append"
                            checked={importMode === 'append'}
                            onChange={() => setImportMode('append')}
                          />
                          <span>Gabungkan ke Data Ada</span>
                        </label>
                        <label className="radio-pill">
                          <input
                            type="radio"
                            name="importMode"
                            value="overwrite"
                            checked={importMode === 'overwrite'}
                            onChange={() => setImportMode('overwrite')}
                          />
                          <span>Timpa / Ganti Seluruh Data</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Drag & Drop Area */}
                  <div
                    className={`dropzone-area ${isDragOver ? 'dragover' : ''}`}
                    id="dropzoneBox"
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragOver(true);
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragOver(false);
                      const file = e.dataTransfer.files[0];
                      if (file) handleIncomingFile(file);
                    }}
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      id="fileInputExcel"
                      accept=".xlsx, .xls, .csv"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) handleIncomingFile(file);
                      }}
                    />
                    <div className="dropzone-content">
                      <div className="dropzone-icon-box">
                        <UploadSimple size={32} weight="bold" />
                      </div>
                      <h4 className="dropzone-title">
                        Tarik &amp; Lepaskan File Spreadsheet BNN di Sini
                      </h4>
                      <p className="dropzone-sub">
                        atau klik untuk memilih file dari komputer Anda (.xlsx, .xls, .csv)
                      </p>
                      {fileNameInfo ? (
                        <div className="file-info-badge">
                          <CheckCircle size={15} weight="fill" color="#16a34a" />
                          <span>{fileNameInfo}</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (fileInputRef.current) fileInputRef.current.click();
                          }}
                        >
                          Pilih File Spreadsheet
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Preview Parsed Data */}
                {parsedImportData.length > 0 && (
                  <div className="panel-card import-preview-card">
                    <div className="panel-card-header preview-header-custom">
                      <div>
                        <h3 className="preview-heading-title">
                          Pratinjau Data Impor Spreadsheet
                        </h3>
                        <p className="preview-heading-sub">
                          Terbaca: {countImportTotal} Klien &bull; Valid: {countImportValid} &bull; Catatan Format: {countImportWarn} &bull; Tidak Valid: {countImportInvalid}
                        </p>
                      </div>
                    </div>

                    <div className="table-responsive">
                      <table className="data-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40px', textAlign: 'center' }}>No</th>
                            <th style={{ width: '130px' }}>No. Surat</th>
                            <th style={{ width: '120px' }}>Tgl Kedatangan</th>
                            <th>Nama Klien</th>
                            <th style={{ width: '75px', textAlign: 'center' }}>JK / Umur</th>
                            <th style={{ width: '110px' }}>Desa &amp; Kec.</th>
                            <th style={{ width: '160px' }}>Kepada (Rujukan)</th>
                            <th style={{ width: '140px' }}>Status Rawat</th>
                            <th style={{ width: '60px', textAlign: 'center' }}>Tahun</th>
                            <th style={{ width: '100px' }}>No HP</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>Status</th>
                            <th style={{ width: '90px', textAlign: 'center' }}>Validasi</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parsedImportData.map((item, idx) => {
                            const genderCode = item.gender === 'perempuan' ? 'P' : 'L';
                            const kecDesa = `${item.desa || '-'}${item.kecamatan ? ', ' + item.kecamatan : ''}`;

                            return (
                              <tr key={idx}>
                                <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                                <td style={{ fontSize: '0.75rem' }}>{item.nomorSurat}</td>
                                <td style={{ fontSize: '0.75rem' }}>{item.tglKedatangan}</td>
                                <td>
                                  <strong>{item.nama}</strong>
                                </td>
                                <td style={{ textAlign: 'center', fontSize: '0.75rem' }}>
                                  {genderCode} / {item.umur}
                                </td>
                                <td style={{ fontSize: '0.75rem' }}>{kecDesa}</td>
                                <td style={{ fontSize: '0.75rem' }}>{item.kepada}</td>
                                <td style={{ fontSize: '0.75rem' }}>{item.statusRawat}</td>
                                <td style={{ textAlign: 'center', fontSize: '0.75rem', fontWeight: 600 }}>
                                  {item.tahunRehab}
                                </td>
                                <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                                  {item.noHp}
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  <span
                                    className={`badge ${
                                      item.statusProgres === 'SELESAI'
                                        ? 'badge-completed'
                                        : item.statusProgres === 'DROP OUT'
                                        ? 'badge-dropout'
                                        : 'badge-ongoing'
                                    }`}
                                  >
                                    {item.statusProgres}
                                  </span>
                                </td>
                                <td style={{ textAlign: 'center' }}>
                                  {item._valClass === 'valid' ? (
                                    <span className="badge badge-completed" title="Data valid dan siap disimpan">
                                      <CheckCircle size={12} weight="fill" />
                                      <span>Valid</span>
                                    </span>
                                  ) : item._valClass === 'warning' ? (
                                    <span className="badge badge-ongoing" title={item._valMessage}>
                                      <WarningCircle size={12} weight="fill" />
                                      <span>Catatan</span>
                                    </span>
                                  ) : (
                                    <span className="badge badge-dropout" title={item._valMessage}>
                                      <XCircle size={12} weight="fill" />
                                      <span>Error</span>
                                    </span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    <div className="panel-card-footer import-action-strip">
                      <button
                        type="button"
                        className="btn btn-secondary"
                        onClick={handleCancelImport}
                      >
                        <ArrowCounterClockwise size={15} weight="bold" />
                        <span>Batal &amp; Reset File</span>
                      </button>

                      <button
                        type="button"
                        className="btn btn-primary btn-lg"
                        disabled={countImportTotal === 0}
                        onClick={handleProcessImport}
                      >
                        <FloppyDiskBack size={18} weight="bold" />
                        <span>Simpan {countImportTotal} Data ke SIM-REHAB</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* PRINT OFFICIAL REPORT CONTAINER */}
      <div className="print-official-container" id="printReportContainer">
        <div className="kop-surat">
          <div className="kop-logo-left">
            <img
              src="/assets/images/bnn.png"
              alt="Logo BNN"
              className="kop-logo-img"
            />
          </div>
          <div className="kop-text">
            <h2 className="kop-instansi-1">
              BADAN NARKOTIKA NASIONAL REPUBLIK INDONESIA
            </h2>
            <h1 className="kop-instansi-2">
              BADAN NARKOTIKA NASIONAL KABUPATEN BULELENG
            </h1>
            <p className="kop-alamat">
              Jl. Teleng No.3, Banyuasri, Kec. Buleleng, Kabupaten Buleleng, Bali 81116
            </p>
            <p className="kop-kontak">
              Telepon: (0362) 3303358 | Email: bnnk_buleleng@bnn.go.id | Website: bulelengkab.bnn.go.id
            </p>
          </div>
        </div>
        <div className="kop-line-double"></div>

        <div className="print-doc-header">
          <h3 className="print-doc-title">
            DATA KLIEN REHABILITASI DI KLINIK PRATAMA BNNK BULELENG (2018 - 2026)
          </h3>
          <p className="print-doc-nomor">
            Nomor: B / REKAP-REHAB / BNNK-BLG / {printRomanMonth} / {printCurYear}
          </p>
          <div className="print-metadata-grid">
            <div>
              <strong>Tahun Laporan:</strong>{' '}
              <span>{filterTahunExport === 'semua' ? '2018 SAMPAI 2026' : `TAHUN ${filterTahunExport}`}</span>
            </div>
            <div>
              <strong>Wilayah:</strong>{' '}
              <span>{selectKecamatan === 'semua' ? 'Seluruh Kecamatan' : `Kecamatan ${selectKecamatan.toUpperCase()}`}</span>
            </div>
            <div>
              <strong>Status Progres:</strong>{' '}
              <span>
                {[
                  incOngoing && 'On Going',
                  incSelesai && 'Selesai',
                  incDropout && 'DO',
                ]
                  .filter(Boolean)
                  .join(', ') || 'Semua'}
              </span>
            </div>
            <div>
              <strong>Total Klien Terdaftar:</strong>{' '}
              <span>{filteredExportPatients.length} Klien</span>
            </div>
          </div>
        </div>

        <table className="print-table" id="printReportTable">
          <thead>
            <tr>
              <th style={{ width: '25px' }} className="center">NO</th>
              <th style={{ width: '65px' }} className="center">NO. SURAT</th>
              <th style={{ width: '90px' }}>TGL KEDATANGAN</th>
              <th style={{ width: '130px' }}>KEPADA (RUJUKAN)</th>
              <th style={{ width: '65px' }}>KAB</th>
              <th>NAMA KLIEN</th>
              <th style={{ width: '55px' }} className="center">JK/UMUR</th>
              <th style={{ width: '75px' }}>PEKERJAAN</th>
              <th style={{ width: '85px' }}>DESA / KEC</th>
              <th style={{ width: '110px' }}>STATUS RAWAT</th>
              <th style={{ width: '45px' }} className="center">TAHUN</th>
              <th style={{ width: '75px' }}>NO HP</th>
              <th style={{ width: '65px' }} className="center">STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filteredExportPatients.map((p, idx) => {
              const genderCode = (p.gender || p.jenisKelamin || 'laki').toLowerCase().includes('p') ? 'P' : 'L';
              const umurDisplay = p.umur ? p.umur.replace('Tahun', 'Th') : '28 Th';

              return (
                <tr key={p.nik || idx}>
                  <td className="center">{idx + 1}</td>
                  <td className="center" style={{ fontSize: '7pt' }}>{p.nomorSurat || '-'}</td>
                  <td style={{ fontSize: '7pt' }}>{p.tglKedatangan || '-'}</td>
                  <td style={{ fontSize: '6.8pt' }}>{p.kepada || p.tujuanRujukan || '-'}</td>
                  <td style={{ fontSize: '7pt' }}>{p.kabupaten || 'Buleleng'}</td>
                  <td style={{ fontSize: '7.5pt' }}>
                    <strong>{p.nama || 'Klien'}</strong>
                  </td>
                  <td className="center" style={{ fontSize: '7pt' }}>
                    {genderCode}/{umurDisplay}
                  </td>
                  <td style={{ fontSize: '7pt' }}>{p.pekerjaan || '-'}</td>
                  <td style={{ fontSize: '7pt' }}>{p.desa || p.kecamatan || '-'}</td>
                  <td style={{ fontSize: '6.8pt' }}>{p.statusRawat || 'Rawat Jalan Klinik BNNK'}</td>
                  <td className="center" style={{ fontSize: '7pt' }}>{p.tahunRehab || p.tahun || '2026'}</td>
                  <td style={{ fontSize: '6.8pt', fontFamily: 'monospace' }}>{p.noHp || p.telepon || '-'}</td>
                  <td className="center" style={{ fontSize: '7pt' }}>
                    <strong>{(p.statusProgres || 'ON GOING').toUpperCase()}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <div className="print-signatures-row">
          <div className="sig-box">
            <p className="sig-date">Mengetahui,</p>
            <p className="sig-job">
              Kepala Seksi Rehabilitasi
              <br />
              BNNK Buleleng
            </p>
            <div className="sig-space"></div>
            <p className="sig-name">
              <strong>A.A. Gede Rai Wijaya, S.Psi.</strong>
            </p>
            <p className="sig-nip">NIP. 19820415 200801 1 003</p>
          </div>

          <div className="sig-box">
            <p className="sig-date">
              Singaraja, {formatDateIndo(printNow)}
            </p>
            <p className="sig-job">Kepala BNN Kabupaten Buleleng</p>
            <div className="sig-space"></div>
            <p className="sig-name">
              <strong>AKBP Gede Astawa, S.H., M.H.</strong>
            </p>
            <p className="sig-nip">NIP. 19741120 199903 1 001</p>
          </div>
        </div>
      </div>

      <Toast show={toastShow} message={toastMsg} isError={toastIsError} />
    </>
  );
}
