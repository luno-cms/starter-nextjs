# LUNO starter — Next.js 15 (App Router)

LUNO の記事 API を Next.js から読み込み、一覧（`/blog`）・詳細（`/blog/[slug]`）・Webhook キャッシュ更新（`/api/revalidate`）を行う最小構成です。

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fluno-cms%2Fstarter-nextjs)

---

## 事前に知っておくこと

| 用語 | 意味 | 例 |
|------|------|-----|
| **フォームセット slug** | LUNO 内のコンテンツ種別 ID。`.env` の `LUNO_FORM_SET_SLUG` と **同じ文字列** | `blog`, `magazine`, `announcements` |
| **サイトの URL `/blog`** | この Next.js アプリの **ページ URL**。LUNO の slug とは **別物** | `/blog`, `/news` |
| **`luno/blueprint.json`** | starter が想定するフィールド構成の **参考 JSON** | タイトル・本文・サムネ等 |

> **よくある誤解:** 管理画面に「blueprint.json をアップロードしてインポート」する機能は **ありません**。下記の管理画面操作（テンプレートから作成）が同等です。

---

## セットアップ全体像

```
① LUNO でフォームセット + 公開記事を用意
② 公開 API キーを発行
③ .env.local を設定（管理画面からコピー可）
④ npm install && npm run dev
⑤ （本番のみ）Webhook を設定
```

---

## ① LUNO でフォームセットを用意する

**どちらか一方** を選んでください。

### パターン A — すでに LUNO にフォームがある

「お知らせ」「マガジン」など、**すでに記事を管理している** 場合。

