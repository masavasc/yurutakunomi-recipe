# ゆる宅飲み レシピ検索

GitHub Pages向けの静的Webアプリです。サーバーやデータベースは不要です。

## 公開手順
1. GitHubで新しいリポジトリを作成します（例: `yurutakunomi-recipe`）。
2. このフォルダ内のファイルをすべてリポジトリ直下へアップロードします。
3. GitHubの **Settings → Pages** を開きます。
4. **Build and deployment → Source** を `Deploy from a branch` にします。
5. Branchを `main`、Folderを `/(root)` にして **Save**。
6. 数分後に表示されるGitHub PagesのURLをiPhone/iPadで開きます。
7. Safariの共有ボタン → **ホーム画面に追加** でアプリ風に起動できます。

## ファイル
- `index.html` — 画面
- `style.css` — Glide版を参考にしたスマホUI
- `app.js` — 大分類・料理タイプ・食材・キーワード検索
- `recipes.js` — 279件のレシピデータ
- `manifest.webmanifest` — ホーム画面追加/PWA用設定

## 検索仕様
- 大分類：チップを1回タップで選択、同じチップを再タップで解除
- 料理タイプ：同様
- 食材：部分一致
- 下段検索：料理名・分類・食材・検索テキストを横断検索
- 条件はAND検索
- レシピをタップすると公式レシピURLを新しいタブで開きます
