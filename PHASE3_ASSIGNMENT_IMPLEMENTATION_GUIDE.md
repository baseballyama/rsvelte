# フェーズ3: Assignment Expression 完全実装ガイド

> **目的**: `assignment_expression.rs` と `assignment_helpers.rs` を完全実装し、Svelte の代入式変換を完成させる

---

## 📋 実装概要

| タスク | ファイル | 難易度 | 優先度 |
|--------|---------|--------|--------|
| ヘルパー関数の作成 | `assignment_helpers.rs` | ⭐⭐⭐ | 1 |
| build_assignment の実装 | `assignment_expression.rs` | ⭐⭐⭐⭐⭐ | 2 |
| assignment_expression の完成 | `assignment_expression.rs` | ⭐⭐⭐ | 3 |
| IdentifierTransform の拡張 | `types.rs` | ⭐⭐ | 4 |

---

## 🎯 フェーズ3-1: assignment_helpers.rs の作成

### 目標

代入式の処理に必要なヘルパー関数を実装します。

### 実装手順

#### Step 1: ファイル作成と基本構造

```bash
touch src/compiler/phases/3_transform/client/visitors/shared/assignment_helpers.rs
```

**ファイル内容の雛形:**

```rust
//! Assignment expression helper functions.
//!
//! Provides utilities for analyzing and transforming assignment expressions
//! in the Svelte compiler.

use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

// ヘルパー関数をここに実装
```

#### Step 2: mod.rs への追加

```rust
// src/compiler/phases/3_transform/client/visitors/shared/mod.rs
pub mod assignment_helpers;
```

---

### 必要な関数一覧

#### 関数 1: `get_rune()` - ルーン呼び出しの検出

**シグネチャ:**
```rust
pub fn get_rune(
    expr: &crate::ast::js::Expression,
    scope: &Scope,
) -> Option<String>
```

**目的:**
- 式が `$state()`, `$derived()`, `$derived.by()` などのルーン呼び出しかを判定
- ルーン名を返す（例: `"$state"`, `"$derived.by"`）

**実装ポイント:**

1. **CallExpression のチェック:**
   ```rust
   let node_type = expr.node_type()?;
   if node_type != "CallExpression" {
       return None;
   }
   ```

2. **callee の取得:**
   ```rust
   let json = expr.as_json();
   let callee = json.get("callee")?;
   ```

3. **callee の種類に応じた処理:**
   - Identifier の場合: `name` を取得
   - MemberExpression の場合: `object.name` + "." + `property.name`

4. **ルーンリストとの照合:**
   ```rust
   const RUNES: &[&str] = &[
       "$state",
       "$derived",
       "$derived.by",
       "$props",
       "$effect",
       "$effect.pre",
       "$effect.tracking",
       "$effect.root",
       "$inspect",
       "$inspect.trace",
       "$host",
   ];

   if !RUNES.contains(&callee_name.as_str()) {
       return None;
   }
   ```

5. **スコープチェック:**
   ```rust
   // ルーンの最初の部分（"$state" など）がスコープに定義されていないことを確認
   let base_name = callee_name.split('.').next()?;
   if scope.declarations.contains_key(base_name) {
       return None; // ローカル変数として定義されている
   }

   Some(callee_name)
   ```

**JavaScript 参照:**
```javascript
// svelte/packages/svelte/src/compiler/phases/3-transform/utils.js
export function get_rune(node, scope) {
    if (!node) return null;
    if (node.type !== 'CallExpression') return null;

    const callee = node.callee.type === 'Identifier'
        ? node.callee.name
        : node.callee.type === 'MemberExpression'
            ? `${node.callee.object.name}.${node.callee.property.name}`
            : null;

    if (!callee || !Runes.includes(callee)) return null;

    const binding = scope.get(callee.split('.')[0]);
    return binding === null ? callee : null;
}
```

---

#### 関数 2: `should_proxy()` - プロキシ化の必要性判定

