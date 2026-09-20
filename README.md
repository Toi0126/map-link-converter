# map-link-converter

iPhoneのSafariで、AppleマップのリンクをGoogleマップのリンクへ自動変換するユーザースクリプトです。

[Userscripts](https://github.com/quoid/userscripts)を使用します。

## 機能

- ページ内のAppleマップリンクを、タップ前にGoogleマップのリンクへ書き換えます。
- 後から追加・変更されたリンクにも対応します。
- AppleマップのページがSafariで開いた場合は、対応するGoogleマップURLへ転送します。
- 外部への事前問い合わせ、位置情報の取得、履歴の保存は行いません。

## 対応するリンク

| 種類 | 主なパラメータ | 変換後 |
|---|---|---|
| 検索 | `q` / `query` | キーワード検索 |
| 住所 | `address` | 住所検索 |
| 座標 | `ll` / `coordinate` | 指定座標を表示 |
| 地図の表示範囲 | `/frame?center=...` | 中心座標を地点として表示 |
| 経路 | `daddr` / `destination` | 目的地への経路を表示 |
| 出発地 | `saddr` / `source` | 経路の出発地に設定 |
| 移動手段 | `dirflg` / `mode` | 車・徒歩・公共交通など |

`/frame`への対応には、スクリプトの許可パスに`/frame`、座標パラメータに`center`を追加した修正版が必要です。

## インストール

1. iPhoneに[Userscripts](https://github.com/quoid/userscripts#installation)をインストールします。
2. Userscriptsアプリを開き、スクリプトの保存フォルダを確認または指定します。
3. このリポジトリの`apple-maps-to-google.user.js`をダウンロードし、そのフォルダへ保存します。
4. **設定 → アプリ → Safari → 拡張機能 → Userscripts**を有効にします。
5. Userscriptsに対象Webサイトへのアクセスを許可します。すべてのサイトで利用する場合は「すべてのWebサイト」を許可します。
6. Safariで対象ページを再読み込みします。

ファイル名の末尾が`.user.js.txt`ではなく、`.user.js`になっていることを確認してください。

## 使い方

設定後は、Safariで通常どおりAppleマップのリンクをタップします。対応するリンクは自動的にGoogleマップへ変換されます。

共有メニューから毎回スクリプトを実行する必要はありません。

### 変換例

変換前：

```text
https://maps.apple.com/directions?mode=driving&destination=35.6204225868%2C139.72903
```

変換後：

```text
https://www.google.com/maps/dir/?api=1&destination=35.6204225868%2C139.72903&travelmode=driving
```

## テスト用リンク

SafariでこのREADMEを開き、Userscriptsのアクセスを許可してから確認してください。

| パターン | リンク |
|---|---|
| 地名検索 | [東京駅を検索](https://maps.apple.com/?q=東京駅) |
| 住所指定 | [東京都千代田区丸の内1丁目](https://maps.apple.com/?address=東京都千代田区丸の内1丁目) |
| 座標指定 | [指定座標を表示](https://maps.apple.com/?ll=35.620423%2C139.729030) |
| 中心座標・表示範囲 | [frame形式](https://maps.apple.com/frame?center=35.620423%2C139.729030&span=0.017712%2C0.023670) |
| 車の経路 | [指定座標まで車で移動](https://maps.apple.com/directions?mode=driving&destination=35.6204225868%2C139.72903) |
| 徒歩の経路 | [指定座標まで徒歩で移動](https://maps.apple.com/directions?mode=walking&destination=35.6204225868%2C139.72903) |
| 公共交通の経路 | [東京駅から品川駅](https://maps.apple.com/?saddr=東京駅&daddr=品川駅&dirflg=r) |

## 制限事項

- Safariでスクリプトの実行が許可されたページが対象です。別アプリから直接Appleマップを開く動作は対象外です。
- 短縮URL、地点IDしか含まれないURL、解釈できない形式は変更しません。
- 複数経由地や同じパラメータが重複するURLは変換しません。
- `/frame`の`span`は引き継ぎません。中心座標をGoogleマップの検索地点として表示します。
- 座標を使った変換では、Appleマップの施設名や施設情報がそのまま引き継がれるわけではありません。
- JavaScriptで独自にアプリを起動するボタンなど、通常のリンク以外には対応できない場合があります。
- Googleマップアプリが開くか、ブラウザ表示になるか、確認が表示されるかは端末側の状態に左右されます。

## 動作確認

2026-09-20 JST時点：

- 検索・座標・経路などのURL変換処理をJavaScriptでテスト済みです。
- `mode=driving&destination=緯度,経度`形式は、利用者のiPhoneで動作報告があります。
- `/frame?center=...`形式は、修正後の変換処理をテスト済みです。修正版のiPhone実機動作は未確認です。
- すべてのiOS・Safariバージョンでの動作を保証するものではありません。

## うまく動かない場合

1. Safariで開いているか確認します。
2. Userscriptsが有効で、対象サイトへのアクセスが許可されているか確認します。
3. `.user.js`ファイルがUserscriptsの指定フォルダにあるか確認します。
4. スクリプトを更新した場合は、対象ページを再読み込みします。
5. `/frame`形式だけ変換されない場合は、許可パスに`/frame`、座標取得に`center`が含まれているか確認します。

## 参考資料

- [Userscripts公式ドキュメント](https://github.com/quoid/userscripts)
- [Apple Map Links](https://developer.apple.com/library/archive/featuredarticles/iPhoneURLScheme_Reference/MapLinks/MapLinks.html)
- [Google Maps URLs](https://developers.google.com/maps/documentation/urls/get-started)