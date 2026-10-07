# Privacy / プライバシー

## English

Scholar Citation Filter reads the researcher profile you are viewing and requests the profile's paper list and excluded papers' detail pages from that same Google Scholar origin. Requests use your browser's existing Scholar session; the extension does not read or export your login credentials. Google receives these ordinary page requests.

The extension uses the `storage` permission to save profile-specific excluded paper IDs and cached annual citation data in the browser's extension-local storage. Cached data is reused for up to 24 hours, or until a paper's total citation count changes. Expired cache entries are pruned when new paper data is saved; expiration does not immediately delete all stored entries. Exclusion settings remain until overwritten or removed with the extension's stored data. Browser handling of temporary Firefox installations may differ.

There is no analytics, telemetry, developer-operated server, external citation API, or API key. The extension does not send exclusion settings or cached data to its developer. It does not request access to unrelated sites, the clipboard, or browser history. The supported Scholar domains are listed in the README and extension manifest.

To include all papers again, select **すべて含める** in the popup. This resets exclusions for that profile but does not clear the cache. Removing the extension normally removes its extension-local stored data.

## 日本語

閲覧中の研究者プロフィールを読み取り、そのプロフィールの論文一覧と除外した論文の詳細ページを、同じGoogle Scholarドメインから取得します。ブラウザの通常のScholarセッションを使用しますが、ログイン情報を読み出したり外部へ取り出したりはしません。Googleには通常のページ取得リクエストが届きます。

`storage` 権限を使い、プロフィールごとの除外論文IDと年別引用データのキャッシュを拡張専用のローカル領域に保存します。キャッシュは最大24時間、または論文の総引用数が変わるまで再利用します。期限切れの項目は新しい論文データを保存する際に整理されるため、期限到来と同時に全項目を削除するわけではありません。除外設定は更新するか拡張の保存データを削除するまで残ります。Firefoxの一時導入では保存領域の扱いが異なる場合があります。

アクセス解析、テレメトリー、開発者のサーバー、外部の引用データAPI、APIキーはありません。除外設定やキャッシュを開発者へ送信しません。無関係なサイト、クリップボード、閲覧履歴へのアクセス権限は要求しません。対応するScholarドメインはREADMEとmanifestに記載しています。

全論文を集計に戻すには、ポップアップで **「すべて含める」** を押します。該当プロフィールの除外設定をリセットしますが、キャッシュは消しません。拡張を削除すると、通常は拡張専用の保存データも削除されます。