**シグネチャ:**
```rust
pub fn should_proxy(
    expr: &crate::ast::js::Expression,
    scope: &Scope,
) -> bool
```

**目的:**
- オブジェクトや配列などの参照型がプロキシ化が必要かを判定
- リアクティビティのためにプロキシでラップすべき値を特定

**実装ポイント:**

1. **プリミティブ値のチェック（false を返す）:**
   ```rust
   let node_type = expr.node_type().unwrap_or("");

   match node_type {
       "Literal" => return false,
       "TemplateLiteral" => {
           // expressions が空の場合のみ false
           // expressions がある場合は動的なので true
       }
       "ArrowFunctionExpression" | "FunctionExpression" => return false,
       _ => {}
   }
   ```

2. **UnaryExpression の再帰:**
   ```rust
   if node_type == "UnaryExpression" {
       let argument = // extract argument
       return should_proxy(argument, scope);
   }
   ```

3. **BinaryExpression の再帰:**
   ```rust
   if node_type == "BinaryExpression" {
       let left = // extract left
       let right = // extract right
       return should_proxy(left, scope) || should_proxy(right, scope);
   }
   ```

4. **Identifier のステートチェック:**
   ```rust
   if node_type == "Identifier" {
       // スコープからバインディングを取得
       // kind が State または FrozenState の場合は false
   }
   ```

5. **デフォルト:**
   ```rust
   true // その他の場合はプロキシ化が必要
   ```

**JavaScript 参照:**
```javascript
export function should_proxy(node, scope) {
    if (!node) return false;

    if (node.type === 'Literal') return false;
    if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return false;
    if (node.type === 'ArrowFunctionExpression') return false;
    if (node.type === 'FunctionExpression') return false;

    if (node.type === 'UnaryExpression') return should_proxy(node.argument, scope);
    if (node.type === 'BinaryExpression') {
        return should_proxy(node.left, scope) || should_proxy(node.right, scope);
    }

    if (node.type === 'Identifier') {
        const binding = scope.get(node.name);
        if (binding && (binding.kind === 'state' || binding.kind === 'frozen_state')) {
            return false;
        }
    }

    return true;
}
```

---

#### 関数 3: `build_assignment_value()` - 複合代入演算子の展開

**シグネチャ:**
```rust
pub fn build_assignment_value(
    operator: &str,
    left: &JsExpr,
    right: &JsExpr,
) -> JsExpr
```

**目的:**
- `a += b` を `a + b` に展開
- `a *= b` を `a * b` に展開
- その他の複合代入演算子を展開

**実装:**

```rust
pub fn build_assignment_value(
    operator: &str,
    left: &JsExpr,
    right: &JsExpr,
) -> JsExpr {
    match operator {
        "=" => right.clone(),
        "+=" => b::binary(left.clone(), "+", right.clone()),
        "-=" => b::binary(left.clone(), "-", right.clone()),
        "*=" => b::binary(left.clone(), "*", right.clone()),
        "/=" => b::binary(left.clone(), "/", right.clone()),
        "%=" => b::binary(left.clone(), "%", right.clone()),
        "**=" => b::binary(left.clone(), "**", right.clone()),
        "<<=" => b::binary(left.clone(), "<<", right.clone()),
        ">>=" => b::binary(left.clone(), ">>", right.clone()),
        ">>>=" => b::binary(left.clone(), ">>>", right.clone()),
        "|=" => b::binary(left.clone(), "|", right.clone()),
        "^=" => b::binary(left.clone(), "^", right.clone()),
        "&=" => b::binary(left.clone(), "&", right.clone()),
        // 論理代入演算子は展開しない
        "||=" | "&&=" | "??=" => right.clone(),
        _ => right.clone(),
    }
}
```

---

#### 関数 4: `get_property_name()` - プロパティ名の取得

**シグネチャ:**
```rust
pub fn get_property_name(property: &JsMemberProperty) -> Option<String>
```

**目的:**
- メンバー式のプロパティ名を文字列として取得

**実装:**

