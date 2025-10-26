// cypress/e2e/auth/login.cy.js
describe('Halaman Login', () => {
  it('Harus bisa diakses dan menampilkan form login', () => {
    // Kunjungi halaman login (uses baseUrl from config)
    cy.visit('/login'); 

    // Verifikasi elemen form ada (Use correct selectors!)
    cy.get('#username', { timeout: 10000 }).should('be.visible'); // Increased timeout example
    cy.get('#password').should('be.visible');
    cy.get('button[type="submit"]').should('be.visible');
    cy.contains('Login').should('be.visible'); // Check for text "Login"
  });
});