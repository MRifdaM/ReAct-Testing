/**
 * @file Cypress E2E test suite untuk fitur Login Pengguna.
 * @description Menguji skenario login berhasil, gagal (password/username salah),
 * dan validasi field kosong (required).
 */
describe('Fitur Login Pengguna', () => {
  
  // --- Konstanta untuk Test Data & Selectors ---
  
  // Data Kredensial
  const USERNAME_VALID = 'mahasiswa';
  const PASSWORD_VALID = 'mahasiswa';
  const USERNAME_INVALID = 'mahasiswa2'; 
  const PASSWORD_INVALID = 'password-salah';
  
  // Selectors 
  const SELECTOR_USERNAME = 'input[name="username"]';
  const SELECTOR_PASSWORD = 'input[name="password"]';
  const SELECTOR_SUBMIT_BTN = 'button[type="submit"]';

  // Teks & Pesan
  const WELCOME_MESSAGE = 'Halo, Mahasiswa1';
  const POPUP_ERROR_TITLE = 'Login Gagal';
  const BROWSER_VALIDATION_MSG = 'Please fill out this field.'; // Pesan ini bisa berbeda antar browser

  /**
   * Hook ini berjalan sebelum setiap test case (`it`) dalam block `describe` ini.
   * Fungsinya untuk mengunjungi halaman login, memastikan setiap tes
   * dimulai dari kondisi yang sama (bersih).
   */
  beforeEach(() => {
    cy.visit('/login');
  });

  /**
   * Test Case: Sukses Login
   * Memastikan pengguna dapat login dengan username dan password yang valid
   * dan diarahkan ke halaman dashboard ('/').
   */
  it('Harus berhasil login dengan kredensial yang valid', () => {
    cy.get(SELECTOR_USERNAME).should('be.visible').type(USERNAME_VALID);
    cy.get(SELECTOR_PASSWORD).should('be.visible').type(PASSWORD_VALID);
    cy.get(SELECTOR_SUBMIT_BTN).should('be.visible').click();

    // Verifikasi redirect ke halaman utama
    cy.url().should('eq', Cypress.config().baseUrl + '/');
    
    // Verifikasi ada pesan selamat datang
    cy.contains(WELCOME_MESSAGE).should('be.visible');
  });

  /**
   * Test Case: Gagal Login (Password Salah)
   * Memastikan popup error muncul jika username benar tapi password salah.
   * Pengguna harus tetap berada di halaman login setelah menutup popup.
   */
  it('Harus menampilkan popup error jika password salah dan tetap di halaman login', () => {
    cy.get(SELECTOR_USERNAME).should('be.visible').type(USERNAME_VALID); 
    cy.get(SELECTOR_PASSWORD).should('be.visible').type(PASSWORD_INVALID);
    cy.get(SELECTOR_SUBMIT_BTN).should('be.visible').click();

    // Verifikasi popup error muncul
    cy.contains(POPUP_ERROR_TITLE).should('be.visible');
    
    // Klik tombol OK pada popup
    cy.contains('button', 'OK').should('be.visible').click();

    // Verifikasi popup hilang
    cy.contains(POPUP_ERROR_TITLE).should('not.exist');
    
    // Verifikasi tetap di halaman login
    cy.url().should('include', '/login');
  });

  /**
   * Test Case: Gagal Login (Username Salah)
   * Memastikan popup error muncul jika username salah tapi password benar.
   * Pengguna harus tetap berada di halaman login setelah menutup popup.
   */
  it('Harus menampilkan popup error jika username salah', () => {
    cy.get(SELECTOR_USERNAME).should('be.visible').type(USERNAME_INVALID);
    cy.get(SELECTOR_PASSWORD).should('be.visible').type(PASSWORD_VALID); 
    cy.get(SELECTOR_SUBMIT_BTN).should('be.visible').click();

    // Verifikasi popup error muncul
    cy.contains(POPUP_ERROR_TITLE).should('be.visible');
    
    // Klik tombol OK pada popup
    cy.contains('button', 'OK').should('be.visible').click();

    // Verifikasi popup hilang
    cy.contains(POPUP_ERROR_TITLE).should('not.exist');
    
    // Verifikasi tetap di halaman login
    cy.url().should('include', '/login');
  });

  /**
   * Test Case: Validasi Input Kosong (HTML5)
   * Memastikan browser menampilkan pesan validasi bawaan jika
   * form disubmit dengan field username atau password kosong.
   */
  it('Harus menandai field username dan password sebagai tidak valid jika kosong saat submit', () => {
    cy.get(SELECTOR_SUBMIT_BTN).should('be.visible').click();

    // Verifikasi validasi pada input username
    // Menggunakan template literal untuk menggabungkan selector
    cy.get(`${SELECTOR_USERNAME}:invalid`)
      .should('exist')
      // 'invoke' digunakan untuk memanggil fungsi/mendapatkan properti dari subjek
      .invoke('prop', 'validationMessage') 
      .should('contain', BROWSER_VALIDATION_MSG);

    // Verifikasi validasi pada input password
    cy.get(`${SELECTOR_PASSWORD}:invalid`)
      .should('exist')
      .invoke('prop', 'validationMessage')
      .should('contain', BROWSER_VALIDATION_MSG);
  });
});