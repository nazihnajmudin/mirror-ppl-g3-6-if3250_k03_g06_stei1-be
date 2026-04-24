export interface LKPSSheetColumn {
  key: string;
  label: string;
  type: 'number' | 'text' | 'textarea' | 'date' | 'url' | 'boolean' | 'select';
  options?: string[];
  autoCalculated?: boolean;
  notes?: string;
}

export interface LKPSSheetConfig {
  sheetName: string;
  sheetTitle: string;
  criteriaCode: string;
  subCriteriaCode?: string | null;
  headerRows: number;
  rowType: 'free' | 'fixed';
  fixedRows?: string[];
  columns: LKPSSheetColumn[];
  applicableTo: string[];
}

// Kriteria Definitions

export const LKPS_KRITERIA = {
  '1': { name: 'Visi Misi Tujuan Strategi', subKriteria: [] },
  '2': { name: 'Tata Pamong, Tata Kelola, dan Kerjasama', subKriteria: ['2a', '2b'] },
  '3': { name: 'Relevansi Pendidikan dan Penelitian/PkM', subKriteria: ['3a', '3b', '3c'] },
  '4': { name: 'Sumber Daya Manusia', subKriteria: [] },
  '5': { name: 'Sarana dan Prasarana', subKriteria: [] },
  '6': { name: 'Mahasiswa dan Luaran Mahasiswa', subKriteria: [] },
  '7': { name: 'Sistem Penjaminan Mutu', subKriteria: [] },
};

const COLLABORATION_COLUMNS = [
  { key: 'no', label: 'No.', type: 'number' as const },
  { key: 'lembaga_mitra', label: 'Lembaga Mitra', type: 'text' as const },
  { key: 'tingkat_internasional', label: 'Tingkat: Internasional', type: 'boolean' as const },
  { key: 'tingkat_nasional', label: 'Tingkat: Nasional', type: 'boolean' as const },
  { key: 'tingkat_lokal', label: 'Tingkat: Lokal/Wilayah', type: 'boolean' as const },
  { key: 'judul_kerjasama', label: 'Judul Kegiatan Kerjasama', type: 'text' as const },
  { key: 'manfaat', label: 'Manfaat bagi PS', type: 'textarea' as const },
  { key: 'tgl_awal', label: 'Tanggal Awal (HH/BB/TTTT)', type: 'date' as const },
  { key: 'tgl_akhir', label: 'Tanggal Akhir (HH/BB/TTTT)', type: 'date' as const },
  { key: 'durasi', label: 'Durasi (tahun)', type: 'number' as const },
  { key: 'status_kerjasama', label: 'Status Kerjasama', type: 'text' as const },
  { key: 'bukti_kerjasama', label: 'Bukti Kerjasama', type: 'url' as const },
];

