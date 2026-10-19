document.addEventListener("DOMContentLoaded", () => {
  // 1. Cek Sesi Login (prioritas localStorage, fallback sessionStorage)
  const userData = localStorage.getItem("simRehabUser") || sessionStorage.getItem("simRehabUser");
  if (!userData) {
    window.location.href = "index.html";
    return;
  }

  const user = JSON.parse(userData);
  initUserInfo(user);
  initDesaDropdown();
  initAgeCalculator();
  initKepadaRujukanHandler();
  initRehabHistoryDetector();
  initFormSubmit();
  initLogout();
  generateMedicalRecordId();
  initTodayDate();
});

// User Session Info
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

// Data Desa/Kelurahan per Kecamatan di Kabupaten Buleleng
const desaBuleleng = {
  sukasada: [
    "Panji Anom",
    "Panji",
    "Sukasada",
    "Ambengan",
    "Sambangan",
    "Gitgit",
    "Pegadungan",
    "Kayuputih",
    "Silangjana",
    "Padangbulia",
    "Wanagiri",
    "Pegayaman",
    "Tegal Linggah",
  ],
  buleleng: [
    "Singaraja",
    "Paket Agung",
    "Kaliuntu",
    "Kampung Anyar",
    "Banjar Bali",
    "Banjar Tegal",
    "Banyuasri",
    "Banyuning",
    "Beratan",
    "Penarukan",
    "Anturan",
    "Kalibukbuk",
    "Pemaron",
    "Tukadmungga",
    "Jinengdalem",
    "Alasangker",
  ],
  seririt: [
    "Seririt",
    "Banjar Asem",
    "Bubunan",
    "Gunungsari",
    "Joanyar",
    "Kalianget",
    "Lokapaksa",
    "Mayong",
    "Pangkungparuk",
    "Patemon",
    "Pengastulan",
    "Ringdikit",
    "Sulanyah",
    "Tangguwisia",
    "Umeanyar",
  ],
  gerokgak: [
    "Gerokgak",
    "Banyupoh",
    "Celukan Bawang",
    "Musi",
    "Patas",
    "Pejarakan",
    "Pemuteran",
    "Pengulon",
    "Penyabangan",
    "Sanggalangit",
    "Sumberkima",
    "Sumberklampok",
    "Tinga-Tinga",
    "Tukadsumaga",
  ],
  banjar: [
    "Banjar",
    "Banjar Tegeha",
    "Banyuatis",
    "Banyuseri",
    "Cempaga",
    "Dencarik",
    "Gesing",
    "Gobleg",
    "Kaliasem",
    "Kayuputih",
    "Munduk",
    "Pedawa",
    "Sidetapa",
    "Tampekan",
    "Temukus",
    "Tigawasa",
  ],
  sawan: [
    "Sangsit",
    "Sawan",
    "Bebetin",
    "Bungkulan",
    "Giri Emas",
    "Jagaraga",
    "Kerobokan",
    "Lemukih",
    "Menyali",
    "Sekumpul",
    "Sinabun",
    "Sudaji",
    "Suwug",
  ],
  kubutambahan: [
    "Kubutambahan",
    "Bengkala",
    "Bila",
    "Bontihing",
    "Bukti",
    "Bulian",
    "Depeha",
    "Mengening",
    "Pakisan",
    "Tajun",
    "Tambakan",
    "Tamblang",
  ],
  busungbiu: [
    "Busungbiu",
    "Bengkel",
    "Bongancina",
    "Kekeran",
    "Pelapuan",
    "Pucaksari",
    "Sepang",
    "Sepang Kelod",
    "Subuk",
    "Telaga",
    "Tinggarsari",
    "Titab",
    "Umejero",
  ],
  tejakula: [
    "Tejakula",
    "Bondalem",
    "Julah",
    "Les",
    "Madenan",
    "Pacung",
    "Penuktukan",
    "Sambirenteng",
    "Sembiran",
    "Tembok",
  ],
};