```rust
pub fn get_property_name(property: &JsMemberProperty) -> Option<String> {
    match property {
        JsMemberProperty::Identifier(name) => Some(name.clone()),
        JsMemberProperty::PrivateIdentifier(name) => Some(name.clone()),
        JsMemberProperty::Expression(expr) => {
            // 静的な文字列リテラルの場合のみ
            match expr.as_ref() {
                JsExpr::Literal(JsLiteral::String(s)) => Some(s.clone()),
                _ => None,
            }
        }
    }
}
```

---

#### 関数 5: `locate_node()` - ソース位置の取得

**シグネチャ:**
```rust
pub fn locate_node(node: &JsAssignmentExpression) -> String
```

**目的:**
- デバッグ用にノードのソース位置を文字列化
- 例: `"file.svelte:10:5"`

**実装（簡易版）:**

```rust
pub fn locate_node(_node: &JsAssignmentExpression) -> String {
    // TODO: 実際のソースマップ情報にアクセスして位置を取得
    // 現在はプレースホルダー
    "unknown:0:0".to_string()
}
```

**将来の完全実装:**
```rust
pub fn locate_node(node: &JsAssignmentExpression, filename: &str, source: &str) -> String {
    // node の start 位置から行番号と列番号を計算
    // format!("{}:{}:{}", filename, line, column)
}
```

---

### テストの作成

**ファイル:** `src/compiler/phases/3_transform/client/visitors/shared/assignment_helpers.rs` の末尾

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_build_assignment_value_add() {
        let left = JsExpr::Identifier("a".to_string());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value("+=", &left, &right);

        match result {
            JsExpr::Binary(bin) => {
                assert!(matches!(bin.operator, JsBinaryOp::Add));
            }
            _ => panic!("Expected Binary expression"),
        }
    }

    #[test]
    fn test_build_assignment_value_assign() {
        let left = JsExpr::Identifier("a".to_string());
        let right = JsExpr::Literal(JsLiteral::Number(1.0));

        let result = build_assignment_value("=", &left, &right);

        // = の場合は right をそのまま返す
        match result {
            JsExpr::Literal(JsLiteral::Number(n)) => assert_eq!(n, 1.0),
            _ => panic!("Expected Number literal"),
        }
    }

    #[test]
    fn test_get_property_name_identifier() {
        let prop = JsMemberProperty::Identifier("foo".to_string());
        assert_eq!(get_property_name(&prop), Some("foo".to_string()));
    }

    #[test]
    fn test_get_property_name_string_literal() {
        let prop = JsMemberProperty::Expression(Box::new(
            JsExpr::Literal(JsLiteral::String("bar".to_string()))
        ));
        assert_eq!(get_property_name(&prop), Some("bar".to_string()));
    }
}
```

---

## 🎯 フェーズ3-2: IdentifierTransform の拡張

### 目標

`IdentifierTransform` に `mutate` フィールドを追加します。

### 実装手順

**ファイル:** `src/compiler/phases/3_transform/client/types.rs`

```rust
/// Transform rule for an identifier.
#[derive(Debug, Clone)]
pub struct IdentifierTransform {
    /// How to read the identifier
    pub read: Option<fn(JsExpr) -> JsExpr>,

    /// How to assign to the identifier
    ///
    /// Parameters:
    /// - identifier: The identifier being assigned to
    /// - value: The value being assigned
    /// - needs_proxy: Whether the value needs to be proxified
    pub assign: Option<fn(JsExpr, JsExpr, bool) -> JsExpr>,

    /// How to handle mutations to the identifier
    ///
    /// Parameters:
    /// - identifier: The identifier being mutated
    /// - mutation_expr: The mutation expression (e.g., `obj.prop = value`)
    pub mutate: Option<fn(JsExpr, JsExpr) -> JsExpr>,
}
```

---

## 🎯 フェーズ3-3: build_assignment 関数の実装

### 目標

代入式の変換ロジックを実装します。これは最も複雑な部分です。

### 実装の全体構造

**ファイル:** `src/compiler/phases/3_transform/client/visitors/assignment_expression.rs`

```rust
use super::shared::assignment_helpers::*;
use super::shared::utils::validate_mutation;
use crate::compiler::phases::phase2_analyze::scope::BindingKind;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;

