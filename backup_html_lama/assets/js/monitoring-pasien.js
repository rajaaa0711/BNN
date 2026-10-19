let currentUserRole = "super_user";
let currentFilterStatus = "all";
let currentFilterLayanan = "all";
let currentFilterTahun = "all";
let currentSearchQuery = "";
let selectedPatientNik = null;

// Seed Data Otentik BNN 2018 - 2026
const defaultSeedPatients = [
  {
    id: "AUTO-2018-006",
    nomorSurat: "-",
    tglKedatangan: "Singaraja, 28 Nopember 2018",
    kepada: "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali",
    kabupaten: "Bangli",
    nama: "Putu Jaka",
    nik: "5108021010990001",
    umur: "26 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Tidak Bekerja",
    tglLahir: "10 Oktober 1999",
    alamat: "Desa Baktiseraga, Gg. Arjuna No. 5",
    desa: "Baktiseraga",
    kecamatan: "Buleleng",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Inap RSJ Bangli",
    tahunRehab: "2018",
    telepon: "087853981178",
    noHp: "087853981178",
    rehabKe: "Ke-1",
    statusProgres: "SELESAI",
    layananTeks: "Rawat Inap\n(RSJ Bangli)",
    tujuanRujukan: "UPTD. Rumah Sakit Jiwa Provinsi Bali",
    keterangan: "Rujukan rawat inap stabilisasi medis dan psikiatri di RSJ Bangli.",
  },
  {
    id: "AUTO-2018-007",
    nomorSurat: "-",
    tglKedatangan: "Singaraja, 28 Nopember 2018",
    kepada: "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali",
    kabupaten: "Bangli",
    nama: "Gede Sudiadnyana",
    nik: "5108091506810002",
    umur: "44 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Buruh",
    tglLahir: "1981",
    alamat: "Banjar Kawan, Desa Tejakula",
    desa: "Tejakula",
    kecamatan: "Tejakula",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Inap RSJ Bangli",
    tahunRehab: "2018",
    telepon: "081337819456",
    noHp: "081337819456",
    rehabKe: "Ke-1",
    statusProgres: "SELESAI",
    layananTeks: "Rawat Inap\n(RSJ Bangli)",
    tujuanRujukan: "UPTD. Rumah Sakit Jiwa Provinsi Bali",
    keterangan: "Telah menyelesaikan program detoksifikasi dan rehabilitasi di RSJ Bangli.",
  },
  {
    id: "AUTO-2018-008",
    nomorSurat: "-",
    tglKedatangan: "Singaraja, 24 Desember 2018",
    kepada: "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali",
    kabupaten: "Bangli",
    nama: "Made Redita",
    nik: "5108050512820001",
    umur: "43 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Buruh",
    tglLahir: "5 Desember 1982",
    alamat: "Br. Enjung Sangiang, Kaliasem",
    desa: "Kaliasem",
    kecamatan: "Banjar",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Inap RSJ Bangli",
    tahunRehab: "2018",
    telepon: "081337776384",
    noHp: "081337776384",
    rehabKe: "Ke-1",
    statusProgres: "SELESAI",
    layananTeks: "Rawat Inap\n(RSJ Bangli)",
    tujuanRujukan: "UPTD. Rumah Sakit Jiwa Provinsi Bali",
    keterangan: "Program rehabilitasi rawat inap terpadu selesai, hasil tes skrining pascarehab negatif.",
  },
  {
    id: "AUTO-2018-009",
    nomorSurat: "-",
    tglKedatangan: "Singaraja, 28 Desember 2018",
    kepada: "Kepala Badan Narkotika Nasional Provinsi Bali Cq. Kepala Bidang Rehabilitasi",
    kabupaten: "Denpasar",
    nama: "Kadek Risky Setiawan",
    nik: "5108042509000003",
    umur: "25 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Tidak Bekerja",
    tglLahir: "25 September 2000",
    alamat: "Br. Sari Mekar, Desa Pemuteran",
    desa: "Pemuteran",
    kecamatan: "Gerokgak",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Jalan BNNP Bali",
    tahunRehab: "2018",
    telepon: "087753212465",
    noHp: "087753212465",
    rehabKe: "Ke-1",
    statusProgres: "SELESAI",
    layananTeks: "Rawat Jalan\n(BNNP Bali)",
    tujuanRujukan: "BNN Provinsi Bali",
    keterangan: "Pelayanan rawat jalan selesai di BNNP Bali dengan evaluasi pascarehab baik.",
  },
  {
    id: "AUTO-2026-044",
    nomorSurat: "R/01/I/2026/BNNK-BLG",
    tglKedatangan: "Singaraja, 01 September 2026",
    kepada: "Klinik Pratama BNNK Buleleng",
    kabupaten: "Buleleng",
    nama: "Raja Aldino Putra",
    nik: "5108021509010001",
    umur: "22 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Wiraswasta",
    tglLahir: "15 September 2004",
    alamat: "Jl. Ngurah Rai No. 12, Singaraja",
    desa: "Singaraja",
    kecamatan: "Buleleng",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Jalan Klinik Pratama BNNK Buleleng",
    tahunRehab: "2026",
    telepon: "081234567890",
    noHp: "081234567890",
    rehabKe: "Ke-1",
    statusProgres: "ON GOING",
    layananTeks: "Rawat Jalan\n(Klinik BNNK)",
    tujuanRujukan: "Klinik Pratama BNNK Buleleng",
    keterangan: "Klien kooperatif, rutin mengikuti pendampingan konseling rawat jalan di Klinik Pratama BNNK Buleleng.",
  },
  {
    id: "AUTO-2026-043",
    nomorSurat: "R/02/I/2026/BNNK-BLG",
    tglKedatangan: "Singaraja, 01 September 2026",
    kepada: "Balai Besar Rehabilitasi BNN Lido, Bogor",
    kabupaten: "Bogor",
    nama: "Ketut Agus Wirawan",
    nik: "5108012304980002",
    umur: "28 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Swasta",
    tglLahir: "23 April 1998",
    alamat: "Banjar Dinas Celuk, Sukasada",
    desa: "Panji Anom",
    kecamatan: "Sukasada",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Inap Balai Lido",
    tahunRehab: "2026",
    telepon: "081987654321",
    noHp: "081987654321",
    rehabKe: "Ke-1",
    statusProgres: "ON GOING",
    layananTeks: "Rawat Inap\n(Balai Lido)",
    tujuanRujukan: "Balai Besar Rehabilitasi BNN Lido, Bogor",
    keterangan: "Pasien telah menyelesaikan asesmen tahap 1 di Klinik BNNK Buleleng dan telah dikirim ke Balai Besar Rehabilitasi Lido Bogor untuk program rawat inap terpadu 3 bulan.",
  },
  {
    id: "AUTO-2026-042",
    nomorSurat: "R/03/I/2026/BNNK-BLG",
    tglKedatangan: "Singaraja, 28 Agustus 2026",
    kepada: "Klinik Pratama BNNK Buleleng",
    kabupaten: "Buleleng",
    nama: "Wayan Budi Santoso",
    nik: "5108021102920001",
    umur: "34 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Buruh",
    tglLahir: "11 Februari 1992",
    alamat: "Banyuning Tengah",
    desa: "Banyuning",
    kecamatan: "Buleleng",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Jalan Klinik Pratama BNNK Buleleng",
    tahunRehab: "2026",
    telepon: "085234567891",
    noHp: "085234567891",
    rehabKe: "Ke-1",
    statusProgres: "ON GOING",
    layananTeks: "Rawat Jalan\n(Klinik BNNK)",
    tujuanRujukan: "Klinik Pratama BNNK Buleleng",
    keterangan: "Konseling sesi ke-2 selesai. Klien kooperatif dan menunjukkan motivasi tinggi untuk pulih.",
  },
  {
    id: "AUTO-2026-041",
    nomorSurat: "R/04/I/2026/BNNK-BLG",
    tglKedatangan: "Singaraja, 15 Agustus 2026",
    kepada: "Klinik Pratama BNNK Buleleng",
    kabupaten: "Buleleng",
    nama: "Ni Kadek Ayu Larasati",
    nik: "5108035809990003",
    umur: "27 Tahun",
    gender: "perempuan",
    jenisKelamin: "Perempuan",
    pekerjaan: "Ibu Rumah Tangga",
    tglLahir: "18 September 1999",
    alamat: "Desa Bubunan, Seririt",
    desa: "Bubunan",
    kecamatan: "Seririt",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Jalan Klinik Pratama BNNK Buleleng",
    tahunRehab: "2026",
    telepon: "087812345678",
    noHp: "087812345678",
    rehabKe: "Ke-2",
    statusProgres: "ON GOING",
    layananTeks: "Rawat Jalan\n(Klinik BNNK)",
    tujuanRujukan: "Klinik Pratama BNNK Buleleng",
    keterangan: "Pemeriksaan asesmen lanjutan pasca-relapse ringan. Diberikan pendampingan psikologis intensif.",
  },
  {
    id: "AUTO-2026-040",
    nomorSurat: "R/05/I/2026/BNNK-BLG",
    tglKedatangan: "Singaraja, 10 Agustus 2026",
    kepada: "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali",
    kabupaten: "Bangli",
    nama: "Gede Raka Pratama",
    nik: "5108041907950004",
    umur: "31 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Petani",
    tglLahir: "19 Juli 1995",
    alamat: "Desa Patas, Gerokgak",
    desa: "Patas",
    kecamatan: "Gerokgak",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Inap RSJ Bangli",
    tahunRehab: "2026",
    telepon: "081333444555",
    noHp: "081333444555",
    rehabKe: "Ke-1",
    statusProgres: "ON GOING",
    layananTeks: "Rawat Inap\n(RSJ Bangli)",
    tujuanRujukan: "RSJ Provinsi Bali (Bangli)",
    keterangan: "Rujukan rawat inap terpadu dengan penyerta medis. Sedang menjalani fase stabilisasi medis.",
  },
  {
    id: "AUTO-2026-039",
    nomorSurat: "R/06/I/2026/BNNK-BLG",
    tglKedatangan: "Singaraja, 01 Juli 2026",
    kepada: "Klinik Pratama BNNK Buleleng",
    kabupaten: "Buleleng",
    nama: "Putu Hendra Wijaya",
    nik: "5108051204900005",
    umur: "36 Tahun",
    gender: "laki",
    jenisKelamin: "Laki-Laki",
    pekerjaan: "Pedagang",
    tglLahir: "12 April 1990",
    alamat: "Desa Dencarik, Banjar",
    desa: "Dencarik",
    kecamatan: "Banjar",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Jalan Klinik Pratama BNNK Buleleng",
    tahunRehab: "2026",
    telepon: "082145678901",
    noHp: "082145678901",
    rehabKe: "Ke-1",
    statusProgres: "SELESAI",
    layananTeks: "Rawat Jalan\n(Klinik BNNK)",
    tujuanRujukan: "Klinik Pratama BNNK Buleleng",
    keterangan: "Telah menyelesaikan 8 sesi rawat jalan dan pascarehabilitasi. Hasil tes skrining urine negatif.",
  },
  {
    id: "AUTO-2026-038",
    nomorSurat: "R/07/I/2026/BNNK-BLG",
    tglKedatangan: "Singaraja, 20 Juni 2026",
    kepada: "Klinik Pratama BNNK Buleleng",
    kabupaten: "Buleleng",
    nama: "Komang Sariani",
    nik: "5108066508930006",
    umur: "33 Tahun",
    gender: "perempuan",
    jenisKelamin: "Perempuan",
    pekerjaan: "Wiraswasta",
    tglLahir: "25 Agustus 1993",
    alamat: "Desa Sangsit, Sawan",
    desa: "Sangsit",
    kecamatan: "Sawan",
    kabupatenAsal: "Buleleng",
    statusRawat: "Rawat Jalan Klinik Pratama BNNK Buleleng",
    tahunRehab: "2026",
    telepon: "081298765432",
    noHp: "081298765432",
    rehabKe: "Ke-1",
    statusProgres: "DROP OUT",
    layananTeks: "Rawat Jalan\n(Klinik BNNK)",
    tujuanRujukan: "Klinik Pratama BNNK Buleleng",
    keterangan: "Mangkir konseling 3 kali berturut-turut tanpa keterangan. Petugas telah melakukan home visit 2 kali.",
  },
];

