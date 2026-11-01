import { test, expect } from '@playwright/test';

async function saved(page) { return page.evaluate(() => JSON.parse(localStorage.getItem('mission-malice.v1'))); }
async function addPlayer(page, name, kind = 'Fille') {
  await page.getByRole('button', { name: /Ajouter un joueur/ }).click();
  await page.getByLabel('Ton prénom').fill(name);
  await page.getByRole('radio', { name: new RegExp(`${kind}$`) }).check();
  await page.getByRole('button', { name: /Ajouter à la bande/ }).click();
}
async function enterPin(page, pin) {
  await page.getByLabel('Ton code secret').fill(pin);
  await page.getByRole('button', { name: 'Ouvrir' }).click();
}

test('parcours familial complet : avatars, code, distribution, audio, transmission, victoire et remise à zéro', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /jouez les malins/ })).toBeVisible();
  await addPlayer(page, 'Mamie', 'Femme');
  await addPlayer(page, 'Lou', 'Fille');
  await addPlayer(page, 'Papa', 'Homme');
  await expect(page.locator('.player-card')).toHaveCount(3);
  await page.screenshot({ path: 'test-results/mission-malice-mobile.png', fullPage: true });
  await page.getByRole('button', { name: /Distribuer les missions/ }).click();
  await page.getByLabel('Choisis un code').fill('2468');
  await page.getByLabel('Encore une fois').fill('2468');
  await page.getByRole('button', { name: 'Enregistrer le code' }).click();
  await page.getByRole('button', { name: /C’est parti/ }).click();
  for (let i = 0; i < 3; i++) {
    await expect(page.locator('.cover-surface h1')).toHaveText(['Mamie', 'Lou', 'Papa'][i]);
    await expect(page.locator('.mission-instruction')).toHaveCount(0);
    await page.locator('.cover-surface').click();
    await expect(page.locator('.mission-instruction')).toBeVisible();
    await page.getByRole('button', { name: 'Écouter ma mission' }).click();
    await expect(page.locator('.mission-instruction')).toBeVisible();
    expect((await saved(page)).distributionIndex).toBe(i);
    if (i === 0) {
      await page.reload();
      await expect(page.locator('.cover-surface h1')).toHaveText('Mamie');
      await expect(page.locator('.mission-instruction')).toHaveCount(0);
      await page.locator('.cover-surface').click();
    }
    await page.locator('.mission-instruction').click();
  }
  expect((await saved(page)).phase).toBe('playing');
  await page.getByRole('button', { name: /Coin des grands/ }).click();
  await enterPin(page, '0000');
  await expect(page.getByRole('alert')).toContainText('pas le bon code');
  await enterPin(page, '2468');
  await expect(page.locator('.admin-mission')).toHaveCount(3);
  await page.getByRole('button', { name: /Fermer 🔒/ }).click();
  let before = await saved(page);
  const actor = before.players[0];
  const victimId = before.assignments[actor.id].targetId;
  const inherited = before.assignments[victimId];
  await page.getByRole('button', { name: new RegExp(`${actor.name}.*Revoir ma mission`) }).click();
  await page.locator('.cover-surface').click();
  await page.getByRole('button', { name: /Ma cible a réussi/ }).click();
  await page.getByRole('button', { name: /Oui, on confirme/ }).click();
  expect((await saved(page)).assignments[actor.id]).toEqual(inherited);
  await expect(page.locator('.cover-surface h1')).toHaveText(actor.name);
  await page.locator('.cover-surface').click();
  await page.getByRole('button', { name: /Ma cible a réussi/ }).click();
  await page.getByRole('button', { name: /Oui, on confirme/ }).click();
  expect((await saved(page)).phase).toBe('finished');
  await expect(page.locator('.winner-section')).toContainText(actor.name);
  await page.reload();
  await expect(page.locator('.winner-section')).toBeVisible();
  await page.getByRole('button', { name: /Coin des grands/ }).click();
  await enterPin(page, '2468');
  await page.getByRole('button', { name: 'Tout remettre à zéro' }).click();
  await page.getByRole('button', { name: 'Garder la partie' }).click();
  expect((await saved(page)).phase).toBe('finished');
  await page.getByRole('button', { name: 'Tout remettre à zéro' }).click();
  await page.getByRole('button', { name: 'Oui, tout effacer' }).click();
  await expect(page.locator('.player-card')).toHaveCount(0);
  expect(await saved(page)).toBe(null);
  expect(errors).toEqual([]);
});

test('l’éditeur persiste ses couleurs et affiche les noms comme du texte', async ({ page }) => {
  await page.goto('/');
  await addPlayer(page, '<b>Lou</b>', 'Garçon');
  await expect(page.locator('.player-name')).toHaveText('<b>Lou</b>');
  await expect(page.locator('.player-name b')).toHaveCount(0);
  await page.locator('.player-card').click();
  await page.getByRole('radio', { name: 'Roux', exact: true }).check();
  await page.getByRole('radio', { name: 'Vert', exact: true }).check();
  await page.getByLabel('Sans cheveux').check();
  await page.getByRole('button', { name: 'Enregistrer', exact: true }).click();
  await page.reload();
  const data = await saved(page);
  expect(data.players[0]).toMatchObject({ kind: 'boy', hair: '#b85d36', shirt: '#a1bd91', bald: true });
  await expect(page.locator('.player-name')).toHaveText('<b>Lou</b>');
});

test('les écrans restent utilisables sur mobile et ordinateur', async ({ page }) => {
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
  await addPlayer(page, 'Lou');
  await addPlayer(page, 'Mamie', 'Femme');
  await addPlayer(page, 'Papa', 'Homme');
  await page.screenshot({ path: 'test-results/mission-malice-desktop.png', fullPage: true });
});

test('une sauvegarde invalide reste intacte et peut être réinitialisée avec son code', async ({ page }) => {
  await page.goto('/');
  const broken = JSON.stringify({ version: 1, pin: '2468', players: 'abîmés' });
  await page.evaluate(value => localStorage.setItem('mission-malice.v1', value), broken);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Une petite pause.' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('mission-malice.v1'))).toBe(broken);
  await page.getByRole('button', { name: 'Réinitialiser avec le code' }).click();
  await enterPin(page, '2468');
  await page.getByRole('button', { name: 'Oui, tout effacer' }).click();
  await expect(page.getByRole('heading', { name: /jouez les malins/ })).toBeVisible();
});
