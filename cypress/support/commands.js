// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add('loginUI', (username = 'mahasiswa', password = 'mahasiswa') => {
  cy.visit('/login');

  // Intercept request login AJAX
  cy.intercept('POST', '/login').as('postLogin');

  cy.get('[data-cy="login-username-input"], #username, input[name="username"]').should('be.visible').type(username);
  cy.get('[data-cy="login-password-input"], #password, input[name="password"]').should('be.visible').type(password);
  cy.get('[data-cy="login-submit-btn"], button[type="submit"]').should('be.enabled').click();

  // Tunggu response login
  cy.wait('@postLogin').its('response.statusCode').should('be.oneOf', [200]);

  // Laravel JS akan redirect via window.location = response.redirect
  // Pastikan benar-benar pindah ke dashboard
  cy.location('pathname', { timeout: 10000 }).should('eq', '/');

  // Verifikasi greeting (fallback longgar)
  cy.contains(/Halo,\s*Mahasiswa1/i).should('be.visible');
});
