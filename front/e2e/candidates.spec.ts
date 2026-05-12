import { test, expect, Page } from "@playwright/test";

async function login(page: Page) {
  await page.goto("/");
  await page.fill("#email", "admin@mail.com");
  await page.fill("#password", "admin");
  await page.click('button[type="submit"]');
  await page.waitForURL("**/candidates");
}


test.describe("Scénario complet candidat", () => {
  
  test("connexion → création → validation → suppression", async ({ page }) => {

    // 1. CONNEXION
    await login(page);
    await expect(page.getByRole("heading", { name: "Liste des candidats" })).toBeVisible();



    // 2. CRÉATION
    await page.getByRole("link", { name: "Créer un candidat" }).click();
    await page.waitForURL("**/candidate/new");
    await expect(page.getByRole("heading", { name: "Créer un candidat" })).toBeVisible();

    await page.fill("#firstName", "Jean");
    await page.fill("#lastName", "Dupont");
    await page.fill("#email", `jean.dupont.${Date.now()}@mail.com`); 
    await page.fill("#phone", "0600000000");
    await page.click('button[type="submit"]');

    await page.waitForURL("**/candidate/**");
    await expect(page.getByRole("heading", { name: "Jean Dupont" })).toBeVisible();
    await expect(page.getByText("pending")).toBeVisible();



    // 3. VALIDATION
    await page.getByRole("button", { name: "Valider" }).click();

    await expect(page.getByText("✓ Candidat validé")).toBeVisible();
    await expect(page.getByText("validated")).toBeVisible();



    // 4. SUPPRESSION
    await Promise.all([
      page.waitForEvent("dialog").then(d => d.accept()),
      page.getByRole("button", { name: "Supprimer" }).click()
    ]);

    await page.waitForURL("**/candidates");
    await expect(page.getByRole("heading", { name: "Liste des candidats" })).toBeVisible();

    await expect(page.getByText("Jean Dupont")).not.toBeVisible();
  });




  // ─── Cas d'erreur ─────────────────────────────────────────────────────────

  test("login avec mauvais identifiants affiche une erreur", async ({ page }) => {
    await page.goto("/");
    await page.fill("#email", "wrong@mail.com");
    await page.fill("#password", "wrongpassword");
    await page.click('button[type="submit"]');
    await expect(page.getByRole("alert")).toBeVisible();
    await expect(page.getByRole("alert")).toContainText("Identifiants invalides");
  });

  test("création avec champs vides affiche les erreurs de validation", async ({ page }) => {
    await login(page);
    await page.getByRole("link", { name: "Créer un candidat" }).click();
    await page.click('button[type="submit"]');
    await expect(page.getByText("Le prénom est requis")).toBeVisible();
    await expect(page.getByText("Le nom est requis")).toBeVisible();
    await expect(page.getByText("L'email est requis")).toBeVisible();
    await expect(page.getByText("Le téléphone est requis")).toBeVisible();
  });
});