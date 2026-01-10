# CSS Test Fixes - 残り68個の失敗を解決する

## 現状
- CSS tests: 99/167 (59.3%)
- 残り68個のテストが失敗中

## 問題のカテゴリと優先順位

### 【高優先度】1. 兄弟セレクタ（Sibling Combinator）の未使用検出 - 約15-20テスト

**問題**: 制御フロー（`{#if}`, `{#each}`, `{#await}`）やスロット、スニペット内の要素を含む兄弟セレクタ（`+`, `~`）が正しく検出されていない。

**失敗テスト例**:
- `siblings-combinator-if`
- `siblings-combinator-key`
- `siblings-combinator-slot`
- `siblings-combinator-star`
- `general-siblings-combinator-if`
- `general-siblings-combinator-slot-global`

**具体例** (`siblings-combinator-if`):
```html
<div class="a"></div>
{#if foo}
  <div class="b"></div>
{:else if bar}
  <div class="c"></div>
{:else}
  <div class="d"></div>
{/if}
<div class="e"></div>
```

```css
.a + .b { color: green; }  /* OK: .a の次は .b, .c, .d のいずれか */
.a + .c { color: green; }  /* OK */
.a + .d { color: green; }  /* OK */
.b + .e { color: green; }  /* OK */
.c + .e { color: green; }  /* OK */
.d + .e { color: green; }  /* OK */

/* 以下は決して一致しない */
.a + .e { color: green; }  /* NO: .a と .e の間には常に要素がある */
.b + .c { color: green; }  /* NO: .b と .c は別の分岐 */
.b + .d { color: green; }  /* NO */
.c + .d { color: green; }  /* NO */
```

**期待される動作**:
- コメントフォーマット: `/* no match */` を使用（現在は `/* (unused) ... */`）
- 制御フロー内の要素の兄弟関係を正しく追跡
- `has_control_flow`フラグと`SiblingCertainty`を活用

**関連ファイル**:
- `src/compiler/phases/2_analyze/control_flow.rs` - `build_sibling_relationships()`
- `src/compiler/phases/2_analyze/types.rs` - `CssDomElement`, `SiblingCertainty`
- `src/compiler/phases/3_transform/css.rs` - 兄弟セレクタの未使用検出ロジック

**実装のヒント**:
1. `control_flow.rs`の`build_sibling_relationships()`で制御フロー内の要素の兄弟関係を構築
2. `CssDomElement`の`next_siblings`と`previous_siblings`フィールドを正しく設定
3. `SiblingCertainty::Conditional`を使用して、条件付き兄弟を表現
4. CSS変換時に、兄弟セレクタが絶対に一致しないケースを検出

### 【高優先度】2. 子コンビネータ（Child Combinator）と`:host`の組み合わせ - 約10テスト

**問題**: `:host > element`のようなセレクタでスコープクラスが正しく追加されない。

**失敗テスト例**:
- `host`
- `child-combinator`
- `snippets`
- `omit-scoping-attribute-global-children`

**具体例** (`host`):
```css
/* 入力 */
:host > h1 { color: red; }

/* 期待される出力 */
:host > h1.svelte-xyz { color: red; }

/* 実際の出力 */
/* (unused) :host > h1 { color: red; }*/
```

**期待される動作**:
- `:host`の直後の子コンビネータ（`>`）の後にスコープクラスを追加
- 未使用として誤って検出しない

**関連ファイル**:
- `src/compiler/phases/3_transform/css.rs` - `scope_selector()`, `process_compound_selector()`

### 【中優先度】3. Unicode識別子とCSSエスケープシーケンス - 約5テスト

**問題**: CSSエスケープシーケンス（`\31`, `\a`, `\1f642`など）の処理が不完全。

**失敗テスト例**:
- `unicode-identifier`

**具体例**:
```css
/* エスケープシーケンスの正規化が必要 */
#\31\32\33    → #123
#\31 23       → #1 23 (スペースに注意)
#\31  span    → #1 span (2つのスペース)
#line\a break → #line<改行>break
.\61sdf       → .asdf
```

**期待される動作**:
- CSSエスケープシーケンスをデコードして`used_ids`/`used_classes`と照合
- スペースの扱いに注意（エスケープ後の1つのスペースは終端、2つ以上は保持）