document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("simRehabUser") || sessionStorage.getItem("simRehabUser");
  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userData);
  currentUserRole = user.role || "super_user";
  initUserInfo(user);
  initSeedPatients();
  renderMonitoringTable();
  initFilterTabs();
  initSearch();
  initModalEvents();
  initLogout();
});

function initUserInfo(user) {
  const roleLabels = {
    petugas_rehab: "Petugas Rehabilitasi",
    super_user: "Super User (Kasi Rehab)",
    admin: "Administrator Sistem",
    dokter: "Dokter / Tenaga Medis",
  };

  const roleEl = document.getElementById("userRole");
  const idEl = document.getElementById("userId");

  if (roleEl) {
    roleEl.textContent = roleLabels[user.role] || "Super User (Kasi Rehab)";
  }
  if (idEl) {
    const displayName = user.username || "2121";
    idEl.textContent = `ID: ${displayName} (Seksi Rehab)`;
  }
}

function initSeedPatients() {
  const existing = localStorage.getItem("simRehabPatients");
  if (!existing) {
    localStorage.setItem("simRehabPatients", JSON.stringify(defaultSeedPatients));
  } else {
    try {
      const parsed = JSON.parse(existing);
      let changed = false;
      defaultSeedPatients.forEach((seed) => {
        if (!parsed.some((p) => String(p.nik).trim() === String(seed.nik).trim())) {
          parsed.push(seed);
          changed = true;
        }
      });
      if (changed) {
        localStorage.setItem("simRehabPatients", JSON.stringify(parsed));
      }
    } catch (e) {}
  }
}

