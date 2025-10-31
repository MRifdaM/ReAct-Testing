/**
 * @file cypress/e2e/sarpras/ut001_tugaskan_teknisi.cy.js
 * @description UT001: Mengutus teknisi untuk mengerjakan laporan yang belum dikerjakan (status Diproses)
 */

describe('UT001 - Mengutus teknisi untuk mengerjakan laporan yang belum dikerjakan', () => {
    const BASE_URL = '/laporan/kelola';
    const USERNAME = 'sarpras';
    const PASSWORD = 'sarpras';

    const SELECTOR_TABLE = 'table';
    const SELECTOR_MODAL = '.modal-content';
    const SELECTOR_DROPDOWN = '#teknisi_id';
    const SELECTOR_BTN_TUGASKAN_CONFIRM = 'button:contains("Tugaskan")';

    beforeEach(() => {
        cy.task('resetDatabase');
        cy.loginUI(USERNAME, PASSWORD);
        cy.visit(BASE_URL);
        cy.get(SELECTOR_TABLE).should('be.visible');
    });

    it('UT001 - Menugaskan teknisi pada laporan dengan status "Diproses"', () => {
        // Cari baris dengan status Diproses dan klik tombol Tugaskan Teknisi
        cy.contains('td', 'Diproses')
            .closest('tr')
            .contains('Tugaskan Teknisi')
            .should('be.visible')
            .click();


        // Pastikan modal muncul
        cy.get(SELECTOR_MODAL, { timeout: 8000 }).should('be.visible');
        cy.contains('.modal-title', 'Tugaskan Teknisi').should('be.visible');

        // Pilih teknisi pertama dari dropdown
        cy.get(SELECTOR_DROPDOWN)
            .should('be.visible')
            .select(1); // 1 = opsi pertama selain placeholder

        // Klik tombol Tugaskan
        cy.get(SELECTOR_BTN_TUGASKAN_CONFIRM).click();

        cy.get('.swal2-popup', { timeout: 10000 })
            .should('contain.text', 'Konfirmasi')
            .and('contain.text', 'Ya, Tugaskan');

        cy.get('.swal2-confirm').click();
    });
});
