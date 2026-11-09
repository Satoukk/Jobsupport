import { test, expect } from "@playwright/test";
test("登録から就活管理・育成・再ログインまで", async ({ page }, testInfo) => {
  test.setTimeout(90000);
  const failures: string[] = [];
  page.on("pageerror", (e) => failures.push(e.message));
  await page.goto("/Register");
  await page.getByLabel("お名前").fill("サポ太郎");
  const email = `browser-${Date.now()}@example.com`;
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill("testpass123");
  await page.getByRole("button", { name: "無料で始める" }).click();
  await expect(
    page.getByRole("heading", { name: "今日も一歩ずつ" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: true,
  });
  await page.getByRole("link", { name: "▤ 企業・選考" }).click();
  await page.getByRole("button", { name: "企業を登録" }).click();
  await page.getByLabel("企業名", { exact: true }).fill("サポテック株式会社");
  await page.getByLabel("業界", { exact: true }).fill("IT・ソフトウェア");
  await page.getByLabel("選考状況", { exact: true }).selectOption("applying");
  await page
    .getByLabel("メモ", { exact: true })
    .fill("自分らしさを大切にする会社。面接ではチーム開発を伝える。");
  await page.getByRole("button", { name: "保存する", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "サポテック株式会社" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "編集", exact: true }).click();
  await page.getByLabel("選考状況", { exact: true }).selectOption("offer");
  await page.getByLabel("メモ", { exact: true }).fill("");
  await page.getByRole("button", { name: "保存する", exact: true }).click();
  await expect(page.getByText("メモはまだありません。")).toBeVisible();
  await page.getByLabel("企業を検索").fill("該当しない");
  await expect(
    page.getByText("検索条件に合う企業がありません。"),
  ).toBeVisible();
  await page.getByLabel("企業を検索").fill("サポ");
  await expect(
    page.getByRole("heading", { name: "サポテック株式会社" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "✧ ミッション", exact: true }).click();
  await page.getByLabel("新しいミッション").fill("ブラウザーで動作確認をする");
  await page.getByRole("button", { name: "追加する" }).click();
  await page
    .getByRole("button", {
      name: "ブラウザーで動作確認をするを達成",
      exact: true,
    })
    .click();
  await expect(page.getByText("ミッション達成！ +25 EXP")).toBeVisible();
  await page.getByRole("link", { name: "◷ スケジュール" }).click();
  await page.getByRole("button", { name: "予定を追加" }).click();
  await page.getByLabel("予定名").fill("サポテック 最終面接");
  await page.getByLabel("日時", { exact: true }).fill("2026-12-12T14:00");
  await page.getByLabel("メモ", { exact: true }).fill("ポートフォリオを持参");
  await page.getByRole("button", { name: "保存する", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "サポテック 最終面接" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "編集", exact: true }).click();
  await page.getByLabel("予定名").fill("サポテック 面談");
  await page.getByRole("button", { name: "保存する", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "サポテック 面談" }),
  ).toBeVisible();
  await page.getByRole("link", { name: "☘ アカウント" }).click();
  await page.getByLabel("相棒の名前").fill("そら");
  await page.getByRole("button", { name: "名前を保存" }).click();
  await expect(page.getByText("相棒の名前を変更しました")).toBeVisible();
  await page.getByRole("link", { name: "⌂ ホーム" }).click();
  await expect(
    page.getByRole("heading", { name: "そらと、未来を育てよう。" }),
  ).toBeVisible();
  await page.screenshot({
    path: testInfo.outputPath("dashboard.png"),
    fullPage: true,
  });
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "そらと、未来を育てよう。" }),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({
    path: testInfo.outputPath("mobile.png"),
    fullPage: true,
  });
  for (const nav of [
    "▤ 企業・選考",
    "✧ ミッション",
    "◷ スケジュール",
    "☘ アカウント",
    "⌂ ホーム",
  ]) {
    await page.getByRole("link", { name: nav, exact: true }).click();
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth,
    );
    if (overflow) throw Error(`Horizontal overflow on ${nav}`);
  }
  await page.getByRole("link", { name: "☘ アカウント" }).click();
  await page.getByRole("button", { name: "ログアウト", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "おかえりなさい。" }),
  ).toBeVisible();
  await page.getByLabel("メールアドレス").fill(email);
  await page.getByLabel("パスワード").fill("wrongpassword");
  await page.getByRole("button", { name: "ログイン", exact: false }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByLabel("パスワード").fill("testpass123");
  await page.getByRole("button", { name: "ログイン", exact: false }).click();
  await expect(
    page.getByRole("heading", { name: "そらと、未来を育てよう。" }),
  ).toBeVisible();
  page.on("dialog", (dialog) => dialog.accept());
  await page.getByRole("link", { name: "◷ スケジュール" }).click();
  await page.getByRole("button", { name: "削除", exact: true }).click();
  await expect(
    page.getByText("予定はまだありません。次の一歩を登録しよう。"),
  ).toBeVisible();
  await page.getByRole("link", { name: "▤ 企業・選考" }).click();
  await page.getByRole("button", { name: "削除", exact: true }).click();
  await expect(
    page.getByText("気になる企業を1社、登録してみよう。"),
  ).toBeVisible();
  if (failures.length) throw Error(failures.join("\n"));
  console.log(
    "PASS: registration, company CRUD/search/status, missions/EXP, schedule CRUD, rename, reload persistence, logout/login, mobile overflow, no browser errors",
  );
});