function isInvalidPhone(val) {
  if (!val) return true;
  const s = String(val).trim().toLowerCase();
  if (s === "-" || s === "" || s === "null" || s === "undefined") return true;
  if (
    s.includes("rawat") ||
    s.includes("jalan") ||
    s.includes("inap") ||
    s.includes("bnn") ||
    s.includes("rsj") ||
    s.includes("lido") ||
    s.includes("klinik") ||
    s.includes("uptd") ||
    s.includes("bali") ||
    s.includes("surat") ||
    s.includes("singaraja") ||
    s.includes("buleleng") ||
    s.includes("kab")
  ) {
    return true;
  }
  return false;
}

function getPatientsData() {
  try {
    const list = JSON.parse(localStorage.getItem("simRehabPatients")) || [];
    let updated = false;
    const sanitized = list.map((p) => {
      let changed = false;
      let noHp = p.noHp;
      let telepon = p.telepon;
      if (isInvalidPhone(noHp)) {
        noHp = "-";
        changed = true;
      }
      if (isInvalidPhone(telepon)) {
        telepon = "-";
        changed = true;
      }
      if (changed) {
        updated = true;
        return { ...p, noHp, telepon };
      }
      return p;
    });
    if (updated) {
      localStorage.setItem("simRehabPatients", JSON.stringify(sanitized));
    }
    return sanitized;
  } catch (e) {
    return [];
  }
}

