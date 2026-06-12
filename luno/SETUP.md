# LUNO 側の準備（Next.js starter 用）

このドキュメントは [README.md](../README.md) の **① LUNO でフォームセットを用意する** の補足です。

## blueprint.json について

`blueprint.json` は **リポジトリ内の参考ファイル** です。

- 管理画面に JSON をアップロードする UI は **ない**
- 同等の操作 → 管理画面 **フォームを作成** → テンプレート **「ブログ」**
- 開発者向け → `hcms form apply --blueprint luno/blueprint.json`

---

## パターン A: 既存フォームを使う

1. サイドバー → 対象フォーム → 記事一覧
2. ⋮ → **フォーム定義** → **スラッグ** を控える
3. 公開記事が 1 件以上あることを確認
4. `.env.local`:

```bash
LUNO_FORM_SET_SLUG=<控えた slug>
```

### フィールド構成の確認

starter がそのまま表示できるのは、おおむね次のフィールドがある場合です。

- `title`（タイトル）
- `body`（本文）
- （任意）`thumbnail`, `excerpt`, `category`, `tags`, `published_at`

「お客様の声」テンプレート（`quote`, `speaker_name` 等）のように構成が違う場合は、Next.js 側の `src/lib/snapshot.ts` を編集するか、ブログテンプレートで作り直してください。

---

## パターン B: 新規作成（ブログ型）

1. **フォームを作成** → **テンプレート** → **ブログ**
2. モーダル:

| 項目 | 例 |
|------|-----|
| フォームセット名 | `社内報` |
| スラッグ | `internal-news` |

3. **作成** → 記事を **公開**
4. `.env.local`:

```bash
LUNO_FORM_SET_SLUG=internal-news
```

スラッグは `blog` である必要はありません。作成時に自由に変更できます。

---

## 公開 API キー

**設定 → 公開 API キー** で `luno_pub_…` を発行。

または **記事一覧 → </> 埋め込みコード → SDK** から `.env` をコピー。

---

## slug と URL パス

| 種類 | 例 | 設定場所 |
|------|-----|----------|
| LUNO slug | `internal-news` | `LUNO_FORM_SET_SLUG` |
| サイト URL | `/blog` | `src/app/blog/`（任意でリネーム可） |

この 2 つは **連動しません**。
