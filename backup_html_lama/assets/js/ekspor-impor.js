let currentUserRole = "super_user";
let activeTabMode = "export";
let filterTahun = "semua";
let filterOngoing = true;
let filterSelesai = true;
let filterDropout = true;
let filterKecamatan = "semua";
let parsedImportData = [];

document.addEventListener("DOMContentLoaded", () => {
  const userData = localStorage.getItem("simRehabUser") || sessionStorage.getItem("simRehabUser");
  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userData);
  currentUserRole = user.role || "super_user";
  initUserInfo(user);
  initModeTabs();
  initExportFilters();
  initExportActions();
  initImportHandlers();
  initLogout();

  renderExportPreview();
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

function getPatientsData() {
  try {
    return JSON.parse(localStorage.getItem("simRehabPatients")) || [];
  } catch (e) {
    return [];
  }
}

function initModeTabs() {
  const tabExport = document.getElementById("tabBtnExport");
  const tabImport = document.getElementById("tabBtnImport");
  const panelExport = document.getElementById("exportViewPanel");
  const panelImport = document.getElementById("importViewPanel");

  if (tabExport && tabImport) {
    tabExport.addEventListener("click", () => {
      tabExport.className = "mode-tab-btn active";
      tabImport.className = "mode-tab-btn";
      tabExport.querySelector(".tab-indicator").textContent = "■";
      tabImport.querySelector(".tab-indicator").textContent = "□";
      panelExport.classList.remove("hidden");
      panelImport.classList.add("hidden");
      activeTabMode = "export";
      renderExportPreview();
    });

    tabImport.addEventListener("click", () => {
      tabImport.className = "mode-tab-btn active";
      tabExport.className = "mode-tab-btn";
      tabImport.querySelector(".tab-indicator").textContent = "■";
      tabExport.querySelector(".tab-indicator").textContent = "□";
      panelImport.classList.remove("hidden");
      panelExport.classList.add("hidden");
      activeTabMode = "import";
    });
  }
}

function initExportFilters() {
  const selTahun = document.getElementById("filterTahunExport");
  const chkOngoing = document.getElementById("chkOngoing");
  const chkSelesai = document.getElementById("chkSelesai");
  const chkDropout = document.getElementById("chkDropout");
  const selKec = document.getElementById("selectKecamatan");

  if (selTahun) selTahun.addEventListener("change", (e) => { filterTahun = e.target.value; renderExportPreview(); });
  if (chkOngoing) chkOngoing.addEventListener("change", (e) => { filterOngoing = e.target.checked; renderExportPreview(); });
  if (chkSelesai) chkSelesai.addEventListener("change", (e) => { filterSelesai = e.target.checked; renderExportPreview(); });
  if (chkDropout) chkDropout.addEventListener("change", (e) => { filterDropout = e.target.checked; renderExportPreview(); });
  if (selKec) selKec.addEventListener("change", (e) => { filterKecamatan = e.target.value; renderExportPreview(); });
}

function getFilteredExportData() {
  const patients = getPatientsData();
  return patients.filter((p) => {
    if (filterTahun !== "semua") {
      const pTahun = String(p.tahunRehab || p.tglKedatangan || "").slice(-4);
      if (pTahun !== filterTahun) return false;
    }

    const st = (p.statusProgres || "ON GOING").toUpperCase();
    if (st === "ON GOING" && !filterOngoing) return false;
    if (st === "SELESAI" && !filterSelesai) return false;
    if (st === "DROP OUT" && !filterDropout) return false;

    if (filterKecamatan !== "semua") {
      if ((p.kecamatan || "").toLowerCase() !== filterKecamatan.toLowerCase()) return false;
    }

    return true;
  });
}

function renderExportPreview() {
  const data = getFilteredExportData();
  const tbody = document.getElementById("exportTbody");
  const totalBadge = document.getElementById("totalExportBadge");
  const periodTitle = document.getElementById("previewPeriodTitle");

  if (periodTitle) {
    periodTitle.textContent = filterTahun === "semua" ? "2018 SAMPAI 2026" : `TAHUN ${filterTahun}`;
  }

  if (totalBadge) {
    totalBadge.textContent = `Total Terpilih: ${data.length} Data`;
  }

  if (!tbody) return;
  tbody.innerHTML = "";

  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="13" class="empty-state-cell">
          <div style="font-size: 1.8rem; margin-bottom: 4px;">📂</div>
          <strong style="color: #334155;">Tidak Ada Data yang Sesuai Parameter Filter</strong>
          <p>Silakan sesuaikan pilihan tahun, status rawatan, atau kecamatan.</p>
        </td>
      </tr>
    `;
    return;
  }

  data.forEach((p, idx) => {
    const genderCode = (p.gender || p.jenisKelamin || "laki").toLowerCase().includes("p") ? "P" : "L";
    const umurDisplay = p.umur ? p.umur.replace("Tahun", "Th") : "28 Th";
    const stVal = (p.statusProgres || "ON GOING").toUpperCase();
    let badgeClass = "status-ongoing";
    if (stVal === "SELESAI") badgeClass = "status-selesai";
    if (stVal === "DROP OUT") badgeClass = "status-dropout";

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="center">${idx + 1}</td>
      <td class="center" style="font-size: 0.74rem;">${p.nomorSurat || "-"}</td>
      <td style="font-size: 0.73rem;">${p.tglKedatangan || "-"}</td>
      <td style="font-size: 0.73rem;">${p.kepada || p.tujuanRujukan || "-"}</td>
      <td style="font-size: 0.73rem; font-weight: 500;">${p.kabupaten || "Buleleng"}</td>
      <td style="font-size: 0.75rem; font-weight: 600;">${p.nama || "-"}</td>
      <td class="center" style="font-size: 0.73rem;">${genderCode} / ${umurDisplay}</td>
      <td style="font-size: 0.73rem;">${p.pekerjaan || "-"}</td>
      <td style="font-size: 0.73rem;">${p.desa || p.kecamatan || "-"}</td>
      <td style="font-size: 0.72rem;">${p.statusRawat || "Rawat Jalan Klinik BNNK"}</td>
      <td class="center" style="font-size: 0.74rem; font-weight: 600;">${p.tahunRehab || "2026"}</td>
      <td style="font-size: 0.72rem; font-family: monospace;">${p.noHp || p.telepon || "-"}</td>
      <td class="center">
        <span class="badge-status ${badgeClass}" style="font-size: 0.68rem;">${stVal}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function formatDateIndo(dateObj) {
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember",
  ];
  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = months[dateObj.getMonth()];
  const year = dateObj.getFullYear();
  return `${day} ${month} ${year}`;
}

function initExportActions() {
  const btnExcel = document.getElementById("btnExportExcel");
  const btnPdf = document.getElementById("btnExportPdf");

  if (btnExcel) {
    btnExcel.addEventListener("click", () => {
      const data = getFilteredExportData();
      if (data.length === 0) {
        showToast("Tidak ada data klien yang terpilih untuk diekspor!", true);
        return;
      }

      if (typeof XLSX === "undefined") {
        showToast("Library SheetJS sedang dimuat, mohon coba lagi.", true);
        return;
      }

      const rows = [];
      rows.push(["DATA KLIEN REHABILITASI DI KLINIK PRATAMA BNNK BULELENG"]);
      rows.push([filterTahun !== "semua" ? `TAHUN ${filterTahun}` : "2018 SAMPAI 2026"]);
      rows.push([]);

      rows.push([
        "No",
        "Nomor Surat",
        "Tgl Kedatangan",
        "Kepada",
        "Kabupaten",
        "Nama",
        "Umur",
        "Jenis Kelamin",
        "Pekerjaan",
        "Tgl Lahir",
        "Alamat",
        "Desa/Kelurahan",
        "Kecamatan Asal",
        "Kabupaten Asal",
        "Status Rawat",
        "Tahun Rehab",
        "No Hp",
        "NIK",
        "Status Progres",
        "Keterangan",
      ]);

      data.forEach((p, idx) => {
        rows.push([
          idx + 1,
          p.nomorSurat || "-",
          p.tglKedatangan || "-",
          p.kepada || p.tujuanRujukan || "Klinik Pratama BNNK Buleleng",
          p.kabupaten || "Buleleng",
          p.nama || "-",
          p.umur || "-",
          p.jenisKelamin || (p.gender === "perempuan" ? "Perempuan" : "Laki-Laki"),
          p.pekerjaan || "Tidak Bekerja",
          p.tglLahir || "-",
          p.alamat || "-",
          p.desa || "-",
          p.kecamatan || "Buleleng",
          p.kabupatenAsal || "Buleleng",
          p.statusRawat || "Rawat Jalan Klinik Pratama BNNK Buleleng",
          p.tahunRehab || "2026",
          `'${p.noHp || p.telepon || "-"}`,
          `'${p.nik || "-"}`,
          (p.statusProgres || "ON GOING").toUpperCase(),
          p.keterangan || "-",
        ]);
      });

      rows.push([]);
      rows.push([]);
      rows.push(["", "", "", "", "", "", "", "", "", "", "", "", "Singaraja, " + formatDateIndo(new Date())]);
      rows.push(["", "", "", "", "", "", "", "", "", "", "", "", "Kepala BNN Kabupaten Buleleng"]);
      rows.push([]);
      rows.push([]);
      rows.push(["", "", "", "", "", "", "", "", "", "", "", "", "AKBP Gede Astawa, S.H., M.H."]);
      rows.push(["", "", "", "", "", "", "", "", "", "", "", "", "NIP. 19741120 199903 1 001"]);

      const ws = XLSX.utils.aoa_to_sheet(rows);
      ws["!cols"] = [
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
      XLSX.utils.book_append_sheet(wb, ws, "DATA KLIEN");

      const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const fileName = `DATA_KLIEN_REHABILITASI_BNNK_BULELENG_2018_2026_${todayStr}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast(`File spreadsheet resmi BNN '${fileName}' berhasil diunduh!`);
    });
  }

  if (btnPdf) {
    btnPdf.addEventListener("click", () => {
      const data = getFilteredExportData();
      if (data.length === 0) {
        showToast("Tidak ada data pasien yang terpilih untuk dicetak!", true);
        return;
      }

      // Update printable table
      const printTbody = document.getElementById("printTbody");
      const printPeriodeTxt = document.getElementById("printPeriodeTxt");
      const printWilayahTxt = document.getElementById("printWilayahTxt");
      const printStatusTxt = document.getElementById("printStatusTxt");
      const printTotalTxt = document.getElementById("printTotalTxt");
      const printTtdDate = document.getElementById("printTtdDate");

      if (printPeriodeTxt) printPeriodeTxt.textContent = filterTahun === "semua" ? "2018 SAMPAI 2026" : `TAHUN ${filterTahun}`;
      if (printWilayahTxt) printWilayahTxt.textContent = filterKecamatan === "semua" ? "Seluruh Kecamatan (Kab. Buleleng)" : `Kecamatan ${filterKecamatan.toUpperCase()}`;
      if (printStatusTxt) {
        const active = [];
        if (filterOngoing) active.push("On Going");
        if (filterSelesai) active.push("Selesai");
        if (filterDropout) active.push("DO");
        printStatusTxt.textContent = active.join(", ") || "Semua Status";
      }
      if (printTotalTxt) printTotalTxt.textContent = `${data.length} Klien Terdaftar`;
      if (printTtdDate) printTtdDate.textContent = `Singaraja, ${formatDateIndo(new Date())}`;

      if (printTbody) {
        printTbody.innerHTML = "";
        data.forEach((p, idx) => {
          const genderCode = (p.gender || p.jenisKelamin || "laki").toLowerCase().includes("p") ? "P" : "L";
          const umurDisplay = p.umur ? p.umur.replace("Tahun", "Th") : "28 Th";
          const tr = document.createElement("tr");
          tr.innerHTML = `
            <td class="center">${idx + 1}</td>
            <td class="center" style="font-size: 7pt;">${p.nomorSurat || "-"}</td>
            <td style="font-size: 7pt;">${p.tglKedatangan || "-"}</td>
            <td style="font-size: 6.8pt;">${p.kepada || p.tujuanRujukan || "-"}</td>
            <td style="font-size: 7pt;">${p.kabupaten || "Buleleng"}</td>
            <td style="font-size: 7.5pt;"><strong>${p.nama || "Klien"}</strong></td>
            <td class="center" style="font-size: 7pt;">${genderCode}/${umurDisplay}</td>
            <td style="font-size: 7pt;">${p.pekerjaan || "-"}</td>
            <td style="font-size: 7pt;">${p.desa || p.kecamatan || "-"}</td>
            <td style="font-size: 6.8pt;">${p.statusRawat || "Rawat Jalan Klinik BNNK"}</td>
            <td class="center" style="font-size: 7pt;">${p.tahunRehab || "2026"}</td>
            <td style="font-size: 6.8pt; font-family: monospace;">${p.noHp || p.telepon || "-"}</td>
            <td class="center" style="font-size: 7pt;"><strong>${(p.statusProgres || "ON GOING").toUpperCase()}</strong></td>
          `;
          printTbody.appendChild(tr);
        });
      }

      window.print();
    });
  }
}

function initImportHandlers() {
  const btnTemplate = document.getElementById("btnDownloadTemplate");
  const fileInput = document.getElementById("fileInputExcel");
  const btnBrowse = document.getElementById("btnBrowseFile");
  const dropzone = document.getElementById("dropzoneBox");
  const btnProcess = document.getElementById("btnProcessImport");
  const btnCancel = document.getElementById("btnCancelImport");

  if (btnTemplate) {
    btnTemplate.addEventListener("click", () => {
      if (typeof XLSX === "undefined") {
        showToast("Library SheetJS sedang dimuat, mohon coba lagi.", true);
        return;
      }

      const headers = [
        "No",
        "Nomor Surat",
        "Tgl Kedatangan",
        "Kepada",
        "Kabupaten",
        "Nama",
        "Umur",
        "Jenis Kelamin",
        "Pekerjaan",
        "Tgl Lahir",
        "Alamat",
        "Desa/Kelurahan",
        "Kecamatan Asal",
        "Kabupaten Asal",
        "Status Rawat",
        "Tahun Rehab",
        "No Hp",
        "NIK (16 Digit)",
        "Status Progres (ON GOING/SELESAI/DROP OUT)",
        "Keterangan",
      ];

      const sampleRows = [
        [
          1,
          "-",
          "Singaraja, 28 Nopember 2018",
          "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali",
          "Bangli",
          "Putu Jaka",
          "26 Tahun",
          "Laki-Laki",
          "Tidak Bekerja",
          "10 Oktober 1999",
          "Desa Baktiseraga, Gg. Arjuna No. 5",
          "Baktiseraga",
          "Buleleng",
          "Buleleng",
          "Rawat Inap RSJ Bangli",
          "2018",
          "087853981178",
          "5108021010990001",
          "SELESAI",
          "Rujukan rawat inap stabilisasi medis di RSJ Bangli.",
        ],
        [
          2,
          "-",
          "Singaraja, 28 Nopember 2018",
          "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali",
          "Bangli",
          "Gede Sudiadnyana",
          "44 Tahun",
          "Laki-Laki",
          "Buruh",
          "1981",
          "Banjar Kawan, Desa Tejakula",
          "Tejakula",
          "Tejakula",
          "Buleleng",
          "Rawat Inap RSJ Bangli",
          "2018",
          "081337819456",
          "5108091506810002",
          "SELESAI",
          "Telah menyelesaikan program detoksifikasi di RSJ Bangli.",
        ],
        [
          3,
          "-",
          "Singaraja, 24 Desember 2018",
          "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali",
          "Bangli",
          "Made Redita",
          "43 Tahun",
          "Laki-Laki",
          "Buruh",
          "5 Desember 1982",
          "Br. Enjung Sangiang, Kaliasem",
          "Kaliasem",
          "Banjar",
          "Buleleng",
          "Rawat Inap RSJ Bangli",
          "2018",
          "081337776384",
          "5108050512820001",
          "SELESAI",
          "Program rehabilitasi rawat inap terpadu selesai.",
        ],
        [
          4,
          "-",
          "Singaraja, 28 Desember 2018",
          "Kepala Badan Narkotika Nasional Provinsi Bali Cq. Kepala Bidang Rehabilitasi",
          "Denpasar",
          "Kadek Risky Setiawan",
          "25 Tahun",
          "Laki-Laki",
          "Tidak Bekerja",
          "25 September 2000",
          "Br. Sari Mekar, Desa Pemuteran",
          "Pemuteran",
          "Gerokgak",
          "Buleleng",
          "Rawat Jalan BNNP Bali",
          "2018",
          "087753212465",
          "5108042509000003",
          "SELESAI",
          "Pelayanan rawat jalan selesai di BNNP Bali.",
        ],
        [
          5,
          "R/01/I/2026/BNNK-BLG",
          "Singaraja, 01 September 2026",
          "Klinik Pratama BNNK Buleleng",
          "Buleleng",
          "Raja Aldino Putra",
          "22 Tahun",
          "Laki-Laki",
          "Wiraswasta",
          "15 September 2004",
          "Jl. Ngurah Rai No. 12, Singaraja",
          "Singaraja",
          "Buleleng",
          "Buleleng",
          "Rawat Jalan Klinik Pratama BNNK Buleleng",
          "2026",
          "081234567890",
          "5108021509010001",
          "ON GOING",
          "Klien kooperatif, rutin mengikuti pendampingan konseling rawat jalan.",
        ],
      ];

      const data = [
        ["DATA KLIEN REHABILITASI DI KLINIK PRATAMA BNNK BULELENG 2018 SAMPAI 2026"],
        [],
        headers,
        ...sampleRows,
      ];

      const ws = XLSX.utils.aoa_to_sheet(data);
      ws["!cols"] = [
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
      XLSX.utils.book_append_sheet(wb, ws, "DATA KLIEN");
      XLSX.writeFile(wb, "TEMPLATE_DATA_KLIEN_REHABILITASI_BNNK_BULELENG_2018_2026.xlsx");
      showToast("Template resmi spreadsheet BNNK Buleleng berhasil diunduh!");
    });
  }

  if (btnBrowse && fileInput) {
    btnBrowse.addEventListener("click", (e) => {
      e.stopPropagation();
      fileInput.click();
    });
  }

  if (dropzone && fileInput) {
    dropzone.addEventListener("click", () => fileInput.click());

    dropzone.addEventListener("dragover", (e) => {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });

    dropzone.addEventListener("dragleave", () => {
      dropzone.classList.remove("dragover");
    });

    dropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      const file = e.dataTransfer.files[0];
      if (file) handleIncomingFile(file);
    });

    fileInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) handleIncomingFile(file);
    });
  }

  if (btnProcess) {
    btnProcess.addEventListener("click", () => {
      if (parsedImportData.length === 0) {
        showToast("Tidak ada data yang dapat diimpor!", true);
        return;
      }

      const importMode = document.querySelector('input[name="importMode"]:checked')?.value || "append";
      let currentPatients = getPatientsData();

      if (importMode === "overwrite") {
        currentPatients = [...parsedImportData];
      } else {
        parsedImportData.forEach((newItem) => {
          const idx = currentPatients.findIndex(
            (p) => String(p.nik).trim() === String(newItem.nik).trim()
          );
          if (idx !== -1) {
            currentPatients[idx] = { ...currentPatients[idx], ...newItem };
          } else {
            currentPatients.push(newItem);
          }
        });
      }

      localStorage.setItem("simRehabPatients", JSON.stringify(currentPatients));
      showToast(`Sukses! ${parsedImportData.length} data arsip resmi BNN berhasil dimasukkan ke sistem.`);

      // Reset
      parsedImportData = [];
      document.getElementById("importPreviewCard")?.classList.add("hidden");
      document.getElementById("fileNameIndicator").textContent = "";
      if (fileInput) fileInput.value = "";

      setTimeout(() => {
        document.getElementById("tabBtnExport")?.click();
      }, 1200);
    });
  }

  if (btnCancel) {
    btnCancel.addEventListener("click", () => {
      parsedImportData = [];
      document.getElementById("importPreviewCard")?.classList.add("hidden");
      document.getElementById("fileNameIndicator").textContent = "";
      if (fileInput) fileInput.value = "";
    });
  }
}

function handleIncomingFile(file) {
  const indicator = document.getElementById("fileNameIndicator");
  if (indicator) {
    indicator.textContent = `File terpilih: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      parseAndValidateImport(jsonData);
    } catch (err) {
      showToast("Gagal membaca file spreadsheet. Pastikan format file valid.", true);
    }
  };
  reader.readAsArrayBuffer(file);
}