function renderMonitoringTable() {
  const tbody = document.getElementById("monitoringTbody");
  const countBadge = document.getElementById("totalDataCount");
  if (!tbody) return;

  const allPatients = getPatientsData();

  // Filter
  const filtered = allPatients.filter((p) => {
    const st = (p.statusProgres || "ON GOING").toUpperCase();
    if (currentFilterStatus === "ongoing" && st !== "ON GOING") return false;
    if (currentFilterStatus === "selesai" && st !== "SELESAI") return false;
    if (currentFilterStatus === "dropout" && st !== "DROP OUT") return false;

    if (currentFilterTahun !== "all") {
      const pTahun = String(p.tahunRehab || p.tglKedatangan || "").slice(-4);
      if (pTahun !== currentFilterTahun) return false;
    }

    const isRawatInap = (p.statusRawat || "").toLowerCase().includes("inap");
    if (currentFilterLayanan === "rawat_jalan" && isRawatInap) return false;
    if (currentFilterLayanan === "rawat_inap" && !isRawatInap) return false;

    if (currentSearchQuery) {
      const q = currentSearchQuery.toLowerCase();
      const matchName = (p.nama || "").toLowerCase().includes(q);
      const matchNik = String(p.nik || "").toLowerCase().includes(q);
      const matchNoSurat = String(p.nomorSurat || "").toLowerCase().includes(q);
      const matchKec = (p.kecamatan || "").toLowerCase().includes(q);
      const matchDesa = (p.desa || "").toLowerCase().includes(q);
      const matchRawat = (p.statusRawat || "").toLowerCase().includes(q);
      const matchKepada = (p.kepada || "").toLowerCase().includes(q);
      const matchHp = String(p.noHp || p.telepon || "").includes(q);
      return matchName || matchNik || matchNoSurat || matchKec || matchDesa || matchRawat || matchKepada || matchHp;
    }

    return true;
  });

  if (countBadge) {
    countBadge.textContent = `Total Pasien: ${filtered.length} Data`;
  }
  const toolbarCount = document.getElementById("tableToolbarCount");
  if (toolbarCount) {
    toolbarCount.textContent = `Total: ${filtered.length} Data Klien`;
  }

  tbody.innerHTML = "";

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="14" class="empty-state">
          <div style="font-size: 1.8rem; margin-bottom: 6px;">📋</div>
          <strong style="color: #334155;">Tidak ada data klien yang cocok</strong>
          <p>Coba ubah filter atau kata kunci pencarian Anda.</p>
        </td>
      </tr>
    `;
    return;
  }

  filtered.forEach((item, idx) => {
    const genderCode = (item.gender || item.jenisKelamin || "laki").toLowerCase().includes("p") ? "P" : "L";
    const umurDisplay = item.umur ? item.umur.replace("Tahun", "Th") : "28 Th";
    const stVal = (item.statusProgres || "ON GOING").toUpperCase();

    let badgeClass = "status-ongoing";
    if (stVal === "SELESAI") badgeClass = "status-selesai";
    if (stVal === "DROP OUT") badgeClass = "status-dropout";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="center">${idx + 1}</td>
      <td class="center" style="font-size: 0.74rem; color: #64748b;">${item.nomorSurat || "-"}</td>
      <td class="center" style="font-size: 0.74rem; white-space: normal;">${item.tglKedatangan || "-"}</td>
      <td>
        <div class="client-info">
          <span class="client-name" style="font-weight: 600;">${item.nama || "Klien"}</span>
          <span class="client-nik" style="font-size: 0.72rem; color: #64748b;">NIK: ${item.nik || "-"}</span>
        </div>
      </td>
      <td class="center" style="font-size: 0.75rem;">${genderCode} / ${umurDisplay}</td>
      <td style="font-size: 0.74rem;">${item.pekerjaan || "-"}</td>
      <td style="font-size: 0.74rem;">
        <div style="font-weight: 500;">${item.desa || item.alamat || "-"}</div>
        <div style="color: #64748b; font-size: 0.7rem;">Kec. ${item.kecamatan || "Buleleng"}, ${item.kabupatenAsal || "Buleleng"}</div>
      </td>
      <td style="font-size: 0.72rem;">
        <div style="color: #1e293b; font-weight: 500;">${item.kepada || item.tujuanRujukan || "-"}</div>
        <div style="color: #0284c7; font-weight: 600; font-size: 0.68rem;">📍 Kab. ${item.kabupaten || "Buleleng"}</div>
      </td>
      <td style="font-size: 0.72rem; font-weight: 500;">${item.statusRawat || "Rawat Jalan Klinik BNNK"}</td>
      <td class="center" style="font-size: 0.74rem; font-weight: 600;">${item.tahunRehab || "2026"}</td>
      <td class="center" style="font-size: 0.72rem; font-family: monospace;">${item.noHp || item.telepon || "-"}</td>
      <td class="center" style="font-size: 0.74rem;">${item.rehabKe || "Ke-1"}</td>
      <td class="center">
        <span class="badge-status ${badgeClass}" style="cursor: pointer; font-size: 0.7rem; padding: 2px 6px;" onclick="openModal('${item.nik}')">${stVal}</span>
      </td>
      <td class="center" style="white-space: nowrap;">
        <button type="button" class="btn-ubah" onclick="openModal('${item.nik}')">[Ubah]</button>
        <button type="button" class="btn-hapus" onclick="deletePatient('${item.nik}')">[Hapus]</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function initFilterTabs() {
  const tabs = document.querySelectorAll("#filterTabs .tab-btn");
  const tahunSelect = document.getElementById("filterTahunSelect");
  const layananSelect = document.getElementById("filterLayananSelect");

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      tabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      currentFilterStatus = tab.getAttribute("data-filter") || "all";
      renderMonitoringTable();
    });
  });

  if (tahunSelect) {
    tahunSelect.addEventListener("change", (e) => {
      currentFilterTahun = e.target.value;
      renderMonitoringTable();
    });
  }

  if (layananSelect) {
    layananSelect.addEventListener("change", (e) => {
      currentFilterLayanan = e.target.value;
      renderMonitoringTable();
    });
  }
}

function initSearch() {
  const searchInput = document.getElementById("searchPatient");
  if (!searchInput) return;

  searchInput.addEventListener("input", (e) => {
    currentSearchQuery = e.target.value.trim();
    renderMonitoringTable();
  });
}

window.openModal = function (nik) {
  selectedPatientNik = nik;
  const patients = getPatientsData();
  const patient = patients.find((p) => String(p.nik).trim() === String(nik).trim());
  if (!patient) return;

  const modal = document.getElementById("quickActionModal");
  const nameEl = document.getElementById("modalPatientName");
  const nikEl = document.getElementById("modalPatientNik");
  const kepadaSelect = document.getElementById("modalKepada");
  const statusRawatSelect = document.getElementById("modalStatusRawat");
  const notesEl = document.getElementById("modalNotes");

  if (nameEl) nameEl.textContent = patient.nama || "Klien";
  if (nikEl) nikEl.textContent = `NIK: ${patient.nik || "-"} • No Surat: ${patient.nomorSurat || "-"}`;
  if (notesEl) notesEl.value = patient.keterangan || "";
  if (kepadaSelect) kepadaSelect.value = patient.kepada || "Klinik Pratama BNNK Buleleng";
  if (statusRawatSelect) statusRawatSelect.value = patient.statusRawat || "Rawat Jalan Klinik Pratama BNNK Buleleng";

  const st = (patient.statusProgres || "ON GOING").toUpperCase();
  document.querySelectorAll(".status-card-opt").forEach((card) => {
    const radio = card.querySelector("input[type='radio']");
    if (card.getAttribute("data-val") === st) {
      card.classList.add("active");
      if (radio) radio.checked = true;
    } else {
      card.classList.remove("active");
      if (radio) radio.checked = false;
    }
  });

  if (modal) modal.classList.add("open");
};

function initModalEvents() {
  const modal = document.getElementById("quickActionModal");
  const closeBtn = document.getElementById("btnCloseModal");
  const cancelBtn = document.getElementById("btnCancelModal");
  const saveBtn = document.getElementById("btnSaveStatus");
  const printPdfBtn = document.getElementById("btnPrintPdf");
  const statusCards = document.querySelectorAll(".status-card-opt");

  statusCards.forEach((card) => {
    card.addEventListener("click", () => {
      statusCards.forEach((c) => c.classList.remove("active"));
      card.classList.add("active");
      const radio = card.querySelector("input[type='radio']");
      if (radio) radio.checked = true;
    });
  });

  function closeModal() {
    if (modal) modal.classList.remove("open");
    selectedPatientNik = null;
  }

  if (closeBtn) closeBtn.addEventListener("click", closeModal);
  if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

  if (printPdfBtn) {
    printPdfBtn.addEventListener("click", () => {
      window.print();
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener("click", () => {
      if (!selectedPatientNik) return;
      const patients = getPatientsData();
      const patientIdx = patients.findIndex((p) => String(p.nik).trim() === String(selectedPatientNik).trim());
      if (patientIdx === -1) return;

      const activeCard = document.querySelector(".status-card-opt.active");
      const newStatus = activeCard ? activeCard.getAttribute("data-val") : "ON GOING";
      const newKepada = document.getElementById("modalKepada")?.value || "";
      const newStatusRawat = document.getElementById("modalStatusRawat")?.value || "";
      const newNotes = document.getElementById("modalNotes")?.value || "";

      patients[patientIdx].statusProgres = newStatus;
      patients[patientIdx].kepada = newKepada;
      patients[patientIdx].statusRawat = newStatusRawat;
      patients[patientIdx].keterangan = newNotes;

      localStorage.setItem("simRehabPatients", JSON.stringify(patients));
      closeModal();
      renderMonitoringTable();

      const toast = document.getElementById("toastMsg");
      if (toast) {
        toast.innerHTML = `Status klien <strong>${patients[patientIdx].nama}</strong> berhasil diubah menjadi <strong>${newStatus}</strong>!`;
        toast.classList.add("show");
        setTimeout(() => toast.classList.remove("show"), 2000);
      }
    });
  }
}

window.deletePatient = function (nik) {
  const patients = getPatientsData();
  const p = patients.find((item) => String(item.nik).trim() === String(nik).trim());
  if (!p) return;

  const confirmDel = confirm(`Apakah Anda yakin ingin menghapus data rekam medis klien:\n"${p.nama}" (NIK: ${p.nik})?\n\nData yang dihapus tidak dapat dikembalikan.`);
  if (!confirmDel) return;

  const updated = patients.filter((item) => String(item.nik).trim() !== String(nik).trim());
  localStorage.setItem("simRehabPatients", JSON.stringify(updated));
  renderMonitoringTable();

  const toast = document.getElementById("toastMsg");
  if (toast) {
    toast.innerHTML = `Data klien <strong>${p.nama}</strong> berhasil dihapus.`;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 2000);
  }
};

function initLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("simRehabUser");
      sessionStorage.removeItem("simRehabUser");
      window.location.href = "index.html";
    });
  }
}
