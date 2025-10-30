/**
 * E2E tests: Daftar Umpan Balik (untuk teknisi)
 */

describe("Fitur Daftar Umpan Balik - Teknisi", () => {
    const URL = "/feedback/list";
    const USER = "teknisi1";
    const PASS = "teknisi1";

    beforeEach(() => {
        cy.task("resetDatabase");
        cy.loginUI(USER, PASS);
        cy.visit(URL);
        cy.url().should("include", URL);
    });

    it("TC_TEKNISI_FB_001 - Menampilkan tabel umpan balik dengan minimal 1 baris", () => {
        cy.get("table").should("be.visible");
        cy.get("table tbody")
            .find("tr")
            .then(($rows) => {
                // jika ada pesan "Tidak ada umpan balik" maka row count = 1 but contains message
                const text = $rows.text().toLowerCase();
                if (text.includes("tidak ada umpan balik")) {
                    throw new Error(
                        "Seeder tidak menyediakan data feedback; pastikan FeedbackSeeder berjalan"
                    );
                }
                expect($rows.length).to.be.greaterThan(0);
            });
    });

    it("TC_TEKNISI_FB_002 - Menampilkan umpan balik yang dibuat untuk teknisi1", () => {
        // Cek ada komentar dummy dari FeedbackSeeder yang menyebut 'teknisi1'
        cy.contains(/umpan balik dummy untuk teknisi1/i).should("exist");
    });
});