function parseAndValidateImport(sheetRows) {
  if (!sheetRows || sheetRows.length <= 1) {
    showToast("File tidak memiliki baris data yang valid!", true);
    return;
  }

  let headerRowIdx = -1;
  for (let r = 0; r < Math.min(sheetRows.length, 10); r++) {
    const row = sheetRows[r];
    if (Array.isArray(row) && row.some((c) => {
      const s = String(c || "").toLowerCase();
      return s.includes("nama") || s.includes("kedatangan") || s.includes("kepada");
    })) {
      headerRowIdx = r;
      break;
    }
  }

  if (headerRowIdx === -1) headerRowIdx = 0;

  const headerRow = sheetRows[headerRowIdx].map((c) => String(c || "").toLowerCase().trim());
  const findCol = (keywords, excludeKeywords = []) => {
    return headerRow.findIndex((h) => {
      if (excludeKeywords.some((ex) => h.includes(ex.toLowerCase()))) return false;
      return keywords.some((k) => {
        const kw = k.toLowerCase();
        if (h === kw) return true;
        if (h.includes(kw) && kw.length >= 4) return true;
        const regex = new RegExp(`(^|[^a-z0-9])${kw}([^a-z0-9]|$)`, "i");
        return regex.test(h);
      });
    });
  };

  const colNoSurat = findCol(["nomor surat", "no. surat", "no surat", "surat"]);
  const colTglDatang = findCol(["tgl kedatangan", "kedatangan", "tgl masuk", "tgl datang", "tanggal"], ["lahir"]);
  const colKepada = findCol(["kepada", "instansi", "tujuan rujukan", "tujuan"]);
  const colKabupaten = findCol(["kabupaten", "kab."], ["asal"]);
  const colNama = findCol(["nama klien", "nama pasien", "nama"]);
  const colUmur = findCol(["umur", "usia"]);
  const colGender = findCol(["jenis kelamin", "kelamin", "gender", "jk"]);
  const colPekerjaan = findCol(["pekerjaan", "profesi"]);
  const colTglLahir = findCol(["tgl lahir", "tanggal lahir", "lahir"]);
  const colAlamat = findCol(["alamat", "domisili", "banjar", "tempat tinggal"], ["rawat"]);
  const colDesa = findCol(["desa", "kelurahan"]);
  const colKecamatan = findCol(["kecamatan", "kec."]);
  const colKabAsal = findCol(["kabupaten asal", "kab asal", "asal"]);
  const colStatusRawat = findCol(["status rawat", "rawatan", "jenis rawat", "rawat", "layanan"]);
  const colTahunRehab = findCol(["tahun rehab", "tahun"]);
  const colNoHp = findCol(["no hp", "nomor hp", "telepon", "telp", "no telp", "no wa", "wa", "hp"], ["rawat", "inap"]);
  const colNik = findCol(["nik", "ktp", "identitas"]);
  const colStatusProgres = findCol(["status progres", "progres", "status"], ["rawat"]);
  const colKeterangan = findCol(["keterangan", "catatan"]);

  const isInvalidPhone = (val) => {
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
  };

  const parsed = [];
  const targetYear = document.getElementById("importTahunTarget")?.value || "2026";

  for (let i = headerRowIdx + 1; i < sheetRows.length; i++) {
    const row = sheetRows[i];
    if (!row || row.length === 0) continue;

    const rawNama = colNama !== -1 ? String(row[colNama] || "").trim() : String(row[5] || row[1] || "").trim();
    if (!rawNama || rawNama.toLowerCase() === "nama" || rawNama.toLowerCase().includes("kepala bnn")) continue;

    const nomorSurat = colNoSurat !== -1 ? String(row[colNoSurat] || "-").trim() : "-";
    let tglKedatangan = colTglDatang !== -1 ? String(row[colTglDatang] || "").trim() : "";
    const kepada = colKepada !== -1 ? String(row[colKepada] || "").trim() : "Klinik Pratama BNNK Buleleng";
    const kabupaten = colKabupaten !== -1 ? String(row[colKabupaten] || "Buleleng").trim() : "Buleleng";
    const umur = colUmur !== -1 ? String(row[colUmur] || "25 Tahun").trim() : "25 Tahun";
    const rawGender = colGender !== -1 ? String(row[colGender] || "Laki-Laki").trim() : "Laki-Laki";
    const pekerjaan = colPekerjaan !== -1 ? String(row[colPekerjaan] || "Tidak Bekerja").trim() : "Tidak Bekerja";
    const tglLahir = colTglLahir !== -1 ? String(row[colTglLahir] || "-").trim() : "-";
    const alamat = colAlamat !== -1 ? String(row[colAlamat] || "-").trim() : "-";
    const desa = colDesa !== -1 ? String(row[colDesa] || "-").trim() : "-";
    const kecamatan = colKecamatan !== -1 ? String(row[colKecamatan] || "Buleleng").trim() : "Buleleng";
    const kabupatenAsal = colKabAsal !== -1 ? String(row[colKabAsal] || "Buleleng").trim() : "Buleleng";
    const statusRawat = colStatusRawat !== -1 ? String(row[colStatusRawat] || "").trim() : "Rawat Jalan Klinik Pratama BNNK Buleleng";
    let tahunRehab = colTahunRehab !== -1 ? String(row[colTahunRehab] || "").trim() : "";
    let noHp = colNoHp !== -1 ? String(row[colNoHp] || "-").replace(/['"]/g, "").trim() : "-";
    if (isInvalidPhone(noHp)) noHp = "-";
    let rawNik = colNik !== -1 ? String(row[colNik] || "").replace(/['"\s-]/g, "") : "";
    let statusProgres = colStatusProgres !== -1 ? String(row[colStatusProgres] || "ON GOING").toUpperCase().trim() : "ON GOING";
    const keterangan = colKeterangan !== -1 ? String(row[colKeterangan] || "").trim() : "Data diimpor dari dokumen arsip resmi BNNK Buleleng.";

    if (!isNaN(tglKedatangan) && Number(tglKedatangan) > 20000) {
      const parsedDate = new Date((Number(tglKedatangan) - 25569) * 86400 * 1000);
      tglKedatangan = `Singaraja, ${formatDateIndo(parsedDate)}`;
    } else if (!tglKedatangan) {
      tglKedatangan = `Singaraja, 01 Januari ${targetYear === "lainnya" ? "2026" : targetYear}`;
    }

    if (!tahunRehab) {
      tahunRehab = tglKedatangan.slice(-4) || (targetYear === "lainnya" ? "2026" : targetYear);
    }

    if (statusProgres.includes("SELESAI") || statusProgres.includes("PULIH")) {
      statusProgres = "SELESAI";
    } else if (statusProgres.includes("DO") || statusProgres.includes("DROP")) {
      statusProgres = "DROP OUT";
    } else {
      statusProgres = "ON GOING";
    }

    const gender = rawGender.toLowerCase().includes("p") ? "perempuan" : "laki";
    const jenisKelamin = gender === "perempuan" ? "Perempuan" : "Laki-Laki";

    let layananTeks = "";
    if (statusRawat.toLowerCase().includes("inap")) {
      const rujukanSingkat = kepada.includes("Lido")
        ? "(Balai Lido)"
        : kepada.includes("RSJ")
        ? "(RSJ Bangli)"
        : `(${kabupaten})`;
      layananTeks = `Rawat Inap\n${rujukanSingkat}`;
    } else {
      layananTeks = statusRawat.includes("BNNP")
        ? "Rawat Jalan\n(BNNP Bali)"
        : "Rawat Jalan\n(Klinik BNNK)";
    }

    if (!rawNik) {
      rawNik = `5108${tahunRehab}000000${String(parsed.length + 1).padStart(2, "0")}`;
    }

    let isValid = true;
    let valMessage = "Siap Diimpor";
    let valClass = "valid";

    if (!rawNama) {
      isValid = false;
      valMessage = "Nama Kosong";
      valClass = "invalid";
    } else if (rawNik.length !== 16 || isNaN(rawNik)) {
      valMessage = "Format NIK";
      valClass = "warning";
    }

    parsed.push({
      id: `IMPORT-${tahunRehab}-${String(parsed.length + 1).padStart(3, "0")}`,
      nomorSurat,
      tglKedatangan,
      kepada,
      kabupaten,
      nama: rawNama,
      nik: rawNik,
      umur: umur.includes("Tahun") || umur.includes("Th") ? umur : `${umur} Tahun`,
      gender,
      jenisKelamin,
      pekerjaan,
      tglLahir,
      alamat,
      desa,
      kecamatan,
      kabupatenAsal,
      statusRawat: statusRawat || "Rawat Jalan Klinik Pratama BNNK Buleleng",
      tahunRehab,
      telepon: noHp,
      noHp,
      rehabKe: "Ke-1",
      statusProgres,
      layananTeks,
      tujuanRujukan: kepada,
      keterangan,
      _isValid: isValid,
      _valMessage: valMessage,
      _valClass: valClass,
    });
  }

  parsedImportData = parsed;
  renderImportPreview();
}

function renderImportPreview() {
  const card = document.getElementById("importPreviewCard");
  const tbody = document.getElementById("importPreviewTbody");
  const summary = document.getElementById("importPreviewSummary");

  if (!card || !tbody) return;

  if (parsedImportData.length === 0) {
    card.classList.add("hidden");
    return;
  }

  card.classList.remove("hidden");

  const countValid = parsedImportData.filter((d) => d._valClass === "valid").length;
  const countWarn = parsedImportData.filter((d) => d._valClass === "warning").length;
  const countInvalid = parsedImportData.filter((d) => d._valClass === "invalid").length;

  if (summary) {
    summary.textContent = `Terbaca: ${parsedImportData.length} Data Klien | Valid: ${countValid} | Catatan Format: ${countWarn} | Tidak Valid: ${countInvalid}`;
  }

  tbody.innerHTML = "";
  parsedImportData.forEach((item, idx) => {
    const genderCode = item.gender === "perempuan" ? "P" : "L";
    const kecDesa = `${item.desa || "-"}${item.kecamatan ? ", " + item.kecamatan : ""}`;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="center">${idx + 1}</td>
      <td class="center" style="font-size: 0.74rem;">${item.nomorSurat}</td>
      <td style="font-size: 0.73rem;">${item.tglKedatangan}</td>
      <td><strong>${item.nama}</strong></td>
      <td class="center" style="font-size: 0.73rem;">${genderCode} / ${item.umur}</td>
      <td style="font-size: 0.73rem;">${kecDesa}</td>
      <td style="font-size: 0.73rem;">${item.kepada}</td>
      <td style="font-size: 0.72rem;">${item.statusRawat}</td>
      <td class="center" style="font-size: 0.74rem; font-weight: 600;">${item.tahunRehab}</td>
      <td style="font-size: 0.72rem; font-family: monospace;">${item.noHp}</td>
      <td class="center">
        <span class="badge-status ${
          item.statusProgres === "SELESAI"
            ? "status-selesai"
            : item.statusProgres === "DROP OUT"
            ? "status-dropout"
            : "status-ongoing"
        }" style="font-size: 0.68rem;">${item.statusProgres}</span>
      </td>
      <td class="center">
        <span class="badge-val ${item._valClass}">${item._valMessage}</span>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function showToast(msg, isError = false) {
  const toast = document.getElementById("toastMsg");
  if (!toast) return;
  toast.innerHTML = msg;
  toast.style.background = isError ? "#b91c1c" : "#1e293b";
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 3000);
}

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
