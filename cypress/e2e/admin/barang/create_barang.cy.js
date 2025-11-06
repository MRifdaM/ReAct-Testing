/**
 * @file cypress/e2e/barang/create_barang.cy.js
 * @description Rangkaian tes E2E untuk fitur Create Barang oleh Admin.
 * Menguji alur tambah barang (via modal), validasi form,
 * dan verifikasi data di tabel.
 */
describe("Fitur Create Barang - Admin", () => {
  const USERNAME = "admin";
  const PASSWORD = "admin";
  const URL = "/barang";

  const TABLE_BARANG = "#table_barang";
  const BTN_CREATE = "Tambah Barang";

  const MODAL = "#myModal";
  const MODAL_CONTENT = "#myModal .modal-content";
  const FORM_CREATE = "#form-create-barang";
  const MODAL_SUBMIT_BTN = `${FORM_CREATE} button.btn-primary`;
  const MODAL_CLOSE_BTN = `${FORM_CREATE} .btn-secondary`;

  const NAMA = "#barang_nama";
  const KATEGORI = "#kategori_id";
  const SPESIFIKASI = "#spesifikasi";

  const SWAL_POPUP = ".swal2-popup";
  const SWAL_TITLE = ".swal2-title";
  const SWAL_TITLE_TEXT_BERHASIL = "Berhasil";
  const VALIDATION_MSG_INPUT = "fill";
  const VALIDATION_MSG_SELECT = "Please select an item in the list.";

  /**
   * Helper: Buka modal Tambah Barang
   */
  function openCreateModal() {
    cy.contains("button", BTN_CREATE).click();
    cy.get(MODAL_CONTENT).should("be.visible");
    cy.get(FORM_CREATE).should("exist");
  }

  /**
   * Helper: Isi form tambah barang
   */
  function fillForm({ nama = "", kategori = "", spesifikasi = "" }) {
    if (nama) cy.get(NAMA).clear().type(nama);
    if (kategori) cy.get(KATEGORI).select(kategori);
    if (spesifikasi) cy.get(SPESIFIKASI).clear().type(spesifikasi);
  }

  beforeEach(() => {
    cy.task("resetDatabase");
    cy.loginUI(USERNAME, PASSWORD);
    cy.visit(URL);
    cy.url().should("include", URL);
  });

  /**
   * TC_CBARANG_001 - Skenario sukses menambahkan barang dengan input valid.
   */
  it("TC_CBARANG_001 - Menambahkan barang dengan data valid", () => {
    const namaBarang = "Stop Kontak 6 Lubang";

    openCreateModal();
    fillForm({
        nama: namaBarang,
        kategori: "2",
        spesifikasi: "Kapasitas 2500W, warna putih",
    });

    cy.get(MODAL_SUBMIT_BTN).click();

    cy.get(SWAL_POPUP, { timeout: 10000 }).should("be.visible");
    cy.contains(SWAL_TITLE, SWAL_TITLE_TEXT_BERHASIL, { timeout: 10000 }).should("be.visible");
    cy.get(SWAL_POPUP, { timeout: 10000 }).should("not.exist");
    cy.get(MODAL).should("not.be.visible");

    // Reload halaman agar tabel update
    cy.visit("/barang");
    cy.url().should("include", "/barang");

    cy.get('select[name="table_barang_length"]').then(($select) => {
        if ($select.length) cy.wrap($select).select('100');
    });

    // Verifikasi data muncul
    cy.get(TABLE_BARANG, { timeout: 20000 })
        .invoke("text")
        .should("include", namaBarang);
    });


  /**
   * TC_CBARANG_002 - Validasi: Nama Barang kosong
   */
  it("TC_CBARANG_002 - Menampilkan validasi browser jika nama barang tidak diisi", () => {
    openCreateModal();

    fillForm({
      kategori: "1",
      spesifikasi: "Barang tanpa nama",
    });

    cy.get(MODAL_SUBMIT_BTN).click();

    // Validasi HTML5 pada input nama
    cy.get(`${NAMA}:invalid`)
      .should("exist")
      .invoke("prop", "validationMessage")
      .and("contain", VALIDATION_MSG_INPUT);

    cy.get(MODAL_CONTENT).should("be.visible");
  });

  /**
   * TC_CBARANG_003 - Validasi: Kategori belum dipilih
   */
  it("TC_CBARANG_003 - Menampilkan validasi browser jika kategori belum dipilih", () => {
    openCreateModal();

    fillForm({
      nama: "Barang tanpa kategori",
      spesifikasi: "Spesifikasi uji coba",
    });

    cy.get(MODAL_SUBMIT_BTN).click();

    // Validasi HTML5 pada select kategori
    cy.get(`${KATEGORI}:invalid`)
      .should("exist")
      .invoke("prop", "validationMessage")
      .and("contain", VALIDATION_MSG_SELECT);

    cy.get(MODAL_CONTENT).should("be.visible");
  });

  /**
   * TC_CBARANG_004 - Batal menambahkan barang
   */
  it("TC_CBARANG_004 - Menutup modal saat klik tombol Batal", () => {
    openCreateModal();

    fillForm({
      nama: "Stop Kontak 6 Lubang",
      kategori: "2",
      spesifikasi: "Kapasitas 2500W, warna putih",
    });

    cy.get(MODAL_CLOSE_BTN).click();
    cy.get(MODAL).should("not.be.visible");
  });
});
