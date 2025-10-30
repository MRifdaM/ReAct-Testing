/**
 * @file cypress/e2e/teknisi/lihat_laporan.cy.js
 * @description Rangkaian tes E2E untuk fitur Kelola Laporan (untuk user Teknisi).
 * Menguji fungsi melihat daftar laporan, filter status, dan search.
 */
describe("Fitur Kelola Laporan - User Teknisi", () => {
    // --- Konstanta Setup & Login ---
    const KELOLA_LAPORAN_URL = "/laporan/kelola";
    const USERNAME_TEKNISI = "teknisi1";
    const PASSWORD_TEKNISI = "teknisi1";

    // --- Konstanta Halaman Kelola Laporan ---
    const SELECTOR_LAPORAN_TABLE = "#table_laporan";
    const SELECTOR_FILTER_STATUS = "select#status";
    const SELECTOR_DATATABLES_SEARCH = 'input[type="search"]';

    // --- Konstanta untuk AJAX Intercept ---
    const LIST_KELOLA_URL_GLOB = "**/laporan/list_kelola**";
    const ALIAS_LIST_KELOLA = "getListKelola";

    /**
     * Helper: Mengambil jumlah kolom <th> di header tabel.
     * Digunakan untuk menyaring baris data valid dari baris placeholder DataTables.
     * @returns {Cypress.Chainable<number>}
     */
    const getHeaderColCount = () =>
        cy.get(`${SELECTOR_LAPORAN_TABLE} thead th`).its("length");

    /**
     * Helper: Menunggu request AJAX DataTables selesai.
     * @param {string|null} expectedStatusParam - Nilai yang diharapkan untuk query param 'status'.
     * @returns {Cypress.Chainable}
     */
    const waitTableReload = (expectedStatusParam = null) => {
        return cy
            .wait(`@${ALIAS_LIST_KELOLA}`, { timeout: 20000 })
            .then((inter) => {
                expect([200, 304]).to.include(inter.response?.statusCode);

                if (expectedStatusParam !== null) {
                    expect(inter.request.url).to.match(
                        new RegExp(`[?&]status=${expectedStatusParam}(?:&|$)`)
                    );
                }
            })
            .then(() => {
                cy.get(`${SELECTOR_LAPORAN_TABLE} tbody`, {
                    timeout: 10000,
                }).should("be.visible");
            });
    };

    /**
     * Helper: Mengambil elemen <tr> yang berisi data valid dari tbody.
     * Memfilter baris "Loading..." atau "No data..." dari DataTables.
     * @returns {Cypress.Chainable<JQuery<HTMLTableRowElement>>}
     */
    const getDataRows = () => {
        return getHeaderColCount().then((colCount) => {
            return cy
                .get(`${SELECTOR_LAPORAN_TABLE} tbody tr`)
                .then(($rows) => {
                    const valid = [...$rows].filter(
                        (r) => Cypress.$(r).find("td").length === colCount
                    );
                    return Cypress.$(valid);
                });
        });
    };

    /**
     * Hook: Berjalan sebelum setiap tes ('it').
     * 1. Reset database.
     * 2. Login sebagai teknisi.
     * 3. Setup intercept untuk AJAX DataTables.
     * 4. Kunjungi halaman kelola laporan.
     */
    beforeEach(() => {
        // 1. Reset database
        cy.task("resetDatabase");

        // 2. Login sebagai teknisi
        cy.loginUI(USERNAME_TEKNISI, PASSWORD_TEKNISI);

        // 3. Setup intercept untuk monitoring AJAX request
        cy.intercept("GET", LIST_KELOLA_URL_GLOB).as(ALIAS_LIST_KELOLA);

        // 4. Kunjungi halaman kelola laporan
        cy.visit(KELOLA_LAPORAN_URL);
        cy.url().should("include", KELOLA_LAPORAN_URL);

        // 5. Tunggu load awal tabel
        waitTableReload();
    });

    /**
     * Test Case 001: Melihat List Laporan di Tabel
     * Test PASSED jika ada data yang muncul di tabel.
     */
    it("TC_TEKNISI_001 - Harus dapat melihat list laporan di tabel kelola laporan", () => {
        // Verifikasi tabel ada dan visible
        cy.get(SELECTOR_LAPORAN_TABLE).should("be.visible");

        // Verifikasi ada data di tabel (minimal 1 baris data valid)
        getDataRows().then(($rows) => {
            expect(
                $rows.length,
                "Harus ada minimal 1 baris data laporan di tabel"
            ).to.be.greaterThan(0);
        });

        // Verifikasi header tabel sesuai
        cy.get(`${SELECTOR_LAPORAN_TABLE} thead th`).should("contain", "Judul");
        cy.get(`${SELECTOR_LAPORAN_TABLE} thead th`).should(
            "contain",
            "Status Laporan"
        );
        cy.get(`${SELECTOR_LAPORAN_TABLE} thead th`).should("contain", "Aksi");
    });

    /**
     * Test Case 002: Filter Status Laporan
     * Test PASSED jika dapat memilih filter "selesai" dan tabel menampilkan
     * hanya data dengan status "Selesai".
     */
    it("TC_TEKNISI_002 - Harus dapat melakukan filter status laporan ", () => {
        // Pastikan filter status ada dan visible
        cy.get(SELECTOR_FILTER_STATUS).should("be.visible");

        // Pilih filter status "Selesai" (nilai option sesuai value di DB)
        cy.get(SELECTOR_FILTER_STATUS)
            .should("be.visible")
            .select("selesai")
            .invoke("val")
            .then((selectedStatus) => {
                // Tunggu reload tabel dengan parameter status=<selectedStatus>
                waitTableReload(selectedStatus);

                // Verifikasi ada data yang ditampilkan setelah filter
                getDataRows().then(($rows) => {
                    expect(
                        $rows.length,
                        `Harus ada data setelah filter "${selectedStatus}" diterapkan`
                    ).to.be.greaterThan(0);

                    // Verifikasi semua baris menampilkan status yang dipilih
                    // Asumsi kolom status adalah kolom ke-5 (index 4)
                    $rows.each((_, row) => {
                        const statusText = Cypress.$(row)
                            .find("td")
                            .eq(4)
                            .text()
                            .trim()
                            .toLowerCase();

                        expect(statusText).to.equal(
                            String(selectedStatus).toLowerCase()
                        );
                    });
                });
            });
    });

    /**
     * Test Case 003: Search Laporan
     * Test PASSED jika dapat melakukan search menggunakan fitur search DataTables
     * dan tabel menampilkan hasil yang sesuai dengan keyword.
     */
    it("TC_TEKNISI_003 - Harus dapat melakukan search laporan menggunakan keyword", () => {
        // Tunggu tabel terisi dengan data awal
        getDataRows().then(($initialRows) => {
            expect($initialRows.length).to.be.greaterThan(0);

            // Ambil ID Laporan dari baris pertama sebagai keyword search
            const firstRowId = Cypress.$($initialRows[0])
                .find("td")
                .eq(1)
                .text()
                .trim();

            // Pastikan search box ada dan visible
            cy.get(SELECTOR_DATATABLES_SEARCH).should("be.visible");

            // Ketik ID di search box
            cy.get(SELECTOR_DATATABLES_SEARCH).clear().type(firstRowId);

            // Tunggu reload tabel setelah search
            cy.wait(`@${ALIAS_LIST_KELOLA}`, { timeout: 20000 }).then(
                (inter) => {
                    expect([200, 304]).to.include(inter.response?.statusCode);
                }
            );

            // Verifikasi tabel menampilkan hasil search
            cy.get(`${SELECTOR_LAPORAN_TABLE} tbody`, {
                timeout: 10000,
            }).should("be.visible");

            // Verifikasi ada data hasil search dan ID cocok
            getDataRows().then(($searchRows) => {
                expect(
                    $searchRows.length,
                    `Harus ada hasil search untuk ID "${firstRowId}"`
                ).to.be.greaterThan(0);

                // Verifikasi bahwa setiap baris pertama mengandung ID yang dicari
                const resultFirstId = Cypress.$($searchRows[0])
                    .find("td")
                    .eq(1)
                    .text()
                    .trim();
                expect(resultFirstId).to.equal(firstRowId);
            });
        });
    });
});