/// 非強制演算子かチェック
fn is_non_coercive_operator(operator: &str) -> bool {
    matches!(operator, "=" | "||=" | "&&=" | "??=")
}

/// $.assign* 呼び出しのマッピング
fn get_assign_callee(operator: &str) -> &'static str {
    match operator {
        "=" => "$.assign",
        "&&=" => "$.assign_and",
        "||=" => "$.assign_or",
        "??=" => "$.assign_nullish",
        _ => "$.assign",
    }
}
```

---

### 実装ケースの詳細

#### ケース 1: ルーンモードのステートフィールド宣言

**条件:**
- `context.state.analysis.runes == true`
- `left` がメンバー式
- `state_fields` にフィールド情報が存在
- `node.left` がフィールドの宣言位置と一致

**処理:**

```rust
// ケース 1: クラスコンストラクタ内のステートフィールド宣言
if context.state.analysis.runes {
    if let JsExpr::Member(member) = left {
        let name = get_property_name(&member.property);
        let field = name.as_ref()
            .and_then(|n| context.state.state_fields.get(n));

        if let Some(field) = field {
            // TODO: フィールド宣言位置のチェック
            // TODO: 右辺がルーン呼び出しかチェック
            // TODO: 適切な変換を適用
        }
    }
}
```

**詳細な実装:**

```rust
// フィールドが宣言される位置かチェック
let is_declaration = /* left == field.node.left */;

