/**
 * E2E tests: Kerjakan Laporan (untuk teknisi) — 3 cases in one file
 * - Valid input
 * - Empty required field
 * - Invalid biaya
 */

describe('Fitur Kerjakan Laporan - Teknisi (3 cases)', () => {
    const KELOLA_URL = '/laporan/kelola';
    const USER = 'teknisi1';
    const PASS = 'teknisi1';

    beforeEach(() => {
        cy.task('resetDatabase');
        cy.loginUI(USER, PASS);
        cy.intercept('**/laporan/list_kelola**').as('getListKelola');
        cy.visit(KELOLA_URL);
        cy.wait('@getListKelola');
        cy.url().should('include', KELOLA_URL);
    });

    function openFinishFormForFirstDikerjakan() {
        cy.intercept('GET', '/laporan/show_kelola_ajax/*').as('getDetail');
        cy.intercept('GET', '/laporan/finish_form/*').as('getFinishForm');
        return cy.get('#table_laporan tbody tr').then(($rows) => {
            const rows = Array.from($rows);
            const target = rows.find((r) => (r.querySelectorAll('td')[4] || {}).innerText?.trim().toLowerCase() === 'dikerjakan');
            if (!target) throw new Error('Tidak ada laporan dengan status "Dikerjakan". Pastikan seed menghasilkan laporan dengan status tersebut.');
            const laporanId = target.querySelectorAll('td')[1].innerText.trim();
            cy.wrap(target).find('button').contains('Detail').click();
            cy.wait('@getDetail');
            cy.contains('Detail Laporan', { timeout: 10000 }).should('be.visible').then(($title) => {
                const $modal = $title.closest('.modal');
                cy.wrap($modal).within(() => cy.get('button#finishLaporanButton').click());
            });
            cy.wait('@getFinishForm');
            return cy.wrap(laporanId);
        });
    }

    it('TC_TEKNISI_KERJAKAN_VALID - finish with valid inputs', () => {
        cy.intercept('POST', '**/laporan/selesai/*').as('postSelesai');
        openFinishFormForFirstDikerjakan().then((laporanId) => {
            cy.get('form#formFinishLaporan').within(() => {
                cy.get('textarea[name="tindakan"]').type('Pengecekan lengkap.');
                cy.get('textarea[name="bahan"]').type('Sparepart');
                cy.get('input[name="biaya"]').type('150000');
                // Trigger the form submit which opens a SweetAlert confirmation
                cy.root().submit();
            });
            // Confirm the SweetAlert so the AJAX POST is sent
            cy.get('.swal2-confirm', { timeout: 10000 }).click();
            cy.wait('@postSelesai', { timeout: 15000 }).its('response.statusCode').should('be.oneOf', [200]);
            cy.wait('@getListKelola');
            cy.get('#table_laporan tbody tr').then(($rows2) => {
                const rows2 = Array.from($rows2);
                const found = rows2.find(r => r.querySelectorAll('td')[1].innerText.trim() === laporanId);
                expect(found).to.exist;
                const newStatus = found.querySelectorAll('td')[4].innerText.trim().toLowerCase();
                expect(newStatus).to.equal('selesai');
            });
        });
    });

    it('TC_TEKNISI_KERJAKAN_KOSONG - validation error when tindakan empty', () => {
        cy.intercept('POST', '**/laporan/selesai/*').as('postSelesai');
        openFinishFormForFirstDikerjakan().then(() => {
            cy.get('form#formFinishLaporan').within(() => {
                cy.get('textarea[name="bahan"]').type('Material A');
                cy.get('input[name="biaya"]').type('50000');
                cy.root().submit();
            });
            // Confirm the SweetAlert so the AJAX POST is sent and can be intercepted
            cy.get('.swal2-confirm', { timeout: 10000 }).click();
            cy.wait('@postSelesai', { timeout: 15000 }).then((interception) => {
                const code = interception.response.statusCode;
                if (code === 200) {
                    // Some environments return 200 with an error payload. Assert body indicates failure.
                    expect(interception.response.body).to.have.property('status');
                    expect(['error', 'warning']).to.include(interception.response.body.status);
                } else {
                    expect(code).to.equal(422);
                }
            });
            cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible');
        });
    });

    it('TC_TEKNISI_KERJAKAN_TIDAK_VALID - validation error when biaya non-numeric', () => {
        cy.intercept('POST', '**/laporan/selesai/*').as('postSelesai');
        openFinishFormForFirstDikerjakan().then(() => {
            cy.get('form#formFinishLaporan').within(() => {
                cy.get('textarea[name="tindakan"]').type('Tindakan valid');
                cy.get('textarea[name="bahan"]').type('Material B');
                // Ensure the non-numeric value is actually entered and sent by switching type to text
                cy.get('input[name="biaya"]').invoke('attr', 'type', 'text').clear().type('abc').trigger('input');
                cy.root().submit();
            });
            // Confirm SweetAlert so the AJAX POST is attempted
            cy.get('.swal2-confirm', { timeout: 10000 }).click();
            cy.wait('@postSelesai', { timeout: 15000 }).then((interception) => {
                const reqBody = interception.request.body;
                if (typeof reqBody === 'string') {
                    expect(reqBody).to.include('biaya=abc');
                } else {
                    expect(reqBody).to.have.property('biaya', 'abc');
                }

                const code = interception.response.statusCode;
                if (code === 200) {
                    // Some environments return 200 with an error payload. Assert body indicates failure.
                    expect(interception.response.body).to.have.property('status');
                    expect(['error', 'warning']).to.include(interception.response.body.status);
                } else {
                    expect([422, 400]).to.include(code);
                }
            });
            cy.get('.swal2-popup', { timeout: 10000 }).should('be.visible');
        });
    });
});