export const LKPS_SHEETS: Record<string, LKPSSheetConfig> = {
  PS: {
    sheetName: 'PS',
    sheetTitle: 'Daftar Program Studi di UPPS',
    criteriaCode: '0',
    headerRows: 10,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'jenis_program', label: 'Jenis Program', type: 'text' },
      { key: 'nama_prodi', label: 'Nama Program Studi', type: 'text' },
      { key: 'status_akreditasi', label: 'Status Akreditasi', type: 'select', options: ['Terakreditasi Unggul', 'Terakreditasi A', 'Terakreditasi Baik Sekali', 'Terakreditasi B', 'Terakreditasi Baik', 'Terakreditasi C', 'Terakreditasi Minimum', 'Tidak Terakreditasi'] },
      { key: 'no_sk', label: 'No. SK', type: 'text' },
      { key: 'tgl_kadaluarsa', label: 'Tgl. Kadaluarsa', type: 'date' },
      { key: 'jumlah_mahasiswa', label: 'Jumlah Mahasiswa', type: 'number' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  PSPPI: {
    sheetName: 'PSPPI',
    sheetTitle: 'Disiplin Teknik Keinsinyuran (PSPPI)',
    criteriaCode: '0',
    headerRows: 5,
    rowType: 'fixed',
    fixedRows: ['Kebumian dan Energi', 'Rekayasa Sipil', 'Industri', 'Konservasi', 'Pertanian', 'Kelautan', 'Aeronotika'],
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'disiplin', label: 'Disiplin', type: 'text' },
      { key: 'penyelenggaraan_ya', label: 'Ya', type: 'boolean' },
      { key: 'penyelenggaraan_tidak', label: 'Tidak', type: 'boolean' },
    ],
    applicableTo: ['PSPPI'],
  },

  '1': {
    sheetName: '1',
    sheetTitle: 'Visi Misi Tujuan Strategi',
    criteriaCode: '1',
    headerRows: 4,
    rowType: 'fixed',
    fixedRows: ['Visi PT', 'Misi PT', 'Visi UPPS', 'Misi UPPS', 'Visi Keilmuan PS'],
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'jenis_vmts', label: 'Jenis VMTS', type: 'text' },
      { key: 'pernyataan', label: 'Pernyataan', type: 'textarea' },
      { key: 'no_sk', label: 'No. SK', type: 'text' },
      { key: 'link_dokumen', label: 'Link Dokumen', type: 'url' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '2a1': { sheetName: '2a1', sheetTitle: 'Kerjasama Pendidikan', criteriaCode: '2', subCriteriaCode: '2a', headerRows: 11, rowType: 'free', columns: COLLABORATION_COLUMNS, applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '2a2': { sheetName: '2a2', sheetTitle: 'Kerjasama Penelitian', criteriaCode: '2', subCriteriaCode: '2a', headerRows: 11, rowType: 'free', columns: COLLABORATION_COLUMNS, applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '2a3': { sheetName: '2a3', sheetTitle: 'Kerjasama Pengabdian Masyarakat', criteriaCode: '2', subCriteriaCode: '2a', headerRows: 11, rowType: 'free', columns: COLLABORATION_COLUMNS, applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },

  '2b': {
    sheetName: '2b',
    sheetTitle: 'Penggunaan Dana',
    criteriaCode: '2',
    subCriteriaCode: '2b',
    headerRows: 5,
    rowType: 'fixed',
    fixedRows: ['Biaya Operasional Pendidikan > a. Biaya Dosen', 'b. Tenaga Kependidikan', 'c. Operasional Pembelajaran', 'd. Operasional Tidak Langsung', 'e. Operasional Diluar PT', 'f. Investasi', 'Penelitian', 'PkM', 'Lainnya'],
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'jenis_penggunaan', label: 'Jenis Penggunaan', type: 'text' },
      { key: 'upps_ts_minus2', label: 'UPPS TS-2', type: 'number' },
      { key: 'upps_ts_minus1', label: 'UPPS TS-1', type: 'number' },
      { key: 'upps_ts', label: 'UPPS TS', type: 'number' },
      { key: 'upps_rata', label: 'UPPS Rata-rata', type: 'number', autoCalculated: true },
      { key: 'ps_ts_minus2', label: 'PS TS-2', type: 'number' },
      { key: 'ps_ts_minus1', label: 'PS TS-1', type: 'number' },
      { key: 'ps_ts', label: 'PS TS', type: 'number' },
      { key: 'ps_rata', label: 'PS Rata-rata', type: 'number', autoCalculated: true },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '3a1': {
    sheetName: '3a1',
    sheetTitle: 'Kurikulum dan Rencana Pembelajaran',
    criteriaCode: '3',
    subCriteriaCode: '3a',
    headerRows: 8,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'semester', label: 'Semester', type: 'number' },
      { key: 'kode_mk', label: 'Kode MK', type: 'text' },
      { key: 'nama_mk', label: 'Nama MK', type: 'text' },
      { key: 'mk_kompetensi', label: 'Kompetensi', type: 'text' },
      { key: 'sks_kuliah', label: 'SKS Kuliah', type: 'number' },
      { key: 'sks_seminar', label: 'SKS Seminar', type: 'number' },
      { key: 'sks_praktikum', label: 'SKS Praktikum', type: 'number' },
      { key: 'dok_rps', label: 'RPS', type: 'url' },
      { key: 'unit_penyelenggara', label: 'Unit', type: 'select', options: ['Universitas', 'Fakultas', 'Prodi'] },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '3a2': {
    sheetName: '3a2',
    sheetTitle: 'Mata Kuliah Pembelajaran (PSPPI)',
    criteriaCode: '3',
    subCriteriaCode: '3a',
    headerRows: 8,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'mata_kuliah', label: 'Mata Kuliah', type: 'text' },
      { key: 'bobot_sks', label: 'Bobot SKS', type: 'number' },
      { key: 'konversi_teori', label: 'Jam Teori', type: 'number' },
      { key: 'konversi_praktik', label: 'Jam Praktik', type: 'number' },
      { key: 'kelengkapan_rps', label: 'RPS', type: 'select', options: ['Ada', 'Tidak Ada'] },
    ],
    applicableTo: ['PSPPI'],
  },

  '3a3': {
    sheetName: '3a3',
    sheetTitle: 'Integrasi Penelitian/PkM dalam Pembelajaran',
    criteriaCode: '3',
    subCriteriaCode: '3a',
    headerRows: 11,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama_dosen', label: 'Nama Dosen', type: 'text' },
      { key: 'judul_penelitian_pkm', label: 'Judul', type: 'text' },
      { key: 'mata_kuliah', label: 'MK', type: 'text' },
      { key: 'bentuk_integrasi', label: 'Bentuk', type: 'select', options: ['Materi', 'Studi Kasus', 'Bab', 'Ajar', 'Lain'] },
      { key: 'tahun_ts_minus2', label: 'TS-2', type: 'number' },
      { key: 'tahun_ts_minus1', label: 'TS-1', type: 'number' },
      { key: 'tahun_ts', label: 'TS', type: 'number' },
      { key: 'kesesuaian_roadmap', label: 'Sesuai Roadmap', type: 'select', options: ['Sesuai', 'Tidak'] },
      { key: 'bukti_sahih', label: 'Bukti', type: 'select', options: ['Hibah', 'Laporan', 'Publikasi', 'Lain'] },
      { key: 'kesesuaian_rps', label: 'Kesesuaian RPS', type: 'text' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '3a4': {
    sheetName: '3a4',
    sheetTitle: 'Basic Science dan Matematika',
    criteriaCode: '3',
    subCriteriaCode: '3a',
    headerRows: 6,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'nama_mk', label: 'Nama MK', type: 'text' },
      { key: 'semester', label: 'Semester', type: 'number' },
      { key: 'jumlah_sks', label: 'SKS', type: 'number' },
    ],
    applicableTo: ['S', 'STr'],
  },

  '3a5': {
    sheetName: '3a5',
    sheetTitle: 'Capstone Design',
    criteriaCode: '3',
    subCriteriaCode: '3a',
    headerRows: 6,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'mk_pendukung', label: 'MK Pendukung', type: 'text' },
      { key: 'sks_pendukung', label: 'SKS Pendukung', type: 'number' },
      { key: 'mk_capstone', label: 'MK Capstone', type: 'text' },
      { key: 'sks_capstone', label: 'SKS Capstone', type: 'number' },
      { key: 'semester', label: 'Semester', type: 'number' },
      { key: 'cakupan_bahasan', label: 'Cakupan', type: 'textarea' },
    ],
    applicableTo: ['S', 'STr'],
  },

  '3b': {
    sheetName: '3b',
    sheetTitle: 'Penelitian DTPS',
    criteriaCode: '3',
    subCriteriaCode: '3b',
    headerRows: 6,
    rowType: 'fixed',
    fixedRows: ['PT/Mandiri', 'Dalam Negeri', 'Luar Negeri'],
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'sumber_pembiayaan', label: 'Sumber', type: 'text' },
      { key: 'jumlah_ts_minus2', label: 'TS-2', type: 'number' },
      { key: 'jumlah_ts_minus1', label: 'TS-1', type: 'number' },
      { key: 'jumlah_ts', label: 'TS', type: 'number' },
      { key: 'jumlah_total', label: 'Total', type: 'number', autoCalculated: true },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '3c': {
    sheetName: '3c',
    sheetTitle: 'PkM DTPS',
    criteriaCode: '3',
    subCriteriaCode: '3c',
    headerRows: 6,
    rowType: 'fixed',
    fixedRows: ['PT/Mandiri', 'Dalam Negeri', 'Luar Negeri'],
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'sumber_pembiayaan', label: 'Sumber', type: 'text' },
      { key: 'jumlah_ts_minus2', label: 'TS-2', type: 'number' },
      { key: 'jumlah_ts_minus1', label: 'TS-1', type: 'number' },
      { key: 'jumlah_ts', label: 'TS', type: 'number' },
      { key: 'jumlah_total', label: 'Total', type: 'number', autoCalculated: true },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '4a': {
    sheetName: '4a',
    sheetTitle: 'Profil Dosen',
    criteriaCode: '4',
    headerRows: 10,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama_dosen', label: 'Nama Dosen', type: 'text' },
      { key: 'nidn', label: 'NIDN', type: 'text' },
      { key: 'kategori_dosen', label: 'Kategori', type: 'select', options: ['Tetap', 'Tidak Tetap', 'Industri'] },
      { key: 'prodi_s1', label: 'S1', type: 'text' },
      { key: 'prodi_s2', label: 'S2', type: 'text' },
      { key: 'prodi_s3', label: 'S3', type: 'text' },
      { key: 'bidang_keahlian', label: 'Keahlian', type: 'text' },
      { key: 'jabatan_akademik', label: 'Jabatan', type: 'select', options: ['Pengajar', 'Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar'] },
      { key: 'mk_diampu_ps', label: 'MK Diampu', type: 'text' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '4b': {
    sheetName: '4b',
    sheetTitle: 'Tenaga Kependidikan',
    criteriaCode: '4',
    headerRows: 8,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'nama', label: 'Nama', type: 'text' },
      { key: 'pendidikan_s3', label: 'S3', type: 'boolean' },
      { key: 'pendidikan_s2', label: 'S2', type: 'boolean' },
      { key: 'pendidikan_s1', label: 'S1', type: 'boolean' },
      { key: 'pendidikan_d4', label: 'D4', type: 'boolean' },
      { key: 'pendidikan_d3', label: 'D3', type: 'boolean' },
      { key: 'sertifikat_kompetensi', label: 'Sertifikat', type: 'text' },
      { key: 'unit_kerja', label: 'Unit', type: 'select', options: ['UPPS', 'PS', 'Institusi'] },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '4c': {
    sheetName: '4c',
    sheetTitle: 'Beban Kerja Dosen Tetap',
    criteriaCode: '4',
    headerRows: 8,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama_dosen', label: 'Nama', type: 'text' },
      { key: 'bk_ps_diakreditasi', label: 'BK PS (sks)', type: 'number' },
      { key: 'bk_penelitian', label: 'BK Penelitian (sks)', type: 'number' },
      { key: 'bk_pkm', label: 'BK PkM (sks)', type: 'number' },
      { key: 'bk_tugas_tambahan', label: 'BK Lain (sks)', type: 'number' },
      { key: 'jumlah_per_tahun', label: 'Total/Tahun', type: 'number', autoCalculated: true },
      { key: 'jumlah_per_semester', label: 'Total/Semester', type: 'number', autoCalculated: true },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '4d': {
    sheetName: '4d',
    sheetTitle: 'Publikasi Ilmiah DTPS',
    criteriaCode: '4',
    headerRows: 5,
    rowType: 'fixed',
    fixedRows: ['Jurnal Nasional', 'Jurnal Terakreditasi', 'Jurnal Internasional', 'Internasional Bereputasi', 'Prosiding Nasional', 'Prosiding Intl', 'Prosiding Terindeks', 'Pagelaran Lokal', 'Pagelaran Nasional', 'Pagelaran Intl'],
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'jenis_publikasi', label: 'Jenis', type: 'text' },
      { key: 'jumlah_ts_minus2', label: 'TS-2', type: 'number' },
      { key: 'jumlah_ts_minus1', label: 'TS-1', type: 'number' },
      { key: 'jumlah_ts', label: 'TS', type: 'number' },
      { key: 'jumlah_total', label: 'Total', type: 'number', autoCalculated: true },
    ],
    applicableTo: ['S', 'M', 'D', 'PSPPI'],
  },

  '4e': {
    sheetName: '4e',
    sheetTitle: 'Publikasi DTPS (Vokasi)',
    criteriaCode: '4',
    headerRows: 5,
    rowType: 'fixed',
    fixedRows: ['Jurnal Nasional', 'Jurnal Terakreditasi', 'Jurnal Internasional', 'Internasional Bereputasi', 'Prosiding Nasional', 'Prosiding Intl', 'Prosiding Terindeks', 'Pagelaran Lokal', 'Pagelaran Nasional', 'Pagelaran Intl'],
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'jenis_publikasi', label: 'Jenis', type: 'text' },
      { key: 'jumlah_ts_minus2', label: 'TS-2', type: 'number' },
      { key: 'jumlah_ts_minus1', label: 'TS-1', type: 'number' },
      { key: 'jumlah_ts', label: 'TS', type: 'number' },
      { key: 'jumlah_total', label: 'Total', type: 'number', autoCalculated: true },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'STr', 'MTr', 'DTr'],
  },

  '4f-1': { sheetName: '4f-1', sheetTitle: 'HKI Paten', criteriaCode: '4', headerRows: 5, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'nomor_paten', label: 'Nomor', type: 'text' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '4f-2': { sheetName: '4f-2', sheetTitle: 'HKI Hak Cipta', criteriaCode: '4', headerRows: 5, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'keterangan', label: 'Keterangan', type: 'text' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '4f-3': { sheetName: '4f-3', sheetTitle: 'TTG', criteriaCode: '4', headerRows: 13, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'tkt', label: 'TKT', type: 'select', options: ['TKT 1', 'TKT 2', 'TKT 3', 'TKT 4', 'TKT 5', 'TKT 6', 'TKT 7', 'TKT 8', 'TKT 9'] }, { key: 'keterangan', label: 'Ket', type: 'text' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '4f-4': { sheetName: '4f-4', sheetTitle: 'Buku ISBN', criteriaCode: '4', headerRows: 5, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'nomor_isbn', label: 'ISBN', type: 'text' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },

  '4g': {
    sheetName: '4g',
    sheetTitle: 'Produk/Jasa DTPS',
    criteriaCode: '4',
    headerRows: 4,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama_dtps', label: 'Nama DTPS', type: 'text' },
      { key: 'nama_produk_jasa', label: 'Produk/Jasa', type: 'text' },
      { key: 'deskripsi', label: 'Deskripsi', type: 'textarea' },
      { key: 'bukti', label: 'Bukti', type: 'url' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'STr', 'MTr', 'DTr'],
  },

  '4h': {
    sheetName: '4h',
    sheetTitle: 'Kinerja DTPS',
    criteriaCode: '4',
    headerRows: 12,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama_dtps', label: 'Nama DTPS', type: 'text' },
      { key: 'bentuk_kegiatan', label: 'Kegiatan', type: 'select', options: ['Pertukaran', 'Magang', 'Penelitian', 'KKN', 'Proyek', 'Asistensi', 'Kemanusiaan', 'Wirausaha'] },
      { key: 'nama_mitra', label: 'Mitra', type: 'text' },
      { key: 'judul_kegiatan', label: 'Judul', type: 'text' },
      { key: 'tahun', label: 'Tahun', type: 'number' },
      { key: 'bukti', label: 'Bukti', type: 'url' },
    ],
    applicableTo: ['S', 'STr', 'M', 'MTr', 'D', 'DTr'],
  },

  '4i': {
    sheetName: '4i',
    sheetTitle: 'Karya Ilmiah Disitasi',
    criteriaCode: '4',
    headerRows: 4,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama_dtps', label: 'Nama DTPS', type: 'text' },
      { key: 'judul_artikel', label: 'Judul', type: 'textarea' },
      { key: 'jumlah_sitasi', label: 'Sitasi', type: 'number' },
    ],
    applicableTo: ['S', 'STr', 'M', 'MTr', 'D', 'DTr'],
  },

  '4j': {
    sheetName: '4j',
    sheetTitle: 'Pengakuan DTPS',
    criteriaCode: '4',
    headerRows: 10,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'nama_dtps', label: 'Nama DTPS', type: 'text' },
      { key: 'bidang_keahlian', label: 'Bidang', type: 'text' },
      { key: 'rekognisi', label: 'Rekognisi', type: 'select', options: ['Visiting Lecturer', 'Keynote', 'Editor', 'Narasumber', 'Penghargaan'] },
      { key: 'bukti_pendukung', label: 'Bukti', type: 'url' },
      { key: 'tingkat_wilayah', label: 'Wilayah', type: 'boolean' },
      { key: 'tingkat_nasional', label: 'Nasional', type: 'boolean' },
      { key: 'tingkat_internasional', label: 'Intl', type: 'boolean' },
      { key: 'tahun', label: 'Tahun', type: 'number' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '4k': {
    sheetName: '4k',
    sheetTitle: 'Pembimbing Lapangan (PSPPI)',
    criteriaCode: '4',
    headerRows: 5,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'nama', label: 'Nama', type: 'text' },
      { key: 'industri', label: 'Industri', type: 'text' },
      { key: 'bidang_keinsinyuran', label: 'Bidang', type: 'text' },
      { key: 'pengalaman_kerja', label: 'Pengalaman (tahun)', type: 'number' },
      { key: 'pendidikan', label: 'Pendidikan', type: 'text' },
      { key: 'nomor_sip', label: 'Nomor SIP', type: 'text' },
      { key: 'tgl_berakhir_sip', label: 'Tgl Berakhir', type: 'date' },
      { key: 'jumlah_bimbingan', label: 'Jumlah Bimbingan', type: 'number' },
    ],
    applicableTo: ['PSPPI'],
  },

  '5a': {
    sheetName: '5a',
    sheetTitle: 'Prasarana dan Peralatan',
    criteriaCode: '5',
    headerRows: 8,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'nama_prasarana', label: 'Prasarana', type: 'text' },
      { key: 'jumlah_prasarana', label: 'Jumlah', type: 'number' },
      { key: 'nama_sarana', label: 'Sarana/Alat', type: 'text' },
      { key: 'jumlah_alat_standar', label: 'Standar', type: 'number' },
      { key: 'jumlah_alat_dimiliki', label: 'Dimiliki', type: 'number' },
      { key: 'kepemilikan_sendiri', label: 'Sendiri', type: 'boolean' },
      { key: 'kondisi_terawat', label: 'Terawat', type: 'boolean' },
      { key: 'waktu_penggunaan', label: 'Waktu Pakai (jam/minggu)', type: 'number' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '5b': { sheetName: '5b', sheetTitle: 'Dokumen K3L', criteriaCode: '5', headerRows: 3, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_dokumen', label: 'Dokumen', type: 'text' }, { key: 'ada', label: 'Ada', type: 'boolean' }, { key: 'link_dokumen', label: 'Link', type: 'url' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '5c': { sheetName: '5c', sheetTitle: 'Fasilitas K3L', criteriaCode: '5', headerRows: 3, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_fasilitas', label: 'Fasilitas', type: 'text' }, { key: 'jumlah', label: 'Jumlah', type: 'number' }, { key: 'kondisi_baik', label: 'Baik', type: 'boolean' }, { key: 'keterangan', label: 'Ket', type: 'text' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },

  '6a': {
    sheetName: '6a',
    sheetTitle: 'Jumlah Mahasiswa',
    criteriaCode: '6',
    headerRows: 5,
    rowType: 'free',
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'program_studi', label: 'Program Studi', type: 'text' },
      { key: 'aktif_ts_minus2', label: 'Aktif TS-2', type: 'number' },
      { key: 'aktif_ts_minus1', label: 'Aktif TS-1', type: 'number' },
      { key: 'aktif_ts', label: 'Aktif TS', type: 'number' },
      { key: 'asing_ft_ts_minus2', label: 'Asing FT TS-2', type: 'number' },
      { key: 'asing_ft_ts_minus1', label: 'Asing FT TS-1', type: 'number' },
      { key: 'asing_ft_ts', label: 'Asing FT TS', type: 'number' },
      { key: 'asing_pt_ts_minus2', label: 'Asing PT TS-2', type: 'number' },
      { key: 'asing_pt_ts_minus1', label: 'Asing PT TS-1', type: 'number' },
      { key: 'asing_pt_ts', label: 'Asing PT TS', type: 'number' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '6b': {
    sheetName: '6b',
    sheetTitle: 'IPK Lulusan',
    criteriaCode: '6',
    headerRows: 5,
    rowType: 'fixed',
    fixedRows: ['TS-2', 'TS-1', 'TS'],
    columns: [
      { key: 'no', label: 'No.', type: 'number' },
      { key: 'tahun_lulus', label: 'Tahun', type: 'text' },
      { key: 'jumlah_lulusan', label: 'Jumlah', type: 'number' },
      { key: 'ipk_min', label: 'IPK Min', type: 'number' },
      { key: 'ipk_rata', label: 'IPK Rata-rata', type: 'number' },
      { key: 'ipk_maks', label: 'IPK Maks', type: 'number' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '6c1': { sheetName: '6c1', sheetTitle: 'Prestasi Akademik', criteriaCode: '6', headerRows: 7, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_kegiatan', label: 'Kegiatan', type: 'text' }, { key: 'waktu_perolehan', label: 'Tanggal', type: 'date' }, { key: 'tingkat_lokal', label: 'Lokal', type: 'boolean' }, { key: 'tingkat_nasional', label: 'Nasional', type: 'boolean' }, { key: 'tingkat_internasional', label: 'Intl', type: 'boolean' }, { key: 'prestasi', label: 'Prestasi', type: 'text' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr'] },
  '6c2': { sheetName: '6c2', sheetTitle: 'Prestasi Non-akademik', criteriaCode: '6', headerRows: 7, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_kegiatan', label: 'Kegiatan', type: 'text' }, { key: 'waktu_perolehan', label: 'Tanggal', type: 'date' }, { key: 'tingkat_lokal', label: 'Lokal', type: 'boolean' }, { key: 'tingkat_nasional', label: 'Nasional', type: 'boolean' }, { key: 'tingkat_internasional', label: 'Intl', type: 'boolean' }, { key: 'prestasi', label: 'Prestasi', type: 'text' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr'] },

  '6d': {
    sheetName: '6d',
    sheetTitle: 'Masa Studi Lulusan',
    criteriaCode: '6',
    headerRows: 3,
    rowType: 'free',
    columns: [
      { key: 'tahun_masuk', label: 'Tahun Masuk', type: 'text' },
      { key: 'jumlah_masuk', label: 'Masuk', type: 'number' },
      { key: 'lulus_normal', label: 'Lulus Normal', type: 'number' },
      { key: 'lulus_lebih', label: 'Lulus Lebih', type: 'number' },
      { key: 'lulus_kurang', label: 'Lulus Kurang', type: 'number' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'],
  },

  '6e1': { sheetName: '6e1', sheetTitle: 'Publikasi Mahasiswa', criteriaCode: '6', headerRows: 5, rowType: 'fixed', fixedRows: ['Jurnal Nasional', 'Jurnal Terakreditasi', 'Jurnal Intl', 'Intl Bereputasi', 'Prosiding Nasional', 'Prosiding Intl', 'Prosiding Terindeks', 'Pagelaran Lokal', 'Pagelaran Nasional', 'Pagelaran Intl'], columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'jenis_publikasi', label: 'Jenis', type: 'text' }, { key: 'jumlah_ts_minus2', label: 'TS-2', type: 'number' }, { key: 'jumlah_ts_minus1', label: 'TS-1', type: 'number' }, { key: 'jumlah_ts', label: 'TS', type: 'number' }, { key: 'jumlah_total', label: 'Total', type: 'number', autoCalculated: true }], applicableTo: ['S', 'M', 'D'] },
  '6e2': { sheetName: '6e2', sheetTitle: 'Publikasi Mahasiswa (Vokasi)', criteriaCode: '6', headerRows: 5, rowType: 'fixed', fixedRows: ['Jurnal Nasional', 'Jurnal Terakreditasi', 'Jurnal Intl', 'Intl Bereputasi', 'Prosiding Nasional', 'Prosiding Intl', 'Prosiding Terindeks', 'Pagelaran Lokal', 'Pagelaran Nasional', 'Pagelaran Intl'], columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'jenis_publikasi', label: 'Jenis', type: 'text' }, { key: 'jumlah_ts_minus2', label: 'TS-2', type: 'number' }, { key: 'jumlah_ts_minus1', label: 'TS-1', type: 'number' }, { key: 'jumlah_ts', label: 'TS', type: 'number' }, { key: 'jumlah_total', label: 'Total', type: 'number', autoCalculated: true }], applicableTo: ['STr', 'MTr', 'DTr'] },

  '6e3-1': { sheetName: '6e3-1', sheetTitle: 'HKI Mahasiswa Paten', criteriaCode: '6', headerRows: 5, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'status', label: 'Status', type: 'select', options: ['Registered', 'Granted', 'Komersial'] }, { key: 'nomor_registrasi', label: 'Nomor', type: 'text' }], applicableTo: ['S', 'STr', 'M', 'MTr', 'D', 'DTr'] },
  '6e3-2': { sheetName: '6e3-2', sheetTitle: 'HKI Mahasiswa Hak Cipta', criteriaCode: '6', headerRows: 5, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'nomor_hki', label: 'Nomor HKI', type: 'text' }], applicableTo: ['S', 'STr', 'M', 'MTr', 'D', 'DTr'] },
  '6e3-3': { sheetName: '6e3-3', sheetTitle: 'TTG Mahasiswa', criteriaCode: '6', headerRows: 5, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'tkt', label: 'TKT', type: 'select', options: ['TKT 1', 'TKT 2', 'TKT 3', 'TKT 4', 'TKT 5', 'TKT 6', 'TKT 7', 'TKT 8', 'TKT 9'] }, { key: 'keterangan', label: 'Ket', type: 'text' }], applicableTo: ['S', 'STr', 'M', 'MTr', 'D', 'DTr'] },
  '6e3-4': { sheetName: '6e3-4', sheetTitle: 'Buku ISBN Mahasiswa', criteriaCode: '6', headerRows: 5, rowType: 'free', columns: [{ key: 'no', label: 'No', type: 'number' }, { key: 'judul_luaran', label: 'Judul', type: 'text' }, { key: 'tanggal', label: 'Tanggal', type: 'date' }, { key: 'nomor_isbn', label: 'ISBN', type: 'text' }], applicableTo: ['S', 'STr', 'M', 'MTr', 'D', 'DTr'] },

  '6e4': { sheetName: '6e4', sheetTitle: 'Produk/Jasa Mahasiswa', criteriaCode: '6', headerRows: 4, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_mahasiswa', label: 'Mahasiswa', type: 'text' }, { key: 'nama_produk_jasa', label: 'Produk/Jasa', type: 'text' }, { key: 'deskripsi', label: 'Deskripsi', type: 'textarea' }, { key: 'bukti', label: 'Bukti', type: 'url' }], applicableTo: ['D1', 'D2', 'D3', 'STr', 'MTr', 'DTr'] },

  '6f1': { sheetName: '6f1', sheetTitle: 'Waktu Tunggu Lulusan', criteriaCode: '6', headerRows: 5, rowType: 'fixed', fixedRows: ['TS-2', 'TS-1'], columns: [{ key: 'tahun_lulus', label: 'Tahun', type: 'text' }, { key: 'jumlah_lulusan', label: 'Jumlah Lulus', type: 'number' }, { key: 'jumlah_terlacak', label: 'Terlacak', type: 'number' }, { key: 'dipesan_sebelum_lulus', label: 'Dipesan', type: 'number' }, { key: 'wt_kurang3', label: 'WT < 3 bln', type: 'number' }, { key: 'wt_3_6', label: 'WT 3-6 bln', type: 'number' }, { key: 'wt_lebih6', label: 'WT > 6 bln', type: 'number' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'PSPPI'] },
  '6f2': { sheetName: '6f2', sheetTitle: 'Kesesuaian Bidang Kerja', criteriaCode: '6', headerRows: 5, rowType: 'fixed', fixedRows: ['TS-2', 'TS-1'], columns: [{ key: 'tahun_lulus', label: 'Tahun', type: 'text' }, { key: 'jumlah_lulusan', label: 'Jumlah', type: 'number' }, { key: 'jumlah_terlacak', label: 'Terlacak', type: 'number' }, { key: 'kesesuaian_rendah', label: 'Rendah', type: 'number' }, { key: 'kesesuaian_sedang', label: 'Sedang', type: 'number' }, { key: 'kesesuaian_tinggi', label: 'Tinggi', type: 'number' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'PSPPI'] },
  '6g1': { sheetName: '6g1', sheetTitle: 'Tempat Kerja Lulusan', criteriaCode: '6', headerRows: 5, rowType: 'fixed', fixedRows: ['TS-2', 'TS-1'], columns: [{ key: 'tahun_lulus', label: 'Tahun', type: 'text' }, { key: 'jumlah_lulusan', label: 'Jumlah', type: 'number' }, { key: 'pengguna_memberi_tanggapan', label: 'Pengguna Respons', type: 'number' }, { key: 'jumlah_terlacak', label: 'Terlacak', type: 'number' }, { key: 'tempat_lokal', label: 'Lokal', type: 'number' }, { key: 'tempat_nasional', label: 'Nasional', type: 'number' }, { key: 'tempat_multinasional', label: 'Multinasional', type: 'number' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'PSPPI'] },

  '6g2': {
    sheetName: '6g2',
    sheetTitle: 'Kepuasan Pengguna',
    criteriaCode: '6',
    headerRows: 5,
    rowType: 'fixed',
    fixedRows: ['Etika', 'Keahlian', 'Bahasa Asing', 'TI', 'Komunikasi', 'Kerjasama Tim', 'Pengembangan Diri'],
    columns: [
      { key: 'no', label: 'No', type: 'number' },
      { key: 'jenis_kemampuan', label: 'Kemampuan', type: 'text' },
      { key: 'sangat_baik', label: 'Sangat Baik %', type: 'number' },
      { key: 'baik', label: 'Baik %', type: 'number' },
      { key: 'cukup', label: 'Cukup %', type: 'number' },
      { key: 'kurang', label: 'Kurang %', type: 'number' },
      { key: 'rencana_tindak_lanjut', label: 'Rencana Tindak Lanjut', type: 'textarea' },
    ],
    applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'PSPPI'],
  },

  '6h1': { sheetName: '6h1', sheetTitle: 'Penelitian DTPS + Mahasiswa', criteriaCode: '6', headerRows: 8, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_dosen', label: 'Dosen', type: 'text' }, { key: 'tema_penelitian', label: 'Tema', type: 'text' }, { key: 'nama_mahasiswa', label: 'Mahasiswa', type: 'text' }, { key: 'judul_kegiatan', label: 'Judul', type: 'text' }, { key: 'tahun', label: 'Tahun', type: 'number' }], applicableTo: ['S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '6h2': { sheetName: '6h2', sheetTitle: 'Penelitian Rujukan Tesis', criteriaCode: '6', headerRows: 4, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_dosen', label: 'Dosen', type: 'text' }, { key: 'tema_penelitian', label: 'Tema', type: 'text' }, { key: 'nama_mahasiswa', label: 'Mahasiswa', type: 'text' }, { key: 'judul_tesis_disertasi', label: 'Tesis/Disertasi', type: 'text' }, { key: 'tahun', label: 'Tahun', type: 'number' }], applicableTo: ['M', 'MTr', 'D', 'DTr'] },
  '6i': { sheetName: '6i', sheetTitle: 'PkM DTPS + Mahasiswa', criteriaCode: '6', headerRows: 4, rowType: 'free', columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'nama_dosen', label: 'Dosen', type: 'text' }, { key: 'tema_pkm', label: 'Tema', type: 'text' }, { key: 'nama_mahasiswa', label: 'Mahasiswa', type: 'text' }, { key: 'judul_pkm', label: 'Judul', type: 'text' }, { key: 'tahun', label: 'Tahun', type: 'number' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },

  '7a': { sheetName: '7a', sheetTitle: 'Dokumen SPMI', criteriaCode: '7', headerRows: 3, rowType: 'fixed', fixedRows: ['Kebijakan SPMI', 'Pedoman PPEPP', 'Standar Mutu', 'Tata Cara Dokumentasi'], columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'jenis_dokumen', label: 'Dokumen', type: 'text' }, { key: 'no_dokumen', label: 'No Dokumen', type: 'text' }, { key: 'tanggal_dokumen', label: 'Tanggal', type: 'date' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
  '7b': { sheetName: '7b', sheetTitle: 'Pelaksanaan SPMI', criteriaCode: '7', headerRows: 3, rowType: 'fixed', fixedRows: ['Penetapan', 'Pelaksanaan', 'Evaluasi', 'Pengendalian', 'Peningkatan'], columns: [{ key: 'no', label: 'No.', type: 'number' }, { key: 'dokumen', label: 'Dokumen', type: 'text' }, { key: 'link_dokumen', label: 'Link', type: 'url' }, { key: 'link_hasil_audit', label: 'Audit', type: 'url' }, { key: 'link_rtm', label: 'RTM', type: 'url' }, { key: 'link_peningkatan', label: 'Peningkatan', type: 'url' }], applicableTo: ['D1', 'D2', 'D3', 'S', 'STr', 'M', 'MTr', 'D', 'DTr', 'PSPPI'] },
};

/**
 * Get sheet config by name
 */
export function getSheetConfig(sheetName: string): LKPSSheetConfig | undefined {
  return LKPS_SHEETS[sheetName];
}

/**
 * Get all sheets for a kriteria
 */
export function getSheetsByKriteria(criteriaCode: string): LKPSSheetConfig[] {
  return Object.values(LKPS_SHEETS).filter(
    (sheet) => sheet.criteriaCode === criteriaCode
  );
}

/**
 * Get all sheets applicable to a program
 */
export function getSheetsByProgram(program: string): LKPSSheetConfig[] {
  return Object.values(LKPS_SHEETS).filter(
    (sheet) => sheet.applicableTo.includes(program)
  );
}

/**
 * Get all sheet names
 */
export function getAllSheetNames(): string[] {
  return Object.keys(LKPS_SHEETS);
}

/**
 * Count total sheets
 */
export function countSheets(): number {
  return Object.keys(LKPS_SHEETS).length;
}