if is_declaration {
    // 右辺を Expression として取得
    // TODO: JsExpr から Expression への変換が必要
    //       または Expression を保持する必要がある

    // 右辺がルーン呼び出しかチェック
    // let rune = get_rune(right_expr, context.state.scope);

    // if let Some(rune_name) = rune {
    //     let in_constructor = rune_name != "$derived" && rune_name != "$derived.by";
    //
    //     // 値を変換
    //     let value = /* visit right with new state */;
    //
    //     if context.state.dev {
    //         // $.tag(value, "ClassName.fieldName")
    //         value = b::call(
    //             b::id("$.tag"),
    //             vec![value, b::string(&format!("Class.{}", name.unwrap()))],
    //         );
    //     }
    //
    //     return Some(b::assign_op(
    //         operator,
    //         b::member(b::this(), &field.key),
    //         value,
    //     ));
    // }
}
```

**JavaScript 参照:**
```javascript
// Case 1: Class field declaration with rune
if (state.analysis.runes) {
    const field = state_fields.get(left);
    if (field && field.node.left === left) {
        const rune = get_rune(right, state.scope);
        if (rune) {
            const in_constructor = rune !== '$derived' && rune !== '$derived.by';
            const child_state = {...state, in_constructor};
            let value = visit(right, child_state);
            if (state.dev) {
                value = b.call('$.tag', value, b.literal(`${class_name}.${field_name}`));
            }
            return b.assignment(operator, b.member(b.this, field.key), value);
        }
    }
}
```

---

#### ケース 2: プライベートフィールドへの代入

**条件:**
- `left` がメンバー式
- プロパティがプライベート識別子
- `state_fields` にフィールド情報が存在

**処理:**

```rust
// ケース 2: プライベートフィールドへの代入
if let JsMemberProperty::PrivateIdentifier(_) = member.property {
    if let Some(field) = field {
        // TODO: 右辺を visit
        // let value = visit(build_assignment_value(operator, left, right));

        // let needs_proxy = field.field_type == "$state"
        //     && is_non_coercive_operator(operator)
        //     && should_proxy(right, context.state.scope);

        // if needs_proxy {
        //     return Some(b::call(
        //         b::id("$.set"),
        //         vec![left.clone(), value, b::true_literal()],
        //     ));
        // } else {
        //     return Some(b::call(
        //         b::id("$.set"),
        //         vec![left.clone(), value],
        //     ));
        // }
    }
}
```

**JavaScript 参照:**
```javascript
if (field && left.property.type === 'PrivateIdentifier') {
    const value = visit(build_assignment_value(operator, left, right));
    const needs_proxy = field.kind === '$state'
        && is_non_coercive(operator)
        && should_proxy(right, scope);

    return b.call('$.set', left, value, needs_proxy && b.true);
}
```

---

#### ケース 3: 再代入（object === left）

**条件:**
- ルート識別子 == 代入の左辺全体
- トランスフォームに `assign` 関数が定義されている

**処理:**

```rust
// ケース 3: 再代入（object === left）
if object == *left {
    if let Some(t) = transform {
        if let Some(assign_fn) = t.assign {
            // プリミティブかチェック
            let is_primitive = /* path 解析 */;

            // TODO: 右辺を visit
            // let value = visit(build_assignment_value(operator, left, right));

            // let needs_proxy = !is_primitive
            //     && !matches!(binding.kind,
            //         BindingKind::Prop | BindingKind::BindableProp |
            //         BindingKind::RawState | BindingKind::Derived | BindingKind::StoreSub)
            //     && context.state.analysis.runes
            //     && should_proxy(right, context.state.scope)
            //     && is_non_coercive_operator(operator);

            // return Some(assign_fn(object.clone(), value, needs_proxy));
        }
    }
}
```

**JavaScript 参照:**
```javascript
if (object === left && transform?.assign) {
    const is_primitive = /* check path */;
    const value = visit(build_assignment_value(operator, left, right));
    const needs_proxy = !is_primitive
        && !is_prop_or_state(binding)
        && state.analysis.runes
        && should_proxy(right, scope)
        && is_non_coercive(operator);

    return transform.assign(object, value, needs_proxy);
}
```

---

#### ケース 4: 変更（mutation）

**条件:**
- トランスフォームに `mutate` 関数が定義されている

**処理:**

```rust
// ケース 4: 変更（mutation）
if let Some(t) = transform {
    if let Some(mutate_fn) = t.mutate {
        // TODO: left と right を visit
        // let visited_left = visit(left);
        // let visited_right = visit(right);

        // return Some(mutate_fn(
        //     object.clone(),
        //     b::assign_op(operator, visited_left, visited_right),
        // ));
    }
}
```

---

#### ケース 5: プロキシ化が必要な代入

**条件:**
- `dev` モード
- 特定のコンテキスト外
- 非強制演算子

**処理:**

```rust
// ケース 5: プロキシ化が必要な代入
let mut should_transform = context.state.dev
    && /* not in ExpressionStatement */
    && is_non_coercive_operator(operator);

// 特殊ケース: イベントハンドラ内は無視
// 特殊ケース: bind: ディレクティブ内は無視

if let JsExpr::Member(member) = left {
    if should_transform {
        let callee = get_assign_callee(operator);

        // プロパティ式を取得
        let property_expr = /* ... */;

        // TODO: 右辺を visit
        // let visited_right = visit(right);

        let loc = locate_node(node);

        return Some(b::call(
            b::member_path(callee),
            vec![
                (*member.object).clone(),
                property_expr,
                /* visited_right */,
                b::string(&loc),
            ],
        ));
    }
}
```

**JavaScript 参照:**
```javascript
let should_transform = state.dev
    && parent_type !== 'ExpressionStatement'
    && is_non_coercive(operator);

// Skip event handlers and bind directives
if (/* in event handler or bind */) {
    should_transform = false;
}

