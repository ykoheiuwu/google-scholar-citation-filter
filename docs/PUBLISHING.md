# Publishing / 公開用メモ

## English

### Current release: 0.1.3

- `dist/scholar-citation-filter-firefox-0.1.3.xpi`: the Mozilla-signed Firefox installer, with Japanese/English language matching. The downloaded file was copied without changing its contents, and its code and manifest match `extension/`.
- `dist/scholar-citation-filter-chrome.zip` and `dist/chrome/`: the Chrome 0.1.3 package and unpacked folder.
- `dist/scholar-citation-filter-firefox-unsigned.zip`: the 0.1.3 signing input, kept for development. Users should install the signed `.xpi` instead.

The README download links point to the current Firefox and Chrome packages. Firefox signing for this release is complete; no additional signing request is needed to publish these files.

### Upload to GitHub

1. Create a repository, for example `scholar-citation-filter`, or update the existing repository.
2. Upload this folder's **contents** to the repository root, with `README.md`, `LICENSE`, and `extension/` at the top level. GitHub Desktop is also suitable.
3. Check that the README image and download links work.
4. Create a Release tagged `v0.1.3` and attach **`scholar-citation-filter-firefox-0.1.3.xpi`** and **`scholar-citation-filter-chrome.zip`** from `dist/`. The Chrome ZIP is extracted and loaded with **Load unpacked**. The unsigned Firefox ZIP is for signing, so it need not be a user-facing release asset.
5. Use the 0.1.3 changelog entries for the release description and retain the README's installation and accuracy limitations.

### Future updates

1. Edit `extension/`, increment the version in its manifest, update `CHANGELOG.md`, and run `python3 scripts/package.py`.
2. Verify the update in browsers and run tests in the development checkout.
3. In the [Mozilla Developer Hub](https://addons.mozilla.org/developers/), open the existing **Scholar Citation Filter** entry and submit the unsigned ZIP as **a new version of the same add-on**. Keep the add-on ID unchanged.
4. The JavaScript and CSS are readable source, without bundling, minification, templates, or transpilation. The source is included in the ZIP, so a separate pre-build source package is not needed for the current build process.
5. After signing completes, save the returned `.xpi` unchanged in `dist/`, with the new version in the filename. Renaming a file is fine; do not unpack and rebuild a signed archive.
6. Check that the signed package matches the updated source, install it, update both README download links and version descriptions, and replace the previous signed file in the current release directory.

The publisher obtains a Mozilla signature for each Firefox version; users only download and install the signed `.xpi`. The packaging script creates unsigned files and leaves existing signed `.xpi` files untouched. [Mozilla submission and update instructions](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)

The manifest has no self-distribution `update_url`, so users currently install newly signed Firefox releases manually. No GitHub upload or Mozilla submission is performed by this directory or its packaging script.

## 日本語

### 現在のリリース：0.1.3

- `dist/scholar-citation-filter-firefox-0.1.3.xpi`：日本語・英語の表示言語に対応した、Mozilla署名済みFirefox用インストーラーです。取得したファイルの内容を変更せずコピーし、コードとmanifestが `extension/` と一致することを確認しています。
- `dist/scholar-citation-filter-chrome.zip` と `dist/chrome/`：Chrome 0.1.3の配布ZIPと導入用フォルダです。
- `dist/scholar-citation-filter-firefox-unsigned.zip`：開発用に残した0.1.3の署名申請用ZIPです。利用者は署名済み `.xpi` を導入してください。

READMEのダウンロードリンクは現行のFirefox・Chrome配布ファイルを指しています。今回のFirefox版の署名取得は完了しているため、このファイルを公開するための追加申請は不要です。

### GitHubにアップロードする

1. `scholar-citation-filter` などのリポジトリを作成するか、既存のリポジトリを更新します。
2. このフォルダの **中身** をリポジトリのルートへアップロードします。`README.md`、`LICENSE`、`extension/` が最上位に並ぶ構成です。GitHub Desktopも使用できます。
3. READMEの画像とダウンロードリンクを確認します。
4. `v0.1.3` のReleasesを作成し、`dist/` 内の **`scholar-citation-filter-firefox-0.1.3.xpi`** と **`scholar-citation-filter-chrome.zip`** を添付します。Chrome用ZIPは展開して「パッケージ化されていない拡張機能を読み込む」で導入します。署名前Firefox用ZIPは申請用なので、利用者向けのリリース添付には不要です。
5. リリース説明には変更履歴の0.1.3の項目を使い、導入方法や正確性の制約はREADMEに記載した内容を維持します。

### 次回以降の更新

1. `extension/` のソース、manifestのバージョン、`CHANGELOG.md` を修正し、`python3 scripts/package.py` を実行します。
2. ブラウザで更新版を確認し、開発側のテストも実行します。
3. [Mozillaの開発者ページ](https://addons.mozilla.org/developers/)で登録済みの **Scholar Citation Filter** を開き、署名前ZIPを **同じアドオンの新しいバージョン** として提出します。アドオンIDは変更しません。
4. JavaScriptとCSSは読みやすいソースのままで、バンドル、ミニファイ、テンプレート、トランスパイルを使用していません。現在の生成方法ではソースが提出ZIP内に含まれているため、加工前ソースの別途提出は不要です。
5. 署名が完了したら、取得した `.xpi` を内容を変更せず、新しいバージョンを含むファイル名で `dist/` に保存します。ファイル名は変更できますが、署名済みファイルを展開して作り直してはいけません。
6. 署名済みファイルと更新したソースの一致を確認して導入し、READMEの英語・日本語両方のリンクとバージョン説明を更新します。現行配布用フォルダの旧版XPIを新しい版へ置き換えます。

配布者がFirefoxの版ごとに署名を取得し、利用者は署名済み `.xpi` をダウンロードして導入するだけです。パッケージ生成スクリプトは署名前ファイルを生成し、既存の署名済み `.xpi` は変更しません。[Mozillaの申請と更新の手順](https://extensionworkshop.com/documentation/publish/submitting-an-add-on/)

manifestには自己配布用の `update_url` がないため、利用者は現在、新しい署名済みFirefox版を手動で導入します。このフォルダや生成スクリプトがGitHubへの公開やMozillaへの申請を行うことはありません。
