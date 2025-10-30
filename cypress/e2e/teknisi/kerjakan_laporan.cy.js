/**
 * E2E tests: Kerjakan Laporan (untuk teknisi)
 * - Cari baris dengan status 'Dikerjakan'
 * - Buka Detail -> klik Finish -> isi form valid -> submit
 * - Konfirmasi SweetAlert -> tunggu POST -> pastikan status berubah menjadi 'Selesai'
 */

describe("Fitur Kerjakan Laporan - Teknisi", () => {
    const KELOLA_URL = "/laporan/kelola";
    const USER = "teknisi1";
    const PASS = "teknisi1";

    beforeEach(() => {
        cy.task("resetDatabase");
        cy.loginUI(USER, PASS);
        cy.intercept("**/laporan/list_kelola**").as("getListKelola");
        cy.visit(KELOLA_URL);
        cy.wait("@getListKelola");
        cy.url().should("include", KELOLA_URL);
    });

    it("TC_TEKNISI_KERJAKAN_001 - Mengerjakan laporan dengan input valid (status awal: Dikerjakan)", () => {
        // Temukan baris yang berstatus 'Dikerjakan'
        cy.get("#table_laporan tbody tr").then(($rows) => {
            const rows = Array.from($rows);
            let targetRow = null;

            for (const r of rows) {
                const cols = r.querySelectorAll("td");
                if (!cols || cols.length < 5) continue;
                const statusText = cols[4].innerText.trim().toLowerCase();
                if (statusText === "dikerjakan") {
                    targetRow = r;
                    break;
                }
            }

            if (!targetRow) {
                throw new Error(
                    'Tidak ada laporan dengan status "Dikerjakan". Pastikan seed menghasilkan laporan dengan status tersebut.'
                );
            }

            const laporanId = targetRow
                .querySelectorAll("td")[1]
                .innerText.trim();

            // Pasang intercept untuk aksi-aksi yang akan terjadi
            cy.intercept("GET", "/laporan/show_kelola_ajax/*").as("getDetail");
            cy.intercept("GET", "/laporan/finish_form/*").as("getFinishForm");
            cy.intercept("POST", "/laporan/selesai/*").as("postSelesai");

            // Klik tombol Detail pada row yang ditemukan
            cy.wrap(targetRow).find("button").contains("Detail").click();
            cy.wait("@getDetail");

            // Dalam modal, klik tombol finish (id finishLaporanButton)
            cy.contains("Detail Laporan", { timeout: 10000 })
                .should("be.visible")
                .then(($title) => {
                    const $modal = $title.closest(".modal");
                    cy.wrap($modal)
                        .should("exist")
                        .and("be.visible")
                        .within(() => {
                            cy.get("button#finishLaporanButton")
                                .should("exist")
                                .click();
                        });
                });

            // Tunggu form finish dimuat
            cy.wait("@getFinishForm");

            // Isi form valid
            // Form ada di modal yang terlihat; cari form#formFinishLaporan
            cy.get("form#formFinishLaporan")
                .should("exist")
                .within(() => {
                    cy.get('textarea[name="tindakan"]').type(
                        "Pengecekan dan perbaikan unit."
                    );
                    cy.get('textarea[name="bahan"]').type(
                        "Sparepart X, Kabel Y"
                    );
                    cy.get('input[name="biaya"]').type("125000");

                    // Submit form (this will trigger SweetAlert confirmation)
                    cy.root().submit();
                });

            // SweetAlert: klik tombol konfirmasi
            cy.get(".swal2-confirm", { timeout: 10000 })
                .should("be.visible")
                .click();

            // Tunggu POST selesai
            cy.wait("@postSelesai")
                .its("response.statusCode")
                .should("be.oneOf", [200]);

            // Setelah selesai, DataTable akan reload. Tunggu sedikit lalu cek laporan berubah jadi 'selesai'
            cy.wait("@getListKelola");

            // Cari ulang baris dengan laporanId dan pastikan status = Selesai
            cy.get("#table_laporan tbody tr").then(($rows2) => {
                const rows2 = Array.from($rows2);
                const found = rows2.find(
                    (r) =>
                        r.querySelectorAll("td")[1].innerText.trim() ===
                        laporanId
                );
                expect(
                    found,
                    `Laporan dengan ID ${laporanId} harus ada setelah submit`
                ).to.exist;
                const newStatus = found
                    .querySelectorAll("td")[4]
                    .innerText.trim()
                    .toLowerCase();
                expect(newStatus).to.equal("selesai");
            });
        });
    });
});