**関連ファイル**:
- `src/compiler/phases/3_transform/css.rs` - セレクタ解析ロジック
- 既存の`decode_css_escape()`関数を活用または拡張

**実装のヒント**:
1. CSSエスケープの仕様: `\` + hex digits + optional space
2. スペースが1つの場合は終端記号、2つ以上の場合は1つを終端、残りを保持

### 【中優先度】4. 動的クラス名の未使用検出 - 約5テスト

**問題**: `clsx`や三項演算子による動的クラス名が正しく追跡されていない。

**失敗テスト例**:
- `clsx-cannot-prune-2`
- `clsx-cannot-prune-3`
- `unused-selector-ternary-concat`
- `unused-selector-ternary-bailed`

**具体例** (`clsx-cannot-prune-2`):
```html
<script>
  import clsx from 'clsx';
  let x;
</script>
<div class={clsx({ x })}></div>

<style>
  .x { color: green; }  /* 使用されているはず（動的） */
</style>
```

**期待される動作**:
- `clsx()`や複雑な式を検出したら`has_dynamic_classes = true`に設定
- 動的クラスがある場合、クラスセレクタは未使用としてマークしない

**関連ファイル**:
- `src/compiler/phases/2_analyze/visitors/attribute.rs` - クラス属性の解析
- `src/compiler/phases/2_analyze/visitors/class_directive.rs`
- 式の中で`clsx`関数呼び出しを検出

### 【中優先度】5. `:global()`ブロック構文 - 約5テスト

**問題**: `:global { ... }`のブロック構文でコメントアウト処理が正しくない。

**失敗テスト例**:
- `global-nested-block`

**具体例**:
```css
/* 入力 */
div {
  :global {
    .x { color: red; }
  }
}

/* 期待される出力 */
div.svelte-xyz {
  /* :global {*/
  .x { color: red; }
  /* }*/
}
```

**期待される動作**:
- `:global {`と対応する`}`をコメントアウト
- 中身のセレクタはスコープしない

**関連ファイル**:
- `src/compiler/phases/3_transform/css.rs` - `:global`処理ロジック

### 【低優先度】6. その他の細かい問題 - 約8テスト

**失敗テスト例**:
- `keyframes-autoprefixed` - コンパイルエラー（CSS validation issue）
- `unused-selector-empty-attribute` - 空の属性セレクタ `[alt]`
- `at-rule-nested-class` - ネストされたat-ruleのクラス
- `media-query`, `supports-*` - at-rule内のスコープ

## 実装の進め方

### ステップ1: 兄弟セレクタの修正
1. `control_flow.rs`の実装を確認
2. 兄弟関係の構築ロジックを改善
3. CSS変換で兄弟セレクタの検証を実装
4. コメントフォーマットを`/* no match */`に変更

### ステップ2: `:host`と子コンビネータ
1. `:host`疑似クラスの処理を確認
2. 子コンビネータ後のスコープクラス追加を修正

### ステップ3: Unicodeエスケープ
1. CSSエスケープデコード関数を実装
2. セレクタ解析時にデコードを適用

### ステップ4: 動的クラス
1. `clsx`や複雑な式の検出
2. `has_dynamic_classes`フラグの設定

### ステップ5: `:global`ブロック
1. ブロック構文の検出
2. コメントアウト処理の実装

### ステップ6: その他
1. 個別のエッジケースを修正

## 参考: Svelte公式実装

比較対象:
- `svelte/packages/svelte/src/compiler/phases/3-transform/css/`
  - `css-prune.js` - 未使用セレクタ検出
  - `css-scope.js` - スコープ処理

特に参考になる関数:
- `get_possible_values()` - 動的値の検出
- `is_unused_selector()` - 未使用判定ロジック
- `apply_selector()` - スコープクラスの適用

## 成功基準

- CSS tests: 167/167 (100%)
- すべてのセレクタタイプが正しくスコープされる
- 未使用セレクタが正確に検出される
- 制御フロー内の要素が正しく追跡される

## 注意事項

1. **段階的にテスト**: 各カテゴリを修正したら、テストを実行して進捗を確認
2. **コミット頻度**: 各カテゴリの修正ごとにコミット
3. **公式実装を参照**: 不明な点は`svelte/packages/svelte/src/compiler/`を確認
4. **テストケースから学ぶ**: 失敗しているテストの入力と期待される出力を詳しく確認