1. [LUNO 管理画面](https://luno.app) にログインし、ヘッダーで **対象プロジェクト** を選ぶ
2. 左サイドバーから **対象フォーム**（例: お知らせ）をクリック → 記事一覧が開く
3. **slug（スラッグ）を確認する**
   - 記事一覧右上の **⋮ メニュー** → **フォーム定義** を開く  
   - 「**スラッグ（システム用ID）**」欄の値を控える（例: `announcements`, `magazine`）
4. 記事が **1 件以上「公開」** されていることを確認（下書きのみだとサイトに表示されません）
5. 手順 ③ で `.env` に `LUNO_FORM_SET_SLUG=<控えた slug>` を設定

slug が `blog` である必要は **ありません**。

#### フィールド構成について（重要）

この starter は **`title` / `body` / `thumbnail` などブログ型フィールド** を前提に表示しています。

| フォームの作り方 | starter との相性 |
|------------------|------------------|
| テンプレート **「ブログ」** で作成（slug は任意） | ◎ そのまま使える |
| テンプレート **「お知らせ」** 等（`title` + `body` あり） | ○ おおむね動く |
| テンプレート **「お客様の声」** 等（フィールド構成が異なる） | △ 一覧は出るがタイトル等が `Untitled` になる。**ページのコード修正が必要** |

フィールド構成が大きく違う場合は、**テンプレート「ブログ」で新規作成**するか、`src/lib/snapshot.ts` を編集してください（[blog 以外の slug / 用途](#blog-以外の-slug--用途) 参照）。

---

### パターン B — これから LUNO にフォームを作る

1. 管理画面にログイン → ヘッダーで **プロジェクト** を選択
2. 左サイドバー **「フォームを作成」** をクリック  
   （初回ログイン時は **ウェルカム画面** からテンプレートを選んでも同じです）
3. 作成方法 **「テンプレート」** → **「ブログ」** カードを選ぶ  
   - `luno/blueprint.json` と **同じフィールド構成** になります
4. モーダルで入力:

   | 項目 | 入力例 | 説明 |
   |------|--------|------|
   | **フォームセット名** | `マガジン` | 管理画面での表示名（任意） |
   | **スラッグ** | `magazine` | API 用 ID。**`blog` 固定ではない** |

5. **「作成」** を押す → 記事一覧へ遷移
6. **＋（新規記事）** から記事を作成  
   - タイトル・スラッグ・本文などを入力  
   - ステータスを **「公開」** にして保存
7. 手順 ③ で `LUNO_FORM_SET_SLUG=magazine`（手順 4 のスラッグ）を設定

---

## ② 公開 API キーを発行する

1. 管理画面 → **設定** → **公開 API キー**  
   （URL: `/settings/public-api-keys`）
2. **キーを発行** → `luno_pub_…` 形式の文字列を控える

---

## ③ Next.js 側の環境変数

### おすすめ: 管理画面から `.env` をコピー

1. 記事一覧画面右上の **</>（埋め込みコード）** アイコンをクリック  
   または **記事の公開** ページ（`/publish?formSetId=…`）を開く
2. **「SDK」** セクションを表示
3. **公開 API キー** をプルダウンから選択
4. 表示された `.env` ブロックをコピー

### ローカルに設定

```bash
git clone https://github.com/luno-cms/starter-nextjs.git
cd starter-nextjs
cp .env.example .env.local
```

`.env.local` の例（**お知らせ slug の場合**）:

```bash
# LUNO API の URL（末尾スラッシュなし）
LUNO_API_URL=https://your-tenant.luno.app

# 手順 ② で発行したキー
LUNO_PUBLIC_API_KEY=luno_pub_xxxxxxxxxxxxxxxx

# 手順 ① で確認したフォームセット slug（blog でなくて OK）
LUNO_FORM_SET_SLUG=announcements

# Webhook（手順 ⑤・本番のみ。ローカル確認だけなら空で可）
LUNO_REVALIDATE_SECRET=
```

| 変数 | 必須 | 説明 |
|------|------|------|
| `LUNO_API_URL` | ○ | テナントの API URL |
| `LUNO_PUBLIC_API_KEY` | ○ | 公開 API キー（`luno_pub_…`） |
| `LUNO_FORM_SET_SLUG` | △ | 未設定時のみ `blog` にフォールバック。旧名 `LUNO_BLOG_FORM_SET_SLUG` も可 |
| `LUNO_REVALIDATE_SECRET` | 本番のみ | Webhook の signing secret |

---

## ④ 起動して確認

```bash
npm install
npm run dev
```

ブラウザで **http://localhost:3000/blog** を開く。

- 記事一覧が表示されれば成功
- 空の場合 → LUNO 側で **公開済み記事** があるか、`LUNO_FORM_SET_SLUG` が slug と **完全一致** しているかを確認

> `/blog` は **Next.js の URL** です。LUNO の slug が `magazine` でも URL は `/blog` のままで問題ありません（URL を変えたい場合は [blog 以外の slug / 用途](#blog-以外の-slug--用途) 参照）。

---

## ⑤ Webhook（本番デプロイ時）

記事公開時に Next.js のキャッシュを自動更新します。**ローカル開発だけなら省略可**。

1. 管理画面 → **設定** → **Webhook**（`/settings/webhooks`）
2. **Webhook を追加**
   - **URL:** `https://<あなたのサイト>/api/revalidate`
   - **イベント:** `entry.published`（必要なら `entry.updated` / `entry.deleted` も）
3. 作成時に表示される **signing secret** を Vercel 等の `LUNO_REVALIDATE_SECRET` に設定

---

## blog 以外の slug / 用途

### slug だけが `blog` ではない（いちばん多い）

テンプレート「ブログ」で slug を `magazine` にした、既存フォームの slug が `announcements` である、など。

**やること:** `.env` の `LUNO_FORM_SET_SLUG` だけ合わせる。コード変更は **不要**。

```bash
LUNO_FORM_SET_SLUG=magazine
```

### 表示名・用途が「ブログ」ではない

フォームセット名が「お客様の声」「社内報」でも、**フィールドがブログ型なら** そのまま使えます。

### サイトの URL を `/blog` 以外にしたい

LUNO の slug とは **無関係** です。Next.js 側だけ変更します。

```bash
# 例: src/app/blog/ を src/app/news/ にリネーム
mv src/app/blog src/app/news
```

リンク内の `/blog` も合わせて置換してください。

### テンプレート「お客様の声」等、フィールド構成が違うフォームを使う

SDK で記事一覧は取得できますが、starter の `pickTitle()` は `snapshot.title` を参照するため、**タイトルが `Untitled` になる** ことがあります。

対応例:

1. **おすすめ:** テンプレート **「ブログ」** でフォームを作り、表示名だけ「お客様の声」にする
2. **既存フォームを使う:** `src/lib/snapshot.ts` で参照フィールドを変更（例: `speaker_name`）

```ts
// src/lib/snapshot.ts の例
export function pickTitle(snapshot: Record<string, unknown> | undefined): string {
  const t = snapshot?.title ?? snapshot?.speaker_name;
  if (typeof t === "string" && t.trim()) return t.trim();
  return "Untitled";
}
```

---

## Vercel デプロイ

Deploy ボタンからクローン後、**Project Settings → Environment Variables** に `.env.local` と同じ 4 変数を設定してください。

---

## Webhook の手元確認

```bash
export SECRET='your-revalidate-secret'
BODY='{"event":"entry.published","tenant_id":"...","form_set_slug":"magazine","entry_id":"...","entry_slug":"hello","timestamp":"2026-01-01T00:00:00.000Z"}'
SIG=$(printf %s "$BODY" | openssl dgst -sha256 -hmac "$SECRET" -binary | xxd -p -c 256)
curl -sS -X POST "http://localhost:3000/api/revalidate" \
  -H "Content-Type: application/json" \
  -H "X-Luno-Signature: sha256=$SIG" \
  -d "$BODY"
```

`form_set_slug` は `LUNO_FORM_SET_SLUG` と同じ値にしてください。

---

## 参考

- LUNO 側の詳細: [`luno/SETUP.md`](./luno/SETUP.md)
- フィールド構成の参考 JSON: [`luno/blueprint.json`](./luno/blueprint.json)
- CLI で blueprint を適用（開発者向け）: `hcms form apply --blueprint luno/blueprint.json`

## SDK の使い方

```ts
import { LunoClient } from "@luno-cms/sdk";
import { formSetSlug, createLunoServer } from "@/lib/luno";

const luno = createLunoServer({ tags: ["blog-list"], revalidateSeconds: 60 });
const { items, total } = await luno.entries.list(formSetSlug, { page: 1, limit: 10 });
```

`formSetSlug` は `LUNO_FORM_SET_SLUG`（または旧 `LUNO_BLOG_FORM_SET_SLUG`）を読み取ります。
