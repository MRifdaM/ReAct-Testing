/**
 * @file cypress/e2e/laporan/buat_laporan.cy.js
 * @description Rangkaian tes E2E untuk fitur Laporan Kerusakan.
 * Menguji alur pembuatan laporan (via modal), validasi form,
 * dan verifikasi data di tabel.
 */
describe('Fitur Laporan Kerusakan', () => {

  // --- Konstanta Login & Setup ---
  const USERNAME_MAHASISWA = 'mahasiswa';
  const PASSWORD_MAHASISWA = 'mahasiswa';
  const LAPORAN_URL = '/laporan';

  // --- Konstanta Halaman Laporan ---
  const BTN_TEXT_BUAT_LAPORAN = 'Buat Laporan';
  const SELECTOR_LAPORAN_TABLE = '#laporan-table';

  // --- Konstanta Modal Buat Laporan ---
  const SELECTOR_MODAL = '#myModal';
  const SELECTOR_MODAL_CONTENT = '#myModal .modal-content';
  const SELECTOR_MODAL_TITLE = '#myModal .modal-title';
  const MODAL_TITLE_TEXT = 'Tambah Laporan Kerusakan';
  const SELECTOR_MODAL_SUBMIT_BTN = '#form-create-laporan button[type="submit"]';
  const BTN_TEXT_SIMPAN_LAPORAN = 'Simpan Laporan';

  // --- Konstanta Form ---
  const SELECTOR_LANTAI = 'select#lantai_id';
  const SELECTOR_RUANG = 'select#ruang_id';
  const SELECTOR_SARANA = 'select#sarana_id';
  const SELECTOR_JUDUL = 'input[name="laporan_judul"]';
  const SELECTOR_KERUSAKAN = 'select[name="tingkat_kerusakan"]';
  const SELECTOR_URGENSI = 'select[name="tingkat_urgensi"]';
  const SELECTOR_DAMPAK = 'select[name="dampak_kerusakan"]';

  // --- Konstanta Verifikasi & Pesan ---
  const SELECTOR_SWAL_POPUP = '.swal2-popup';
  const SELECTOR_SWAL_TITLE = '.swal2-title';
  const SWAL_TITLE_TEXT_BERHASIL = 'Berhasil';
  const VALIDATION_MSG_INPUT = 'Please fill out this field';
  const VALIDATION_MSG_SELECT = 'Please select an item in the list.';

  /**
   * Berjalan sebelum setiap tes ('it').
   * Memastikan tes dimulai dari kondisi bersih, terautentikasi (sebagai mahasiswa),
   * dan sudah berada di halaman daftar laporan (/laporan).
   */
  beforeEach(() => {
    // 1. Reset database
    cy.task('resetDatabase');

    // 2. Login
    cy.loginUI(USERNAME_MAHASISWA, PASSWORD_MAHASISWA);

    // 3. Kunjungi halaman yang akan dites
    cy.visit(LAPORAN_URL);
    cy.url().should('include', LAPORAN_URL);
  });

  /**
   * Tes skenario "Happy Path": Pengguna berhasil membuat laporan kerusakan baru
   * dengan mengisi semua data yang valid.
   */
  it('TC-REP-001 - Harus berhasil membuat laporan kerusakan baru dengan data valid', () => {
    const judulLaporan = 'Cypress Test - Proyektor RT01 Mati Total';

    // Buka modal
    cy.contains('button', BTN_TEXT_BUAT_LAPORAN).click();
    cy.get(SELECTOR_MODAL_CONTENT).should('be.visible');
    cy.get(SELECTOR_MODAL_TITLE).should('contain', MODAL_TITLE_TEXT);

    // Isi form (termasuk menunggu AJAX untuk Ruang & Sarana)
    cy.get(SELECTOR_LANTAI).select('5'); // ID 5 = Lantai 5
    cy.get(SELECTOR_RUANG).should('not.be.disabled').select('2'); // ID 2 = Ruang RT01
    cy.get(SELECTOR_SARANA).should('not.be.disabled').select('61'); // ID 61 = Proyektor
    cy.get(SELECTOR_JUDUL).type(judulLaporan);
    cy.get(SELECTOR_KERUSAKAN).select('tinggi');
    cy.get(SELECTOR_URGENSI).select('tinggi');
    cy.get(SELECTOR_DAMPAK).select('besar');

    // Submit formulir
    cy.get(SELECTOR_MODAL_SUBMIT_BTN).contains(BTN_TEXT_SIMPAN_LAPORAN).click();

    // Verifikasi sukses (SweetAlert)
    cy.get(SELECTOR_SWAL_POPUP).should('be.visible');
    cy.contains(SELECTOR_SWAL_TITLE, SWAL_TITLE_TEXT_BERHASIL).should('be.visible');

    // Verifikasi modal tertutup
    cy.get(SELECTOR_MODAL).should('not.be.visible');

    // Verifikasi data baru muncul di tabel
    cy.get(SELECTOR_LAPORAN_TABLE).contains('td', judulLaporan).should('be.visible');
  });

  /**
   * Tes skenario validasi: Menampilkan pesan error jika field wajib
   * (contoh: Judul Laporan) tidak diisi saat submit.
   */
  it('TC-REP-002 - Harus menampilkan error validasi jika judul laporan tidak diisi', () => {
    // Buka modal
    cy.contains('button', BTN_TEXT_BUAT_LAPORAN).click();
    cy.get(SELECTOR_MODAL_CONTENT).should('be.visible');

    // Isi field lain kecuali Judul (Minimal yang memicu AJAX)
    cy.get(SELECTOR_LANTAI).select('5');
    cy.get(SELECTOR_RUANG).should('not.be.disabled').select('2');
    cy.get(SELECTOR_SARANA).should('not.be.disabled').select('61');
    cy.get(SELECTOR_KERUSAKAN).select('rendah');
    cy.get(SELECTOR_URGENSI).select('rendah');
    cy.get(SELECTOR_DAMPAK).select('kecil');

    // Langsung Submit
    cy.get(SELECTOR_MODAL_SUBMIT_BTN).contains(BTN_TEXT_SIMPAN_LAPORAN).click();

    // Verifikasi error validasi HTML5 pada input Judul
    cy.get(`${SELECTOR_JUDUL}:invalid`)
      .should('exist')
      .invoke('prop', 'validationMessage')
      .and('contain', VALIDATION_MSG_INPUT);

    // Verifikasi modal TIDAK tertutup
    cy.get(SELECTOR_MODAL_CONTENT).should('be.visible');
  });

  /**
   * Tes skenario validasi: Menampilkan error jika field <select> wajib
   * (contoh: Lantai) tidak diisi.
   */
  it('TC-REP-003 - Harus menampilkan validasi browser jika field <select> wajib dikosongkan', () => {
    // Buka modal
    cy.contains('button', BTN_TEXT_BUAT_LAPORAN).click();
    cy.get(SELECTOR_MODAL_CONTENT).should('be.visible');

    // Langsung Submit
    cy.get(SELECTOR_MODAL_SUBMIT_BTN).contains(BTN_TEXT_SIMPAN_LAPORAN).click();

    // Verifikasi error validasi HTML5 pada select Lantai
    cy.get(`${SELECTOR_LANTAI}:invalid`)
      .should('exist')
      .invoke('prop', 'validationMessage')
      .and('contain', VALIDATION_MSG_SELECT);

    // Verifikasi modal TIDAK tertutup
    cy.get(SELECTOR_MODAL_CONTENT).should('be.visible');
  });
});