if (should_transform && left.type === 'MemberExpression') {
    const callee = get_assign_callee(operator);
    const property = left.computed ? left.property : b.literal(left.property.name);
    const value = visit(right);
    const loc = locate_node(node);

    return b.call(callee, left.object, property, value, b.literal(loc));
}
```

---

## 🎯 フェーズ3-4: assignment_expression 関数の完成

### 実装

```rust
/// 代入式のビジター
pub fn assignment_expression(
    node: &JsAssignmentExpression,
    context: &mut ComponentContext,
) -> TransformResult {
    // まず build_assignment を試す
    let expression = if let Some(expr) = build_assignment(
        &node.operator.to_string(),
        &node.left,
        &node.right,
        context,
    ) {
        expr
    } else {
        // デフォルト: 子をビジット
        // TODO: context.next() の実装
        JsExpr::Assignment(node.clone())
    };

    // 変更検証を適用
    let validated = validate_mutation(node, context, expression);

    TransformResult::Expression(validated)
}
```

---

## 📝 実装チェックリスト

### フェーズ3-1: assignment_helpers.rs

- [ ] ファイルを作成
- [ ] mod.rs に追加
- [ ] `get_rune()` を実装
  - [ ] CallExpression のチェック
  - [ ] callee の取得（Identifier / MemberExpression）
  - [ ] ルーンリストとの照合
  - [ ] スコープチェック
  - [ ] テストを作成
- [ ] `should_proxy()` を実装
  - [ ] プリミティブ値のチェック
  - [ ] UnaryExpression の再帰
  - [ ] BinaryExpression の再帰
  - [ ] Identifier のステートチェック
  - [ ] テストを作成
- [ ] `build_assignment_value()` を実装
  - [ ] 全演算子のマッピング
  - [ ] テストを作成
- [ ] `get_property_name()` を実装
  - [ ] テストを作成
- [ ] `locate_node()` を実装（簡易版）

### フェーズ3-2: IdentifierTransform の拡張

- [ ] `mutate` フィールドを追加
- [ ] ドキュメントを更新

### フェーズ3-3: build_assignment の実装

- [ ] ヘルパー関数を実装
  - [ ] `is_non_coercive_operator()`
  - [ ] `get_assign_callee()`
- [ ] ルート識別子とバインディングの取得
- [ ] ケース 1: ステートフィールド宣言
  - [ ] フィールド情報の取得
  - [ ] ルーン呼び出しのチェック
  - [ ] 変換の適用
- [ ] ケース 2: プライベートフィールド代入
  - [ ] プロキシ化判定
  - [ ] $.set 呼び出し
- [ ] ケース 3: 再代入
  - [ ] トランスフォームの適用
  - [ ] プロキシ化判定
- [ ] ケース 4: 変更
  - [ ] mutate 関数の適用
- [ ] ケース 5: プロキシ化が必要な代入
  - [ ] コンテキスト判定
  - [ ] $.assign* 呼び出し

### フェーズ3-4: assignment_expression の完成

- [ ] `assignment_expression()` を実装
- [ ] `build_assignment()` を呼び出し
- [ ] `validate_mutation()` を適用

### 最終確認

- [ ] すべてのユニットテストがパス
- [ ] コンパイルエラーなし
- [ ] 既存のテストがパス
- [ ] ドキュメントの更新

---

## 🚧 実装上の注意点

### 1. Expression と JsExpr の変換

**問題:**
- `get_rune()` と `should_proxy()` は `Expression` を受け取る
- `build_assignment()` は `JsExpr` を扱う
- 双方向の変換が必要

**解決策:**

**オプションA: Expression を保持**
```rust
// JsAssignmentExpression に Expression のフィールドを追加
pub struct JsAssignmentExpression {
    pub operator: JsAssignmentOp,
    pub left: Box<JsExpr>,
    pub right: Box<JsExpr>,

