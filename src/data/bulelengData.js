/**
 * ==============================================================================
 * File: src/data/bulelengData.js
 * Fungsi: Master Data Wilayah Administratif Kabupaten Buleleng, Bali
 * ==============================================================================
 * 
 * DESKRIPSI & STRUKTUR DATA:
 * File ini menyimpan data master resmi kewilayahan di Kabupaten Buleleng yang terdiri dari:
 * 1. 9 Kecamatan (Buleleng, Sukasada, Seririt, Gerokgak, Banjar, Sawan, Kubutambahan, Busungbiu, Tejakula).
 * 2. Seluruh Desa / Kelurahan yang ada di masing-masing kecamatan.
 * 
 * KEGUNAAN DALAM APLIKASI:
 * - Mengisi pilihan dropdown secara dinamis (*dependent dropdown*) pada Formulir Input Pasien Baru:
 *   Ketika petugas memilih salah satu Kecamatan, daftar Desa/Kelurahan otomatis menyesuaikan.
 * - Digunakan pada grafik batang (*bar chart*) sebaran klien per kecamatan di Dashboard.
 * - Digunakan sebagai filter wilayah pada Halaman Monitoring dan Ekspor Laporan.
 */

// Mapping Daftar Desa/Kelurahan untuk masing-masing Kecamatan di Kabupaten Buleleng
export const desaBuleleng = {
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

// Daftar 9 Kecamatan di Kabupaten Buleleng beserta label tampilannya
export const kecamatanList = [
  { value: "buleleng", label: "Buleleng" },
  { value: "sukasada", label: "Sukasada" },
  { value: "seririt", label: "Seririt" },
  { value: "gerokgak", label: "Gerokgak" },
  { value: "banjar", label: "Banjar" },
  { value: "sawan", label: "Sawan" },
  { value: "kubutambahan", label: "Kubutambahan" },
  { value: "busungbiu", label: "Busungbiu" },
  { value: "tejakula", label: "Tejakula" },
];
