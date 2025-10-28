/**
 * @file cypress/e2e/laporan/list_laporan_filter.cy.js
 * @description Rangkaian tes E2E untuk fungsionalitas filter status
 * pada tabel DataTables (server-side) di halaman daftar laporan.
 */
describe('Fitur Filter Daftar Laporan Kerusakan', () => {
  const LIST_URL_GLOB = '**/laporan/list**';
  const ALIAS_LIST = 'getList';

  /**
   * Mengambil jumlah kolom <th> di header tabel.
   * Digunakan untuk menyaring baris data valid dari baris placeholder DataTables.
   * @returns {Cypress.Chainable<number>}
   */
  const getHeaderColCount = () =>
    cy.get('#laporan-table thead th').its('length');

  /**
   * Menunggu request AJAX DataTables (yang dialias) selesai.
   * Secara opsional juga memverifikasi query parameter 'status' pada URL request.
   * @param {string|null} expectedStatusParam - Nilai yang diharapkan untuk query param 'status'.
   * @returns {Cypress.Chainable}
   */
  const waitTableReload = (expectedStatusParam = null) => {
    return cy.wait(`@${ALIAS_LIST}`, { timeout: 20000 }).then((inter) => {
      expect([200, 304]).to.include(inter.response?.statusCode);

      if (expectedStatusParam !== null) {
        expect(inter.request.url).to.match(
          new RegExp(`[?&]status=${expectedStatusParam}(?:&|$)`)
        );
      }
    }).then(() => {
      cy.get('#laporan-table tbody', { timeout: 10000 }).should('be.visible');
    });
  };

  /**
   * Mengambil elemen <tr> yang berisi data valid dari tbody.
   * Ini memfilter baris "Loading..." atau "No data..." dari DataTables
   * dengan cara membandingkan jumlah <td> dengan jumlah <th>.
   * @returns {Cypress.Chainable<JQuery<HTMLTableRowElement>>}
   */
  const getDataRows = () => {
    return getHeaderColCount().then(colCount => {
      return cy.get('#laporan-table tbody tr').then(($rows) => {
        const valid = [...$rows].filter(r => Cypress.$(r).find('td').length === colCount);
        return Cypress.$(valid);
      });
    });
  };

  /**
   * Memverifikasi semua baris data yang terlihat di tabel memiliki status
   * yang cocok dengan matcher (string atau Regex).
   * Kolom status diasumsikan berada di indeks 3 (kolom ke-4).
   * @param {string|RegExp} matcher - Teks/Regex yang diharapkan.
   */
  const assertAllRowsStatus = (matcher) => {
    getDataRows().then($rows => {
      // Guard clause: Gagal jika filter menghasilkan 0 baris data valid.
      expect(
        $rows.length,
        'Tidak ada baris data setelah filter. Cek mapping status UI ↔ backend (misal: proses vs diproses).'
      ).to.be.greaterThan(0);

      $rows.each((_, row) => {
        // Asumsi kolom 'Status' adalah kolom ke-4 (index 3)
        const txt = Cypress.$(row).find('td').eq(3).text().trim();
        if (typeof matcher === 'string') {
          expect(txt.toLowerCase()).to.eq(matcher.toLowerCase());
        } else {
          expect(txt).to.match(matcher);
        }
      });
    });
  };

  /**
   * Fallback untuk memaksa DataTables reload via API jQuery.
   * Berguna jika state awal tabel kosong secara tidak terduga.
   */
  const forceReloadDataTables = () => {
    cy.window().then(win => {
      const $ = win.jQuery;
      const dt = $('#laporan-table').DataTable?.();
      if (dt?.ajax?.reload) dt.ajax.reload(null, false);
    });
  };

  /**
   * Menyiapkan kondisi sebelum setiap tes:
   * 1. Reset database.
   * 2. Login via session (atau UI) sebagai 'mahasiswa'.
   * 3. Pasang interceptor (spy) untuk request AJAX DataTables.
   * 4. Kunjungi halaman /laporan dan tunggu tabel terisi.
   * 5. (Fallback) Paksa reload jika tabel kosong saat inisialisasi.
   */
  beforeEach(() => {
    cy.task('resetDatabase');

    if (Cypress.session) {
      cy.session('login-mahasiswa', () => {
        cy.loginUI('mahasiswa', 'mahasiswa');
      });
    } else {
      cy.loginUI('mahasiswa', 'mahasiswa');
    }

    // Definisikan intercept SEKALI di sini.
    // Ini akan menangkap SEMUA request yang cocok selama tes.
    cy.intercept('GET', LIST_URL_GLOB).as(ALIAS_LIST);

    cy.visit('/laporan');
    waitTableReload(); // Menunggu load awal halaman

    // Fallback jika load awal gagal menampilkan data
    getDataRows().then($rows => {
      if ($rows.length === 0) {
        forceReloadDataTables();
        waitTableReload();
      }
    });
  });

  /**
   * Tes skenario filter: Status "Pending".
   */
  it('Memfilter: hanya menampilkan status "Pending"', () => {
    cy.get('select#status, [data-cy="filter-status"]').select('pending');
    waitTableReload('pending');
    assertAllRowsStatus('pending');
  });

  /**
   * Tes skenario filter: Status "Proses/Diproses".
   * Memeriksa value 'diproses' di UI dan mencocokkan teks 'Proses' atau 'Diproses' di tabel.
   */
  it('Memfilter: hanya menampilkan status "Proses/Diproses"', () => {
    cy.get('select#status, [data-cy="filter-status"]').select('diproses'); // Value di <option>
    waitTableReload('diproses');

    // Teks di <td> bisa 'Proses' atau 'Diproses', tangani dengan Regex
    assertAllRowsStatus(/^(Proses|Diproses)$/i);
  });

  /**
   * Tes skenario filter: Status "Selesai".
   */
  it('Memfilter: hanya menampilkan status "Selesai"', () => {
    cy.get('select#status, [data-cy="filter-status"]').select('selesai');
    waitTableReload('selesai');
    assertAllRowsStatus('selesai');
  });

  /**
   * Tes skenario filter: Mengembalikan ke "Semua Status".
   * Memastikan data (lebih dari 0) muncul kembali.
   */
  it('Mengembalikan semua data saat memilih "Semua Status"', () => {
    // Terapkan filter dulu untuk memastikan perubahan
    cy.get('select#status, [data-cy="filter-status"]').select('pending');
    waitTableReload('pending');
    assertAllRowsStatus('pending');

    // Kembali ke semua (value kosong)
    cy.get('select#status, [data-cy="filter-status"]').select('');

    // Cukup tunggu request selesai, tidak perlu cek query param
    cy.wait(`@${ALIAS_LIST}`, { timeout: 20000 })
      .its('response.statusCode').should('be.oneOf', [200, 304]);

    // Verifikasi bahwa tabel kembali terisi data
    getDataRows().then($rows => {
      expect($rows.length).to.be.greaterThan(0);
    });
  });
});