    // 元の Expression（オプション）
    pub right_expr: Option<crate::ast::js::Expression>,
}
```

**オプションB: JsExpr から Expression への変換**
```rust
// JsExpr を Expression に変換するヘルパー
pub fn js_expr_to_expression(expr: &JsExpr) -> Option<crate::ast::js::Expression> {
    // TODO: 逆変換の実装
    None
}
```

**推奨: オプションB（段階的実装）**
- 最初は簡略版（常に `None` を返す）
- 必要に応じて機能を追加

### 2. context.next() / visitor の実装

**問題:**
- JavaScript の `context.visit(node)` に相当する機能が必要

**解決策:**

**段階的アプローチ:**
1. **Phase 1**: 子ノードをそのまま返す
   ```rust
   // デフォルト実装
   JsExpr::Assignment(node.clone())
   ```

2. **Phase 2**: 式変換を適用
   ```rust
   // expression_converter を使用
   let right_converted = convert_expression(&node.right_expr?, context);
   ```

3. **Phase 3**: 完全なビジター実装
   ```rust
   // context.visit を実装
   ```

### 3. path 解析

**問題:**
- `context.path` から親ノードの種類を判定する必要がある

**解決策:**

```rust
// path から親ノードのタイプ名を取得
fn get_parent_types(context: &ComponentContext) -> Vec<&str> {
    context.path.iter()
        .map(|node| match node {
            TemplateNode::Component(_) => "Component",
            TemplateNode::RegularElement(_) => "RegularElement",
            TemplateNode::SvelteElement(elem) => {
                if elem.name == "svelte:component" {
                    "SvelteComponent"
                } else {
                    "SvelteElement"
                }
            }
            _ => "Unknown",
        })
        .collect()
}
```

---

## 🧪 テスト戦略

### ユニットテスト

各ヘルパー関数に対してテストを作成：

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_is_non_coercive_operator() {
        assert!(is_non_coercive_operator("="));
        assert!(is_non_coercive_operator("||="));
        assert!(is_non_coercive_operator("&&="));
        assert!(is_non_coercive_operator("??="));
        assert!(!is_non_coercive_operator("+="));
    }

    #[test]
    fn test_get_assign_callee() {
        assert_eq!(get_assign_callee("="), "$.assign");
        assert_eq!(get_assign_callee("&&="), "$.assign_and");
        assert_eq!(get_assign_callee("||="), "$.assign_or");
        assert_eq!(get_assign_callee("??="), "$.assign_nullish");
    }
}
```

### 統合テスト

実際の Svelte コンポーネントでテスト：

```svelte
<!-- tests/fixtures/assignment.svelte -->
<script>
  let count = $state(0);
  let obj = $state({ value: 0 });

  function increment() {
    count += 1;  // ケース 3: 再代入
  }

  function mutate() {
    obj.value += 1;  // ケース 4: 変更
  }
</script>
```

---

## 📚 参考資料

### JavaScript の元実装

| 機能 | ファイルパス |
|------|-------------|
| AssignmentExpression | `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AssignmentExpression.js` |
| get_rune, should_proxy | `svelte/packages/svelte/src/compiler/phases/3-transform/utils.js` |
| scope utilities | `svelte/packages/svelte/src/compiler/phases/scope.js` |

### Rust モジュール

| モジュール | パス |
|-----------|------|
| Expression | `src/ast/js.rs` |
| Scope/Binding | `src/compiler/phases/2_analyze/scope.rs` |
| JsExpr | `src/compiler/phases/3_transform/js_ast/nodes.rs` |
| builders | `src/compiler/phases/3_transform/js_ast/builders.rs` |

---

## 💡 実装のヒント

1. **段階的に実装**: すべてのケースを一度に実装しようとせず、1つずつ確実に
2. **プレースホルダーの活用**: 完全実装できない部分は TODO コメントと簡略版を残す
3. **テスト駆動**: 各関数の実装前にテストを書く
4. **JavaScript を参照**: 詰まったら元の実装を読み返す
5. **コンパイラを味方に**: 型エラーは無料のレビュー

---

## 🎉 完了後のアクション

1. **Pull Request を作成**
2. **CI/CD でテストを確認**
3. **互換性レポートを更新**
   ```bash
   npm run compatibility-report
   ```
4. **AGENTS.md を更新**
5. **このガイドを更新（新しい知見を追加）**

---

**Good luck with Phase 3! 🚀**

段階的に進めることが成功の鍵です。各ケースを1つずつ実装し、テストで検証しながら進めてください。
