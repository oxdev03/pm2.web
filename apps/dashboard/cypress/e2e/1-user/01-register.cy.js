/// <reference types="cypress" />

describe("pm2.web register", () => {
  beforeEach(() => {
    cy.visit("http://localhost:3000");
  });

  it("Email / Password Input should be visible", () => {
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).should("have.attr", "placeholder", "Your name");
    cy.get(`input[name="email"]`).should("have.attr", "placeholder", "mail@example.com");
    cy.get(`input[name="password"]`).should("have.attr", "placeholder", "Your password");
  });

  it("Valid Registration without accepting TOC", () => {
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).type("example");
    cy.get(`input[name="email"]`).type("mail@example.com");
    cy.get(`input[name="password"]`).type("mail@example.com");
    cy.get("form").submit();
    cy.get(".mantine-Checkbox-error").should("have.text", "You need to accept terms and conditions");
  });

  it("Valid Registration with accepting TOC", () => {
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).type("example");
    cy.get(`input[name="email"]`).type("mail@example.com");
    cy.get(`input[name="password"]`).type("mail@example.com");
    cy.get(`input[type="checkbox"]`).click();
    cy.get("form").submit();
    cy.url().should("eq", "http://localhost:3000/");
  });

  it("Should not be able to register twice", () => {
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).type("example");
    cy.get(`input[name="email"]`).type("mail@example.com");
    cy.get(`input[name="password"]`).type("mail@example.com");
    cy.get(`input[type="checkbox"]`).click();
    cy.get("form").submit();
    cy.url().should("not.eq", "http://localhost:3000/");
    cy.get(".mantine-Alert-message").should("have.text", "An account with the same email address already exists. Please sign in instead.");
  });
});
