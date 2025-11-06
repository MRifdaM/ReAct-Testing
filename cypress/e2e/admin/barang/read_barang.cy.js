/**
 * @file cypress/e2e/barang/read_barang.cy.js
 * @description Rangkaian tes E2E untuk fitur Read Barang oleh Admin.
 * Menguji alur melihat daftar barang, melihat detail barang,
 * filtering, pencarian, dan pagination.
 */

describe("Fitur View Barang - Admin", () => {
  const URL = "/barang";
  const USERNAME = "admin";
  const PASSWORD = "admin";

  const TABLE = "#table_barang";
  const MODAL = "#myModal";
  const BTN_DETAIL = ".btn-info";
  const FILTER_KATEGORI = "#kategori_id";
  const SEARCH_INPUT = 'input[type="search"]';
  const MODAL_TITLE = "Detail Barang";
  const PAGINATION = "#table_barang_paginate";

  beforeEach(() => {
    cy.task("resetDatabase");
    cy.loginUI(USERNAME, PASSWORD);
    cy.visit(URL);
    cy.url().should("include", URL);
  });

  it("TC_RBARANG_001 - Menampilkan tabel list barang", () => {
    cy.get(TABLE).should("exist");
    cy.get(`${TABLE} tbody tr`, { timeout: 10000 })
      .should("have.length.greaterThan", 0);

    cy.get(`${TABLE} thead th`).contains("Nama Barang");
    cy.get(`${TABLE} thead th`).contains("Kategori");
  });

  it("TC_RBARANG_002 - Melihat detail barang dari list", () => {
    cy.get(`${TABLE} tbody tr:first ${BTN_DETAIL}`, { timeout: 10000 })
      .should("exist")
      .click({ force: true });

    cy.get(MODAL).should("be.visible");
    cy.get(`${MODAL} .modal-title`).should("contain.text", MODAL_TITLE);

    cy.get(`${MODAL} .modal-body`).within(() => {
      cy.contains("ID Barang").should("exist");
      cy.contains("Nama Barang").should("exist");
      cy.contains("Kategori").should("exist");
      cy.contains("Spesifikasi").should("exist");
    });

    cy.get(`${MODAL} .btn-secondary`).click({ force: true });
    cy.window().then((win) => {
      if (win.$) win.$(MODAL).modal('hide');
    });

    cy.get(MODAL, { timeout: 8000 }).should('not.be.visible');
    cy.url().should('include', URL);
    cy.get(TABLE).should('be.visible');
  });

  it("TC_RBARANG_003 - Memfilter barang berdasarkan kategori", () => {
    cy.get(FILTER_KATEGORI).should("exist").and("not.be.disabled");

    cy.get(FILTER_KATEGORI).select(1);
    cy.wait(1000);

    cy.get(`${TABLE} tbody tr`, { timeout: 10000 })
      .should("have.length.greaterThan", 0);
  });

  it("TC_RBARANG_004 - Mencari barang berdasarkan nama", () => {
    cy.get(SEARCH_INPUT).should("exist").clear().type("Meja");
    cy.wait(1000);

    cy.get(`${TABLE} tbody tr`).each(($row) => {
      cy.wrap($row).within(() => {
        cy.get("td:nth-child(2)").should("contain.text", "Meja");
      });
    });
  });

  it("TC_RBARANG_005 - Menavigasi pagination tabel barang", () => {
    cy.get(PAGINATION).should("exist");

    cy.get(`${TABLE} tbody tr:first td:nth-child(2)`)
      .invoke("text")
      .then((firstPageItem) => {
        cy.get(`${PAGINATION} .paginate_button.next:not(.disabled)`).click();
        cy.wait(1000);

        cy.get(`${TABLE} tbody tr:first td:nth-child(2)`)
          .invoke("text")
          .should((secondPageItem) => {
            expect(secondPageItem.trim()).not.to.eq(firstPageItem.trim());
          });
      });
  });
});
