/**
 * @file cypress/e2e/sarpras/1_lihat_detail_semua_status.cy.js
 * @description TC LAP001: Bisa melihat detail laporan dari SEMUA status
 */
describe('LAP001 - Bisa melihat detail laporan dari semua status', () => {
    const BASE_URL = '/laporan/kelola';
    const USERNAME = 'sarpras';
    const PASSWORD = 'sarpras';

    const SELECTOR_TABLE = 'table';
    const SELECTOR_BTN_DETAIL = 'button:contains("Detail")';
    const SELECTOR_MODAL = '#detailModal';
    const SELECTOR_CLOSE_BTN = 'button:contains("Tutup")';

    const DATA_LAPORAN = ['Pending', 'Diproses', 'Dikerjakan', 'Selesai'];

    beforeEach(() => {
        cy.task('resetDatabase');
        cy.loginUI(USERNAME, PASSWORD);
        cy.visit(BASE_URL);
        cy.get(SELECTOR_TABLE).should('be.visible');
    });

    const cekIsiModalTidakKosong = () => {
        cy.get('.modal-content', { timeout: 10000 }).should('be.visible');
        cy.get('.modal-content label').each(($label) => {
            const labelText = $label.text().trim();

            cy.wrap($label)
                .closest('.form-group')
                .find('input, .form-control, .form-control p, p', { timeout: 8000 })
                .then(($el) => {
                    if ($el.length === 0) {
                        cy.log(`⚠️ Tidak ada input/p di label: ${labelText}`);
                        return;
                    }

                    const tag = $el.prop('tagName').toLowerCase();
                    const valuePromise =
                        tag === 'input'
                            ? cy.wrap($el).invoke('val')
                            : cy.wrap($el).invoke('text');

                    valuePromise.then((val) => {
                        const value = (val || '').trim();
                        if (labelText !== 'Foto Laporan') {
                            expect(value, `Field "${labelText}" tidak boleh kosong`).to.not.be.empty;
                            expect(value).to.not.equal('-');
                        }
                    });
                });
        });




        // cek tombol
        cy.get('.modal-footer').within(() => {
            cy.contains('button', 'Tutup').should('exist');
        });

        // tombol Terima/Tolak hanya muncul kalau pending
        cy.get('.modal-footer').then(($footer) => {
            if ($footer.text().includes('Terima Laporan')) {
                cy.contains('button', 'Terima Laporan').should('exist');
                cy.contains('button', 'Tolak Laporan').should('exist');
            }
        });

        cy.contains('button', 'Tutup').click();
        cy.get(SELECTOR_MODAL).should('not.exist');
    };

    DATA_LAPORAN.forEach((status) => {
        it(`LAP001 - Bisa lihat detail laporan status "${status}"`, () => {
            cy.contains('td', status)
                .parent('tr')
                .within(() => {
                    cy.get(SELECTOR_BTN_DETAIL).click();
                });
            cekIsiModalTidakKosong();
        });
    });

    it('LAP001 - Semua status muncul di daftar laporan', () => {
        DATA_LAPORAN.forEach(status => {
            cy.contains('td', status).should('be.visible');
        });
    });
});
