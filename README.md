## crypto_twap_exec

bitflyerでtwap執行するためのコマンドラインツール。
一定時間ごとに成行発注。

## セットアップ

```bash
npm install
```

以下の環境変数を設定。

```
BITFLYER_API_KEY: bitflyerのapi key
BITFLYER_API_SECRET: bitflyerのapi secret
```

## 使い方

1日かけて4btcを売る場合。デフォルトだと5分ごとに執行。買う場合はtotal_sizeをプラスにすれば良い

```bash
node main.js --duration 86400 --total_size -4
```

## 注意

最低限で作ったのでエラー処理とかメンテとか考慮してない。
