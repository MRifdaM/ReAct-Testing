/**
 * @file cypress/e2e/laporan/list_laporan.cy.js
 * @description Rangkaian tes E2E untuk fitur halaman daftar laporan kerusakan.
 * Mencakup verifikasi fungsi melihat detail laporan dari tabel.
 */
describe('Fitur Halaman Daftar Laporan Kerusakan', () => {

  // --- Konstanta Setup & Login ---
  const LAPORAN_URL = '/laporan';
  const USERNAME_MAHASISWA = 'mahasiswa';
  const PASSWORD_MAHASISWA = 'mahasiswa';

  // --- Konstanta Modal (Shared) ---
  const SELECTOR_MODAL = '#myModal';
  const SELECTOR_MODAL_CONTENT = '#myModal .modal-content';
  const SELECTOR_MODAL_TITLE = '#myModal .modal-title';
  const SELECTOR_SWAL_POPUP = '.swal2-popup';

  // --- Konstanta Form Buat Laporan (untuk Seeding) ---
  const BTN_TEXT_BUAT_LAPORAN = 'Buat Laporan';
  const BTN_TEXT_SIMPAN_LAPORAN = 'Simpan Laporan';
  const SELECTOR_CREATE_FORM_SUBMIT_BTN = '#form-create-laporan button[type="submit"]';
  const SELECTOR_CREATE_LANTAI = 'select#lantai_id';
  const SELECTOR_CREATE_RUANG = 'select#ruang_id';
  const SELECTOR_CREATE_SARANA = 'select#sarana_id';
  const SELECTOR_CREATE_JUDUL = 'input[name="laporan_judul"]';
  const SELECTOR_CREATE_KERUSAKAN = 'select[name="tingkat_kerusakan"]';
  const SELECTOR_CREATE_URGENSI = 'select[name="tingkat_urgensi"]';
  const SELECTOR_CREATE_DAMPAK = 'select[name="dampak_kerusakan"]';

  // --- Konstanta Halaman Detail & Tabel ---
  const SELECTOR_LAPORAN_TABLE = '#laporan-table';
  const BTN_TEXT_DETAIL = 'Detail';
  const SELECTOR_DETAIL_BTN = 'button.btn-info';
  const MODAL_TITLE_TEXT_DETAIL = 'Detail Laporan';
  const BTN_TEXT_TUTUP = 'Tutup';

  // --- Konstanta Modal Detail (Input Fields) ---
  const SELECTOR_DETAIL_JUDUL = '#myModal input#laporan_judul';
  const SELECTOR_DETAIL_GEDUNG = '#myModal input#gedung';
  const SELECTOR_DETAIL_LANTAI = '#myModal input#lantai';
  const SELECTOR_DETAIL_RUANG = '#myModal input#ruang';
  const SELECTOR_DETAIL_SARANA = '#myModal input#sarana';
  const SELECTOR_DETAIL_KERUSAKAN = '#myModal input#tingkat_kerusakan';
  const SELECTOR_DETAIL_DESKRIPSI = '#myModal input#laporan_deskripsi';

  // --- Konstanta Test Data ---
  const JUDUL_LAPORAN_TEST = 'Cypress Detail Test - Kursi Goyang RT02';
  const DATA_LANTAI_ID = '5';
  const DATA_RUANG_ID = '3';
  const DATA_SARANA_ID = '67';
  const DATA_GEDUNG_VALUE = 'Teknik Sipil';
  const DATA_LANTAI_VALUE = 'Lantai 5';
  const DATA_RUANG_VALUE = 'Ruang Teori 02';
  const DATA_SARANA_VALUE_PARTIAL = 'SAR-';
  const DATA_KERUSAKAN_VALUE = 'Rendah';
  const DATA_STATUS_VALUE = 'Pending';


  /**
   * Berjalan sebelum setiap tes ('it').
   * 1. Reset database testing.
   * 2. Login sebagai pengguna (mahasiswa).
   * 3. Buat satu laporan kerusakan (via UI) agar ada data untuk dites.
   */
  beforeEach(() => {
    cy.task('resetDatabase');

    // Login
    cy.loginUI(USERNAME_MAHASISWA, PASSWORD_MAHASISWA);

    // Seed Data: Buat Laporan via UI
    cy.visit(LAPORAN_URL);
    cy.contains('button', BTN_TEXT_BUAT_LAPORAN).click();
    cy.get(SELECTOR_MODAL_CONTENT).should('be.visible');

    // Isi form
    cy.get(SELECTOR_CREATE_LANTAI).select(DATA_LANTAI_ID);
    cy.get(SELECTOR_CREATE_RUANG).should('not.be.disabled').select(DATA_RUANG_ID);
    cy.get(SELECTOR_CREATE_SARANA).should('not.be.disabled').select(DATA_SARANA_ID);
    cy.get(SELECTOR_CREATE_JUDUL).type(JUDUL_LAPORAN_TEST);
    cy.get(SELECTOR_CREATE_KERUSAKAN).select('rendah');
    cy.get(SELECTOR_CREATE_URGENSI).select('sedang');
    cy.get(SELECTOR_CREATE_DAMPAK).select('kecil');

    // Submit form
    cy.get(SELECTOR_CREATE_FORM_SUBMIT_BTN).contains(BTN_TEXT_SIMPAN_LAPORAN).click();
    cy.get(SELECTOR_SWAL_POPUP).should('be.visible'); // Tunggu konfirmasi
    cy.get(SELECTOR_MODAL).should('not.be.visible'); // Tunggu modal create tertutup
  });

  /**
   * Tes skenario utama: Melihat detail laporan dari daftar.
   * Memastikan tombol detail di baris tabel berfungsi,
   * membuka modal, dan modal menampilkan data yang benar.
   */
  it('TC_MDAPORT_001 - Harus bisa membuka dan menampilkan detail laporan yang benar dari daftar', () => {
    // 1. Cari baris (tr) yang berisi judul laporan spesifik kita
    cy.get(SELECTOR_LAPORAN_TABLE).should('be.visible');
    cy.contains(SELECTOR_LAPORAN_TABLE + ' td', JUDUL_LAPORAN_TEST)
      .should('be.visible')
      .parent('tr')
      .within(() => {
        // 2. Cari tombol 'Detail' di dalam baris tersebut dan klik
        cy.get(SELECTOR_DETAIL_BTN).contains(BTN_TEXT_DETAIL).click();
      });

    // 3. Tunggu modal detail (#myModal) muncul
    cy.get(SELECTOR_MODAL_CONTENT).should('be.visible');
    cy.get(SELECTOR_MODAL_TITLE).should('contain', MODAL_TITLE_TEXT_DETAIL);

    // 4. Verifikasi field di dalam modal detail sesuai data yang dibuat
    cy.get(SELECTOR_DETAIL_JUDUL)
      .should('be.visible')
      .and('have.value', JUDUL_LAPORAN_TEST);

    cy.get(SELECTOR_DETAIL_GEDUNG).should('contain.value', DATA_GEDUNG_VALUE);
    cy.get(SELECTOR_DETAIL_LANTAI).should('have.value', DATA_LANTAI_VALUE);
    cy.get(SELECTOR_DETAIL_RUANG).should('have.value', DATA_RUANG_VALUE);
    cy.get(SELECTOR_DETAIL_SARANA).should('contain.value', DATA_SARANA_VALUE_PARTIAL);
    cy.get(SELECTOR_DETAIL_KERUSAKAN).should('have.value', DATA_KERUSAKAN_VALUE);
    cy.get(SELECTOR_DETAIL_DESKRIPSI).should('have.value', DATA_STATUS_VALUE);

    // 5. Cari tombol "Tutup" di footer modal dan klik
    cy.get(SELECTOR_MODAL + ' .modal-footer button')
      .contains(BTN_TEXT_TUTUP)
      .should('be.visible')
      .click();

    // 6. Verifikasi modal sudah tertutup
    cy.get(SELECTOR_MODAL).should('not.be.visible');

    // 7. Verifikasi masih berada di halaman daftar laporan
    cy.url().should('include', LAPORAN_URL);
    cy.get(SELECTOR_LAPORAN_TABLE).should('be.visible');
  });

});
