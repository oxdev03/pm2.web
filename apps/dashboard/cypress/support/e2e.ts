// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login");
  cy.get(`input[name="email"]`).type(email, { delay: 0 });
  cy.get(`input[name="password"]`).type(password, { delay: 0 });
  cy.get("form").submit();
  cy.url().should("eq", "http://localhost:3000/");
});
