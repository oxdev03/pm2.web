/// <reference types="cypress" />

describe("pm2.web user administration", () => {
  const userConfig = [
    {
      admin: true,
      owner: true,
    },
    {
      admin: true,
      owner: false,
    },
    {
      admin: false,
      owner: false,
    },
  ];

  function getUser(idx) {
    return {
      name: `example${idx}`,
      email: `mail${idx}@example.com`,
      password: `mail${idx}@example.com`,
      ...userConfig[idx],
    };
  }

  beforeEach(() => {
    cy.task("clearDB");
    for (let i = 0; i < userConfig.length; i++) {
      cy.task("createUser", getUser(i));
    }
    cy.visit("/");
  });

  it("it should have 3 users with name, email, role", () => {
    const user = getUser(0);
    cy.login(user.email, user.password);
    cy.visit("/user");
    cy.get('[data-cy="user-item-email"]').should("have.length", userConfig.length);

    for (let i = 0; i < userConfig.length; i++) {
      const u = getUser(i);
      const role = u.owner ? "OWNER" : u.admin ? "ADMIN" : "NONE";

      cy.get('[data-cy="user-item-email"]').contains(u.email);
      cy.get('[data-cy="user-item-name"]').contains(u.name);
      cy.get(`[data-cy-id="${u.email}"] * > [data-cy="user-item-select"]`).should(
        `be.${u.admin || u.owner ? "disabled" : "enabled"}`,
      );
      cy.get(`[data-cy-id="${u.email}"] * > [data-cy="user-item-role"]`).should("have.value", role);
    }
  });

  context("Delete User with OWNER Permission", () => {
    const user = getUser(0);

    beforeEach(() => {
      //cy.session("Session", () => {
      cy.login(user.email, user.password);
      //});

      cy.visit("/user");
    });

    it("it should delete user", () => {
      const u = getUser(2);
      cy.get(`[data-cy-id="${u.email}"] * > [data-cy="user-item-delete"]`).click();
      cy.get(`[data-cy-id="${u.email}"]`).should("not.exist");
      // should show notification
      cy.get(`.mantine-Notifications-root`).children().contains(`Deleted User: ${u.name}`);
      cy.get(`.mantine-Notifications-root`).children().contains(`User deleted successfully`);
    });

    it("should not be able to delete owner", () => {
      cy.get(`[data-cy-id="${user.email}"] * > [data-cy="user-item-delete"]`).click();
      cy.get(`[data-cy-id="${user.email}"]`).should("exist");
      // should show notification
      cy.get(`.mantine-Notifications-root`).children().contains(`Failed to delete user: ${user.name}`);
      cy.get(`.mantine-Notifications-root`).children().contains(`Owner cannot be deleted`);
    });
  });
});
