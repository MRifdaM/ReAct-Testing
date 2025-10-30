/**
 * @file cypress/e2e/sarpras/verifikasi_laporan.cy.js
 * @description
 * MLAP001: Verifikasi tombol & aksi "Terima Laporan" pada laporan Pending
 * MLAP002: Verifikasi tombol & aksi "Tolak Laporan" pada laporan Pending
 */

describe('Verifikasi laporan pending - MLAP001 & MLAP002', () => {
    const BASE_URL = '/laporan/kelola';
    const USERNAME = 'sarpras';
    const PASSWORD = 'sarpras';

    const SELECTOR_TABLE = 'table';
    const SELECTOR_BTN_DETAIL = 'button:contains("Detail")';

    beforeEach(() => {
        // kalau datanya sudah ada, baris ini bisa dihapus
        cy.task('resetDatabase');
        cy.loginUI(USERNAME, PASSWORD);
        cy.visit(BASE_URL);
        cy.get(SELECTOR_TABLE).should('be.visible');
    });

    const bukaModalLaporanPending = () => {
        cy.contains('td', 'Pending')
            .first()
            .parent('tr')
            .within(() => {
                cy.get(SELECTOR_BTN_DETAIL).click();
            });
        cy.get('.modal-content', { timeout: 10000 }).should('be.visible');
    };

    const cekIsiModalTidakKosong = () => {
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
    };

    const cekTombolFooter = () => {
        cy.get('.modal-footer').within(() => {
            cy.contains('button', 'Terima Laporan').should('exist');
            cy.contains('button', 'Tolak Laporan').should('exist');
            cy.contains('button', 'Tutup').should('exist');
        });
    };

    // MLAP001
    it('MLAP001 - Verifikasi tombol & aksi Terima Laporan pada status Pending', () => {
        bukaModalLaporanPending();
        cekIsiModalTidakKosong();
        cekTombolFooter();

        cy.contains('button', 'Terima Laporan').click();

        cy.get('.swal2-popup', { timeout: 10000 })
            .should('contain.text', 'Konfirmasi')
            .and('contain.text', 'Ya, Terima');

        cy.get('.swal2-confirm').click();


        // Pastikan status berubah jadi "Diproses"
        cy.contains('td', 'Diproses', { timeout: 10000 }).should('exist');
    });


    // MLAP002
    it('MLAP002 - Verifikasi tombol & aksi Tolak Laporan pada status Pending', () => {
        bukaModalLaporanPending();
        cekIsiModalTidakKosong();
        cekTombolFooter();

        cy.contains('button', 'Tolak Laporan').click();

        cy.get('.swal2-popup', { timeout: 10000 })
            .should('contain.text', 'Konfirmasi')
            .and('contain.text', 'Ya, Tolak');

        cy.get('.swal2-confirm').click();
    });
});
