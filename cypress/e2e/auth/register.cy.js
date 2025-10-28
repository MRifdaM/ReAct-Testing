/**
 * @file Cypress E2E test suite untuk fitur Registrasi Pengguna.
 * @description Menguji skenario registrasi berhasil, gagal (password mismatch),
 * validasi client-side, dan navigasi kembali ke halaman login.
 */
describe('Fitur Registrasi Pengguna', () => {

  // --- Konstanta untuk Selectors & Data ---

  // URL & Path
  const REGISTER_PATH = '/register';
  const LOGIN_PATH = '/login';

  // Selectors Form Registrasi
  const SELECTOR_LEVEL = 'select[name="level_id"]';
  const SELECTOR_NO_INDUK = 'input[name="no_induk"]';
  const SELECTOR_NAMA = 'input[name="nama"]';
  const SELECTOR_USERNAME = 'input[name="username"]';
  const SELECTOR_PASSWORD = 'input[name="password"]';
  const SELECTOR_CONFIRM_PASS = 'input[name="confirm_password"]';
  const SELECTOR_SUBMIT_BTN = 'button#form_submit';

  // Selectors (Sukses)
  const SELECTOR_SUCCESS_MODAL = '#successModal';
  const SELECTOR_SUCCESS_TITLE = '#successModalLabel';
  const MODAL_LOGIN_BTN_TEXT = 'Login Sekarang';

  // Selectors (Error)
  const SELECTOR_ERROR_ALERT = '.alert-danger';

  // Selectors (Navigasi)
  const LINK_TEXT_SIGN_IN = 'Sign in';
  const SELECTOR_USERNAME_LOGIN = 'input[name="username"]';

  // Pesan
  const BROWSER_VALIDATION_MSG = 'Please fill out this field.';
  const BROWSER_VALIDATION_MSG_SELECT = 'Please select an item in the list.';
  const SUCCESS_TITLE_TEXT = 'Pendaftaran Berhasil';
  const ERROR_PASSWORD_MISMATCH = 'password';

  /**
   * Hook ini berjalan sebelum setiap test case (`it`).
   * Memastikan setiap tes dimulai dari halaman registrasi.
   */
  beforeEach(() => {
    cy.visit(REGISTER_PATH);
  });

  /**
   * Test Case: Sukses Registrasi (Happy Path)
   * Memastikan pengguna dapat mendaftar dengan data yang valid,
   * melihat modal sukses, dan diarahkan ke halaman login.
   */
  it('TC_REG_001 - Harus berhasil mendaftarkan pengguna baru dan menampilkan modal sukses', () => {
    // Membuat data unik untuk username dan no_induk agar tes bisa diulang
    const uniqueId = Date.now();
    const username = `tes_user_${uniqueId}`;
    const noInduk = `E${uniqueId.toString().slice(-8)}`; // Contoh E45678901

    // 1. Isi form
    cy.get(SELECTOR_LEVEL).select('2'); // value '2' = Mahasiswa
    cy.get(SELECTOR_NO_INDUK).type(noInduk);
    cy.get(SELECTOR_NAMA).type('User Tes Otomatis');
    cy.get(SELECTOR_USERNAME).type(username);
    cy.get(SELECTOR_PASSWORD).type('password123');
    cy.get(SELECTOR_CONFIRM_PASS).type('password123');

    // 2. Klik submit
    cy.get(SELECTOR_SUBMIT_BTN).click();

    // 3. Verifikasi modal sukses muncul
    cy.get(SELECTOR_SUCCESS_MODAL).should('be.visible');
    cy.get(SELECTOR_SUCCESS_TITLE)
      .should('be.visible')
      .and('contain', SUCCESS_TITLE_TEXT);

    // 4. Klik tombol "Login Sekarang" di modal
    cy.contains(MODAL_LOGIN_BTN_TEXT).click();

    // 5. Verifikasi redirect ke halaman login.
    cy.url().should('include', LOGIN_PATH);
  });

  /**
   * Test Case: Gagal (Password Mismatch)
   * Memastikan pesan error server-side muncul jika password & konfirmasi tidak cocok.
   */
  it('TC_REG_002 - Harus menampilkan error server-side jika password dan konfirmasi tidak cocok', () => {
    // 1. Isi form dengan password mismatch
    cy.get(SELECTOR_LEVEL).select('3');
    cy.get(SELECTOR_NO_INDUK).type('199001012020011001');
    cy.get(SELECTOR_NAMA).type('Dosen167');
    cy.get(SELECTOR_USERNAME).type('dosen167');
    cy.get(SELECTOR_PASSWORD).type('password123');
    cy.get(SELECTOR_CONFIRM_PASS).type('apa ya jir');

    // 2. Klik submit
    cy.get(SELECTOR_SUBMIT_BTN).click();

    // 3. Verifikasi alert error server-side muncul
    cy.get(SELECTOR_ERROR_ALERT).should('be.visible');

    // 4. Verifikasi pesan error mengandung kata 'password'
    cy.get(SELECTOR_ERROR_ALERT).should('contain', ERROR_PASSWORD_MISMATCH);

    // 5. Verifikasi tetap di halaman registrasi
    cy.url().should('include', REGISTER_PATH);
  });

  /**
   * Test Case: Validasi Client-Side (Field Kosong)
   * Memastikan browser menampilkan validasi HTML5 'required' jika
   * field pertama (Level Pengguna) tidak diisi.
   */
  it('TC_REG_003 - Harus menampilkan validasi browser jika field wajib dikosongkan', () => {
    // 1. Langsung klik submit tanpa mengisi apa pun
    cy.get(SELECTOR_SUBMIT_BTN).click();

    // 2. Verifikasi field pertama yang wajib diisi (Level) ditandai invalid
    cy.get(`${SELECTOR_LEVEL}:invalid`)
      .should('exist')
      .invoke('prop', 'validationMessage')
      .should('contain', BROWSER_VALIDATION_MSG_SELECT);
  });

  /**
   * Test Case: Navigasi ke Login
   * Memastikan link "Sign in" berfungsi dan mengarahkan kembali
   * ke halaman login.
   */
  it('TC_REG_004 - Harus bisa kembali ke halaman login via link "Sign in"', () => {
    // 1. Cari link "Sign in" dan klik
    cy.contains('a', LINK_TEXT_SIGN_IN).should('be.visible').click();

    // 2. Verifikasi URL sudah berpindah ke halaman login
    cy.url().should('include', LOGIN_PATH);

    // 3. Verifikasi elemen unik dari halaman login muncul
    cy.get(SELECTOR_USERNAME_LOGIN).should('be.visible');
  });

});
