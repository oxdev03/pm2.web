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

  function getUser(idx: number) {
    return {
      name: `example${idx}`,
      email: `mail${idx}@example.com`,
      password: `mail${idx}@example.com`,
      ...userConfig[idx],
    };
  }

  function insertUsers() {
    cy.task("clearDB");
    for (let i = 0; i < userConfig.length; i++) {
      cy.task("createUser", getUser(i));
    }
  }

  context("User List", () => {
    const user = getUser(0);

    before(() => {
      insertUsers();
      cy.login(user.email, user.password);
      cy.visit("/user");
    });

    it("it should have 3 users with name, email, role", () => {
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
  });

  context("Delete User with OWNER Permission", () => {
    const user = getUser(0);

    beforeEach(() => {
      cy.session("Session", () => {
        insertUsers();
        cy.login(user.email, user.password);
      });

      cy.visit("/user");
    });

    after(() => {
      Cypress.session.clearAllSavedSessions();
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

    it("should have at least one owner", () => {
      cy.get(`[data-cy-id="${user.email}"] * > [data-cy="user-item-role"]`).select("ADMIN");
      // should show notification
      cy.get(`.mantine-Notifications-root`).children().contains(`Failed to update role to Admin`);
      cy.get(`.mantine-Notifications-root`).children().contains(`Their needs to be at least one owner.`);
    });

    it("should be possible to update role to OWNER", () => {
      const u = getUser(1);
      cy.get(`[data-cy-id="${u.email}"] * > [data-cy="user-item-role"]`).select("OWNER");
      // should show notification
      cy.get(`.mantine-Notifications-root`).children().contains(`Updated role to Owner`);
      cy.get(`.mantine-Notifications-root`).children().contains(`Updated role successfully`);
    });
  });
});
