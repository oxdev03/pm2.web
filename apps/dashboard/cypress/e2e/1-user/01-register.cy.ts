/// <reference types="cypress" />

describe("pm2.web register", () => {
  beforeEach(() => {
    cy.task("clearDB");
    cy.visit("/");
  });

  const user = "example";
  const email = "mail@example.com";
  const password = "P@ssw0rd";

  it("Email / Password Input should be visible", () => {
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).should("have.attr", "placeholder", "Your name");
    cy.get(`input[name="email"]`).should("have.attr", "placeholder", email);
    cy.get(`input[name="password"]`).should("have.attr", "placeholder", "Your password");
  });

  it("Valid Registration without accepting TOC", () => {
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).type(user);
    cy.get(`input[name="email"]`).type(email);
    cy.get(`input[name="password"]`).type(password);
    cy.get("form").submit();
    cy.get(".mantine-Checkbox-error").should("have.text", "You need to accept terms and conditions");
  });

  it("Valid Registration with accepting TOC", () => {
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).type("example");
    cy.get(`input[name="email"]`).type(email);
    cy.get(`input[name="password"]`).type(password);
    cy.get(`input[type="checkbox"]`).click();
    cy.get("form").submit();
    cy.url().should("eq", "http://localhost:3000/");
  });

  it("Should not be able to register twice", () => {
    cy.task("createUser", {
      name: "example",
      email: email,
      password: password,
    });
    cy.get(`button:contains("Don't have an account? Register")`).click();
    cy.get(`input[name="name"]`).type("example");
    cy.get(`input[name="email"]`).type(email);
    cy.get(`input[name="password"]`).type(password);
    cy.get(`input[type="checkbox"]`).click();
    cy.get("form").submit();
    cy.url().should("not.eq", "http://localhost:3000/");
    cy.get(".mantine-Alert-message").should(
      "have.text",
      "An account with the same email address already exists. Please sign in instead.",
    );
  });
});
