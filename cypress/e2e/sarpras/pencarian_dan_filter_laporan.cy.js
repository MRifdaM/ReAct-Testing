/**
 * @file cypress/e2e/sarpras/pencarian_dan_filter_laporan.cy.js
 * @description Menguji fitur pencarian laporan kerusakan (LAP003) dan filter status laporan (LAP002) secara bersamaan.
 */

describe('LAP002 & LAP003 - Pencarian dan Filter Laporan', () => {
    const BASE_URL = '/laporan/kelola';
    const USERNAME = 'sarpras';
    const PASSWORD = 'sarpras';

    const SELECTOR_TABLE = 'table';
    const SELECTOR_FILTER_STATUS = '#status';
    const SELECTOR_SEARCH_INPUT = 'input[type="search"]';

    beforeEach(() => {
        cy.task('resetDatabase');
        cy.loginUI(USERNAME, PASSWORD);
        cy.visit(BASE_URL);

        // Pastikan tabel tampil
        cy.get(SELECTOR_TABLE).should('be.visible');
    });

    it('LAP002 - Melakukan filter status laporan dengan jeda 2 detik', () => {
        const statusList = ['pending', 'diproses', 'selesai'];

        // Loop tiap status filter
        statusList.forEach((status) => {
            cy.log(`🔄 Menerapkan filter status: ${status}`);
            cy.get(SELECTOR_FILTER_STATUS)
                .should('be.visible')
                .select(status);

            cy.wait(2000);

            cy.get(`${SELECTOR_TABLE} tbody tr`).each(($row) => {
                cy.wrap($row).contains('td', new RegExp(status, 'i'));
            });
        });
    });

    it('LAP003 - Melakukan pencarian laporan berdasarkan ID atau judul', () => {
        // Contoh ID atau keyword yang sudah ada di database seeder kamu
        const keyword = '1';

        cy.get(SELECTOR_SEARCH_INPUT)
            .should('be.visible')
            .clear()
            .type(keyword);

        cy.wait(1000); // beri waktu DataTables memfilter

        // Pastikan hasil tabel menampilkan keyword terkait
        cy.get(`${SELECTOR_TABLE} tbody tr:first`)
            .should('contain.text', keyword);
    });
});
