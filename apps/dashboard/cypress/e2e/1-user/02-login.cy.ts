/// <reference types="cypress" />

describe("pm2.web login", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("Email / Password Input should be visible", () => {
    cy.get(`input[name="email"]`).should("have.attr", "placeholder", "mail@example.com");
    cy.get(`input[name="password"]`).should("have.attr", "placeholder", "Your password");
  });

  it("Valid Credentials", () => {
    cy.get(`input[name="email"]`).type("mail@example.com");
    cy.get(`input[name="password"]`).type("mail@example.com");
    cy.get("form").submit();
    cy.url().should("eq", "http://localhost:3000/");
  });

  it("Invalid Credentials", () => {
    cy.get(`input[name="email"]`).type("mail@example.com");
    cy.get(`input[name="password"]`).type("INVALID");
    cy.get("form").submit();
    cy.url().should("not.eq", "http://localhost:3000/");
    cy.get(".mantine-Alert-message").should("have.text", "The password you entered is incorrect. Please try again.");
  });
});