// 2. Inisialisasi Tanggal Hari Ini
function initTodayDate() {
  const dateInput = document.getElementById("tglKedatangan");
  if (dateInput && !dateInput.value) {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    dateInput.value = `${yyyy}-${mm}-${dd}`;
  }
}

// 3. Dropdown Desa Dinamis berdasarkan Kecamatan
function initDesaDropdown() {
  const kecSelect = document.getElementById("kecamatan");
  const desaSelect = document.getElementById("desa");

  if (!kecSelect || !desaSelect) return;

  function updateDesa() {
    const selectedKec = kecSelect.value;
    const listDesa = desaBuleleng[selectedKec] || [];

    desaSelect.innerHTML = "";
    listDesa.forEach((desa) => {
      const opt = document.createElement("option");
      opt.value = desa.toLowerCase().replace(/\s+/g, "_");
      opt.textContent = desa;
      desaSelect.appendChild(opt);
    });
  }

  kecSelect.addEventListener("change", updateDesa);
  updateDesa();
}

// 4. Kalkulator Umur Otomatis dari Tanggal Lahir
function initAgeCalculator() {
  const tglLahirInput = document.getElementById("tglLahir");
  const umurInput = document.getElementById("umur");

  if (!tglLahirInput || !umurInput) return;

  tglLahirInput.addEventListener("change", () => {
    const val = tglLahirInput.value;
    if (!val) {
      umurInput.value = "-";
      return;
    }

    const birthDate = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    umurInput.value = age >= 0 ? `${age} Tahun` : "0 Tahun";
  });
}

// 5. Handler Instansi Rujukan & Kabupaten Tujuan
function initKepadaRujukanHandler() {
  const kepadaSelect = document.getElementById("kepada");
  const kabRujukanInput = document.getElementById("kabupatenRujukan");
  const statusRawatSelect = document.getElementById("statusRawat");

  if (!kepadaSelect || !kabRujukanInput || !statusRawatSelect) return;

  const mapping = {
    "Klinik Pratama BNNK Buleleng": {
      kab: "Buleleng",
      status: "Rawat Jalan Klinik Pratama BNNK Buleleng",
    },
    "UPTD. Rumah Sakit Jiwa Provinsi Bali Cq. Poli Psikiatri Rumah Sakit Jiwa Provinsi Bali": {
      kab: "Bangli",
      status: "Rawat Inap RSJ Bangli",
    },
    "Kepala Badan Narkotika Nasional Provinsi Bali Cq. Kepala Bidang Rehabilitasi": {
      kab: "Denpasar",
      status: "Rawat Jalan BNNP Bali",
    },
    "Balai Besar Rehabilitasi BNN Lido, Bogor": {
      kab: "Bogor",
      status: "Rawat Inap Balai Lido",
    },
    "Balai Rehabilitasi BNN Badoka, Makassar": {
      kab: "Makassar",
      status: "Rawat Inap Balai Badoka",
    },
    "Balai Rehabilitasi BNN Tanah Merah, Samarinda": {
      kab: "Samarinda",
      status: "Rawat Inap Balai Tanah Merah",
    },
    "Loka Rehabilitasi BNN Batam": {
      kab: "Batam",
      status: "Rawat Inap Loka Batam",
    },
  };

  kepadaSelect.addEventListener("change", () => {
    const sel = kepadaSelect.value;
    if (mapping[sel]) {
      kabRujukanInput.value = mapping[sel].kab;
      statusRawatSelect.value = mapping[sel].status;
    }
  });
}

// 6. Deteksi Riwayat Pasien Lama / Relapse
function initRehabHistoryDetector() {
  const nikInput = document.getElementById("nik");
  const namaInput = document.getElementById("nama");
  const banner = document.getElementById("statusRiwayatBanner");
  const badgeDot = document.getElementById("badgeDot");
  const statusText = document.getElementById("statusRiwayatText");
  const rehabKeSelect = document.getElementById("rehabKeSelect");

  if (!nikInput || !namaInput || !banner) return;

  function checkHistory() {
    const rawNik = nikInput.value.trim();
    const rawNama = namaInput.value.trim().toLowerCase();

    let patients = [];
    try {
      patients = JSON.parse(localStorage.getItem("simRehabPatients")) || [];
    } catch (e) {
      patients = [];
    }

    if (!rawNik && !rawNama) {
      resetBanner();
      return;
    }

    const matches = patients.filter((p) => {
      const matchNik = rawNik.length >= 8 && String(p.nik || "").trim() === rawNik;
      const matchNama = rawNama.length >= 3 && (p.nama || "").toLowerCase().trim() === rawNama;
      return matchNik || matchNama;
    });

    if (matches.length > 0) {
      banner.className = "status-riwayat-banner banner-relapse";
      if (badgeDot) badgeDot.className = "badge-dot dot-relapse";
      const totalRehab = matches.length + 1;
      const rehabStr = `Ke-${totalRehab}`;
      if (rehabKeSelect) rehabKeSelect.value = totalRehab >= 4 ? "Ke-4+" : rehabStr;

      if (statusText) {
        statusText.innerHTML = `<strong>⚠️ Terdeteksi Klien Lama / Relapse:</strong> Ditemukan ${matches.length} riwayat rehabilitasi sebelumnya atas nama <strong>"${matches[0].nama}"</strong> (NIK: ${matches[0].nik || "-"}). Diset sebagai <strong>${rehabStr} (Kambuh/Relapse)</strong>.`;
      }
    } else {
      resetBanner();
    }
  }

  function resetBanner() {
    if (banner) banner.className = "status-riwayat-banner";
    if (badgeDot) badgeDot.className = "badge-dot";
    const val = rehabKeSelect ? rehabKeSelect.value : "Ke-1";
    if (statusText) {
      statusText.innerHTML = `Status: <strong>Klien Baru (${val})</strong> — Belum ada riwayat sebelumnya di SIM-REHAB.`;
    }
  }

  nikInput.addEventListener("input", checkHistory);
  namaInput.addEventListener("input", checkHistory);
  if (rehabKeSelect) rehabKeSelect.addEventListener("change", resetBanner);
}

// 7. Generate Medical Record ID
function generateMedicalRecordId() {
  const badge = document.getElementById("recMedisId");
  if (!badge) return;

  let patients = [];
  try {
    patients = JSON.parse(localStorage.getItem("simRehabPatients")) || [];
  } catch (e) {
    patients = [];
  }

  const curYear = document.getElementById("tahunRehab")?.value || new Date().getFullYear();
  const nextNum = String(1 + patients.length).padStart(3, "0");
  badge.textContent = `ID Rekam Medis: [AUTO-${curYear}-${nextNum}]`;
}

// Format Indo Date Helper
function formatTglKedatanganIndo(isoDateStr) {
  if (!isoDateStr) return "Singaraja, -";
  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "Nopember", "Desember",
  ];
  const parts = isoDateStr.split("-");
  if (parts.length === 3) {
    const day = parseInt(parts[2], 10);
    const monthIdx = parseInt(parts[1], 10) - 1;
    const year = parts[0];
    return `Singaraja, ${day < 10 ? "0" + day : day} ${months[monthIdx] || ""} ${year}`;
  }
  return `Singaraja, ${isoDateStr}`;
}

// 8. Form Submission
function initFormSubmit() {
  const form = document.getElementById("pasienForm");
  const toast = document.getElementById("toastMsg");

  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const nik = document.getElementById("nik")?.value.trim() || "";
    const nama = document.getElementById("nama")?.value.trim() || "";
    const tglLahir = document.getElementById("tglLahir")?.value || "";
    const umur = document.getElementById("umur")?.value || "-";
    const gender = document.querySelector('input[name="gender"]:checked')?.value || "laki";
    const telepon = document.getElementById("telepon")?.value.trim() || "";
    const pekerjaan = document.getElementById("pekerjaan")?.value || "Tidak Bekerja";
    const kecSelect = document.getElementById("kecamatan");
    const desaSelect = document.getElementById("desa");
    const kecamatan = kecSelect ? kecSelect.options[kecSelect.selectedIndex].text : "Buleleng";
    const desa = desaSelect ? desaSelect.options[desaSelect.selectedIndex].text : "Singaraja";
    const kabupatenAsal = document.getElementById("kabupatenAsal")?.value.trim() || "Buleleng";
    const alamat = document.getElementById("alamat")?.value.trim() || "-";

    const nomorSurat = document.getElementById("nomorSurat")?.value.trim() || "-";
    const tglKedatanganDate = document.getElementById("tglKedatangan")?.value || "";
    const tahunRehab = document.getElementById("tahunRehab")?.value || "2026";
    const kepada = document.getElementById("kepada")?.value || "Klinik Pratama BNNK Buleleng";
    const kabupatenRujukan = document.getElementById("kabupatenRujukan")?.value.trim() || "Buleleng";
    const statusRawat = document.getElementById("statusRawat")?.value || "Rawat Jalan Klinik Pratama BNNK Buleleng";
    const rehabKe = document.getElementById("rehabKeSelect")?.value || "Ke-1";
    const keterangan = document.getElementById("keterangan")?.value.trim() || "";

    if (!nama) {
      alert("Mohon isi Nama Lengkap Pasien.");
      return;
    }
    if (nik.length !== 16 || isNaN(nik)) {
      alert("Mohon masukkan NIK yang valid (tepat 16 digit angka).");
      return;
    }

    const tglKedatanganFormatted = formatTglKedatanganIndo(tglKedatanganDate);

    let layananTeks = "";
    if (statusRawat.toLowerCase().includes("inap")) {
      const rujukanSingkat = kepada.includes("Lido")
        ? "(Balai Lido)"
        : kepada.includes("RSJ")
        ? "(RSJ Bangli)"
        : `(${kabupatenRujukan})`;
      layananTeks = `Rawat Inap\n${rujukanSingkat}`;
    } else {
      layananTeks = statusRawat.includes("BNNP")
        ? "Rawat Jalan\n(BNNP Bali)"
        : "Rawat Jalan\n(Klinik BNNK)";
    }

    const newPatient = {
      id: `AUTO-${tahunRehab}-${Date.now().toString().slice(-4)}`,
      nomorSurat,
      tglKedatangan: tglKedatanganFormatted,
      tglKedatanganRaw: tglKedatanganDate,
      kepada,
      kabupaten: kabupatenRujukan,
      nama,
      nik,
      umur: umur === "-" ? "25 Tahun" : umur,
      gender,
      jenisKelamin: gender === "perempuan" ? "Perempuan" : "Laki-Laki",
      pekerjaan,
      tglLahir: tglLahir || "1999",
      alamat,
      desa,
      kecamatan,
      kabupatenAsal,
      statusRawat,
      tahunRehab,
      telepon,
      noHp: telepon,
      rehabKe,
      statusProgres: "ON GOING",
      layananTeks,
      tujuanRujukan: kepada,
      keterangan: keterangan || "Klien tercatat dalam registrasi pelayanan rehabilitasi BNNK Buleleng.",
      createdAt: new Date().toISOString(),
    };

    let patients = [];
    try {
      patients = JSON.parse(localStorage.getItem("simRehabPatients")) || [];
    } catch (err) {
      patients = [];
    }

    patients.unshift(newPatient);
    localStorage.setItem("simRehabPatients", JSON.stringify(patients));

    if (toast) {
      toast.innerHTML = `Data Pasien <strong>${nama}</strong> (${rehabKe}) berhasil disimpan ke SIM-REHAB!`;
      toast.classList.add("show");
      setTimeout(() => {
        toast.classList.remove("show");
        window.location.href = "monitoring-pasien.html";
      }, 1200);
    } else {
      window.location.href = "monitoring-pasien.html";
    }
  });
}

// 9. Logout Handler
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
