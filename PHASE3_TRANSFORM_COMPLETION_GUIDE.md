# Phase 3 Transform 完全実装ガイド

このドキュメントは、Phase 3 (Transform) の以下のファイルを完全実装するための詳細なガイドです。

## 📋 実装状況サマリー

| ファイル | 状態 | 完成度 | 備考 |
|---------|------|--------|------|
| `shared/function.rs` | ✅ 完了 | 100% | 完全実装済み |
| `animate_directive.rs` | ⚠️ 部分実装 | 70% | 式の変換がプレースホルダー |
| `shared/utils.rs` の `validate_mutation` | ⚠️ 簡略版 | 30% | ScopeRoot へのアクセスが必要 |
| `assignment_expression.rs` | ❌ スタブ | 5% | 最も複雑、多くの依存関係が必要 |

---

## 🎯 優先順位と実装順序

### フェーズ 1: 基盤整備（最優先）

1. **式変換インフラの構築**
   - Expression → JsExpr の変換関数
   - JS AST ビジターパターンの実装
   - 変換コンテキストの整備

2. **ScopeRoot アクセスの追加**
   - ComponentClientTransformState への scope_root フィールド追加
   - バインディング情報への安全なアクセス

### フェーズ 2: 中核機能の実装

3. **animate_directive.rs の完全実装**
4. **validate_mutation の完全実装**

### フェーズ 3: 高度な機能

5. **assignment_expression.rs の完全実装**

---

## 📖 詳細実装ガイド

## 1️⃣ 式変換インフラの構築

### 目的
`crate::ast::js::Expression` を `crate::compiler::phases::phase3_transform::js_ast::nodes::JsExpr` に変換する機能を実装します。

### 実装ファイル
新規ファイル: `src/compiler/phases/3_transform/client/visitors/expression_converter.rs`

### 必要な機能

```rust
/// Expression から JsExpr への変換
pub fn convert_expression(
    expr: &crate::ast::js::Expression,
    context: &mut ComponentContext,
) -> JsExpr {
    match expr {
        Expression::Value(val) => {
            // serde_json::Value から JsExpr への変換
            convert_json_value(val, context)
        }
    }
}

/// JSON Value から JsExpr への変換
fn convert_json_value(
    value: &serde_json::Value,
    context: &mut ComponentContext,
) -> JsExpr {
    match value {
        serde_json::Value::Object(obj) => {
            // ESTree ノードタイプを判定して変換
            let node_type = obj.get("type")
                .and_then(|t| t.as_str())
                .unwrap_or("Unknown");

            match node_type {
                "Identifier" => convert_identifier(obj, context),
                "Literal" => convert_literal(obj, context),
                "MemberExpression" => convert_member_expression(obj, context),
                "CallExpression" => convert_call_expression(obj, context),
                "BinaryExpression" => convert_binary_expression(obj, context),
                "UnaryExpression" => convert_unary_expression(obj, context),
                "LogicalExpression" => convert_logical_expression(obj, context),
                "ConditionalExpression" => convert_conditional_expression(obj, context),
                "ArrayExpression" => convert_array_expression(obj, context),
                "ObjectExpression" => convert_object_expression(obj, context),
                "ArrowFunctionExpression" => convert_arrow_function(obj, context),
                "FunctionExpression" => convert_function_expression(obj, context),
                "AssignmentExpression" => convert_assignment_expression(obj, context),
                "UpdateExpression" => convert_update_expression(obj, context),
                "SequenceExpression" => convert_sequence_expression(obj, context),
                "ThisExpression" => JsExpr::This,
                "NewExpression" => convert_new_expression(obj, context),
                "AwaitExpression" => convert_await_expression(obj, context),
                "YieldExpression" => convert_yield_expression(obj, context),
                "SpreadElement" => convert_spread_element(obj, context),
                "TemplateLiteral" => convert_template_literal(obj, context),
                _ => {
                    // 未知のノードタイプは Raw として扱う
                    JsExpr::Raw(format!("/* Unknown: {} */", node_type))
                }
            }
        }
        serde_json::Value::String(s) => JsExpr::Literal(JsLiteral::String(s.clone())),
        serde_json::Value::Number(n) => {
            JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0)))
        }
        serde_json::Value::Bool(b) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        serde_json::Value::Null => JsExpr::Literal(JsLiteral::Null),
        serde_json::Value::Array(_) => {
            // 配列は通常 ArrayExpression として処理される
            JsExpr::Raw("/* Array */".to_string())
        }
    }
}

// 各 ESTree ノードタイプの変換関数を実装
fn convert_identifier(obj: &serde_json::Map<String, serde_json::Value>, context: &mut ComponentContext) -> JsExpr {
    let name = obj.get("name")
        .and_then(|n| n.as_str())
        .unwrap_or("unknown")
        .to_string();

    // トランスフォームの適用
    if let Some(transform) = context.state.transform.get(&name) {
        if let Some(read_fn) = transform.read {
            return read_fn(JsExpr::Identifier(name));
        }
    }

    JsExpr::Identifier(name)
}

fn convert_literal(obj: &serde_json::Map<String, serde_json::Value>, _context: &mut ComponentContext) -> JsExpr {
    let value = obj.get("value");

    match value {
        Some(serde_json::Value::String(s)) => JsExpr::Literal(JsLiteral::String(s.clone())),
        Some(serde_json::Value::Number(n)) => JsExpr::Literal(JsLiteral::Number(n.as_f64().unwrap_or(0.0))),
        Some(serde_json::Value::Bool(b)) => JsExpr::Literal(JsLiteral::Boolean(*b)),
        Some(serde_json::Value::Null) | None => JsExpr::Literal(JsLiteral::Null),
        _ => JsExpr::Literal(JsLiteral::Null),
    }
}

// ... 他のノードタイプの変換関数も同様に実装
```

### 実装手順

1. **expression_converter.rs を作成**
   ```bash
   touch src/compiler/phases/3_transform/client/visitors/expression_converter.rs
   ```

2. **mod.rs に追加**
   ```rust
   // src/compiler/phases/3_transform/client/visitors/mod.rs
   pub mod expression_converter;
   ```

3. **基本的な変換関数から実装**
   - Identifier
   - Literal
   - MemberExpression
   - BinaryExpression

4. **複雑な変換関数を追加**
   - CallExpression
   - ArrayExpression
   - ObjectExpression
   - FunctionExpression

5. **テストを書く**
   ```rust
   #[cfg(test)]
   mod tests {
       use super::*;

       #[test]
       fn test_convert_identifier() {
           // テストコード
       }

       #[test]
       fn test_convert_member_expression() {
           // テストコード
       }
   }
   ```

### 参照資料
- JavaScript 実装: `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/`
- ESTree 仕様: https://github.com/estree/estree
- 既存の実装: `src/compiler/phases/1_parse/read/expression.rs`

---

## 2️⃣ ScopeRoot アクセスの追加

### 目的
`ComponentClientTransformState` から `ScopeRoot` にアクセスできるようにし、バインディング情報を取得可能にします。

### 実装ステップ

#### Step 1: ComponentClientTransformState の拡張

```rust
// src/compiler/phases/3_transform/client/types.rs

pub struct ComponentClientTransformState<'a> {
    /// Current scope
    pub scope: &'a Scope,

    /// Scopes mapped to their corresponding nodes
    pub scopes: HashMap<String, &'a Scope>,

    /// Analysis results
    pub analysis: &'a ComponentAnalysis,

    /// ✨ NEW: Root scope with all bindings
    pub scope_root: &'a ScopeRoot,

    // ... 既存フィールド
}

impl<'a> ComponentClientTransformState<'a> {
    pub fn new(
        scope: &'a Scope,
        scope_root: &'a ScopeRoot,  // ✨ NEW
        analysis: &'a ComponentAnalysis,
        node: JsExpr,
    ) -> Self {
        Self {
            scope,
            scope_root,  // ✨ NEW
            scopes: HashMap::new(),
            analysis,
            // ... 既存の初期化
        }
    }

    /// バインディングを名前で取得
    pub fn get_binding(&self, name: &str) -> Option<&Binding> {
        let index = self.scope.declarations.get(name)?;
        self.scope_root.bindings.get(*index)
    }
}
```

#### Step 2: 呼び出し元の更新

ComponentClientTransformState を生成しているすべての場所を更新します。

```rust
// 例: src/compiler/phases/3_transform/client/mod.rs

pub fn transform_component(
    ast: &Root,
    analysis: &ComponentAnalysis,
    scope_root: &ScopeRoot,  // ✨ NEW
) -> Result<TransformOutput, TransformError> {
    let state = ComponentClientTransformState::new(
        &scope_root.scope,
        scope_root,  // ✨ NEW
        analysis,
        b::id("anchor"),
    );

    // ...
}
```

#### Step 3: validate_mutation の更新

```rust
// src/compiler/phases/3_transform/client/visitors/shared/utils.rs

pub fn validate_mutation(
    node: &JsAssignmentExpression,
    context: &ComponentContext,
    expression: JsExpr,
) -> JsExpr {
    // Early return if not in dev mode
    if !context.state.dev {
        return expression;
    }

    // Only validate member expressions
    let member_expr = match node.left.as_ref() {
        JsExpr::Member(m) => m,
        _ => return expression,
    };

    // Get the root object of the member expression
    let root_name = match get_root_object(member_expr) {
        Some(name) => name,
        None => return expression,
    };

    // ✨ NEW: バインディングを取得
    let binding = match context.state.get_binding(&root_name) {
        Some(b) => b,
        None => return expression,
    };

    // Only validate mutations to props
    use crate::compiler::phases::phase2_analyze::scope::BindingKind;
    if !matches!(binding.kind, BindingKind::Prop | BindingKind::BindableProp) {
        return expression;
    }

    // Build the property path array
    let path = build_member_path(member_expr, context);

    // Prepend the root name to the path
    let mut full_path = vec![b::string(&root_name)];
    full_path.extend(path);

    // Build the validation call
    let prop_alias = binding
        .prop_alias
        .as_ref()
        .unwrap_or(&binding.name)
        .clone();

    let mut args = vec![
        b::string(&prop_alias),
        b::array(full_path),
        expression,
    ];

    // TODO: Add source location when available
    // if let Some((line, column)) = loc {
    //     args.push(b::literal_number(line as f64));
    //     args.push(b::literal_number(column as f64));
    // }

    b::call(b::member_path("$$ownership_validator.mutation"), args)
}
```

### テスト

```rust
#[test]
fn test_validate_mutation_with_prop() {
    // テストコード
}

#[test]
fn test_validate_mutation_with_non_prop() {
    // テストコード
}
```

---

## 3️⃣ animate_directive.rs の完全実装

### 現在の問題

`visit_expression()` と `convert_blockers_to_js_array()` がプレースホルダー実装になっています。

### 完全実装

```rust
// src/compiler/phases/3_transform/client/visitors/animate_directive.rs

use crate::ast::template::AnimateDirective;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::client::visitors::shared::utils::parse_directive_name;
use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;

pub fn animate_directive(node: &AnimateDirective, context: &mut ComponentContext) {
    // Build the expression: either null or a thunk containing the visited expression
    let expression = if let Some(ref expr) = node.expression {
        // ✨ UPDATED: 実際の式変換を使用
        let visited_expr = convert_expression(expr, context);
        b::thunk(visited_expr)
    } else {
        b::null()
    };

    // Parse the directive name (e.g., "fade" or "custom.animation")
    let name_expr = parse_directive_name(&node.name);

    // Build the animation call: $.animation(node, () => name, expression)
    let mut statement = b::stmt(b::call(
        b::member_path("$.animation"),
        vec![
            context.state.node.clone(),
            b::thunk(name_expr),
            expression,
        ],
    ));

    // Check if the expression is async and wrap in $.run_after_blockers if needed
    if let Some(ref metadata) = node.metadata {
        if metadata.expression.is_async() {
            // ✨ UPDATED: ブロッカーの変換を実装
            let blockers_array = convert_blockers(&metadata.expression.blockers, context);

            statement = b::stmt(b::call(
                b::member_path("$.run_after_blockers"),
                vec![blockers_array, b::arrow_block(vec![], vec![statement])],
            ));
        }
    }

    // Add to after_update to ensure it runs after bind:this
    context.state.after_update.push(statement);
}

/// ✨ NEW: ブロッカーを JS 配列式に変換
fn convert_blockers(
    blockers: &[crate::ast::js::Expression],
    context: &mut ComponentContext,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::client::visitors::expression_converter::convert_expression;

    let blocker_exprs: Vec<_> = blockers
        .iter()
        .map(|blocker| convert_expression(blocker, context))
        .collect();

    b::array(blocker_exprs)
}
```

### 削除する関数

以下のプレースホルダー関数を削除：
- `visit_expression()` → `expression_converter::convert_expression()` を使用
- `convert_blockers_to_js_array()` → `convert_blockers()` に置き換え

---

## 4️⃣ assignment_expression.rs の完全実装

### 概要

これは最も複雑な実装です。JavaScript の実装（226行）を段階的に移植します。

### 前提条件

以下の機能が必要です：

1. ✅ Expression → JsExpr 変換（フェーズ1で実装）
2. ✅ ScopeRoot アクセス（フェーズ1で実装）
3. 新規: `get_rune()` 関数
4. 新規: `should_proxy()` 関数
5. 新規: `build_assignment_value()` 関数
6. 新規: `get_name()` 関数
7. 新規: `locate_node()` 関数

### 実装ステップ

#### Step 1: ヘルパー関数の実装

新規ファイル: `src/compiler/phases/3_transform/client/visitors/shared/assignment_helpers.rs`

```rust
use crate::compiler::phases::phase2_analyze::scope::Scope;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::ast::js::Expression;

/// ルーン呼び出しを検出
///
/// 式が $state、$derived、$derived.by などのルーン呼び出しかチェックします。
///
/// # Returns
///
/// ルーン名（"$state", "$derived", "$derived.by" など）、またはNone
pub fn get_rune(expr: &Expression, scope: &Scope) -> Option<String> {
    // TODO: Expression を解析してルーン呼び出しを検出
    //
    // JavaScript 実装:
    // export function get_rune(node, scope) {
    //     if (!node) return null;
    //     if (node.type !== 'CallExpression') return null;
    //
    //     const callee = node.callee.type === 'Identifier'
    //         ? node.callee.name
    //         : node.callee.type === 'MemberExpression'
    //             ? `${node.callee.object.name}.${node.callee.property.name}`
    //             : null;
    //
    //     if (!callee || !Runes.includes(callee)) return null;
    //
    //     const binding = scope.get(callee.split('.')[0]);
    //     return binding === null ? callee : null;
    // }

    None // プレースホルダー
}

/// 値がプロキシ化が必要か判定
///
/// オブジェクトや配列などの参照型は、リアクティビティのためにプロキシ化が必要です。
pub fn should_proxy(expr: &Expression, scope: &Scope) -> bool {
    // TODO: 式の型を解析してプロキシ化の必要性を判定
    //
    // JavaScript 実装:
    // export function should_proxy(node, scope) {
    //     if (!node) return false;
    //
    //     if (node.type === 'Literal') return false;
    //     if (node.type === 'TemplateLiteral' && node.expressions.length === 0) return false;
    //     if (node.type === 'ArrowFunctionExpression') return false;
    //     if (node.type === 'FunctionExpression') return false;
    //
    //     if (node.type === 'UnaryExpression') return should_proxy(node.argument, scope);
    //     if (node.type === 'BinaryExpression') {
    //         return should_proxy(node.left, scope) || should_proxy(node.right, scope);
    //     }
    //
    //     if (node.type === 'Identifier') {
    //         const binding = scope.get(node.name);
    //         if (binding && (binding.kind === 'state' || binding.kind === 'frozen_state')) {
    //             return false;
    //         }
    //     }
    //
    //     return true;
    // }

    false // プレースホルダー
}

/// 複合代入演算子を展開
///
/// `a += b` を `a = a + b` に展開します。
pub fn build_assignment_value(
    operator: &str,
    left: &JsExpr,
    right: &JsExpr,
) -> JsExpr {
    use crate::compiler::phases::phase3_transform::js_ast::builders as b;

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
        "||=" | "&&=" | "??=" => {
            // These are not expanded, handled separately
            right.clone()
        }
        _ => right.clone(),
    }
}

/// メンバー式のプロパティ名を取得
pub fn get_name(property: &JsMemberProperty) -> Option<String> {
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

/// ノードのソース位置を文字列化
///
/// 例: "file.svelte:10:5"
pub fn locate_node(node: &JsAssignmentExpression) -> String {
    // TODO: ソースマップやファイル情報にアクセスして位置を取得
    //
    // JavaScript 実装:
    // export function locate_node(node) {
    //     const location = locator(node.start);
    //     if (location) {
    //         return `${state.filename}:${location.line}:${location.column}`;
    //     }
    //     return '';
    // }

    "unknown:0:0".to_string() // プレースホルダー
}
```

#### Step 2: build_assignment 関数の完全実装

```rust
// src/compiler/phases/3_transform/client/visitors/assignment_expression.rs

use super::shared::assignment_helpers::*;
use super::shared::utils::validate_mutation;
use crate::compiler::phases::phase3_transform::client::types::*;
use crate::compiler::phases::phase3_transform::js_ast::builders as b;
use crate::compiler::phases::phase3_transform::js_ast::nodes::*;
use crate::ast::template::TemplateNode;

/// 非強制演算子かチェック
///
/// =, ||=, &&=, ??= は値を強制変換しない
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

/// 代入式を構築
fn build_assignment(
    operator: &str,
    left: &JsExpr,
    right: &JsExpr,
    context: &mut ComponentContext,
) -> Option<JsExpr> {
    // ルーンモードでメンバー式への代入の場合
    if context.state.analysis.runes {
        if let JsExpr::Member(member) = left {
            let name = get_name(&member.property);
            let field = name.as_ref()
                .and_then(|n| context.state.state_fields.get(n));

            if let Some(field) = field {
                // ケース 1: クラスコンストラクタ内のステートフィールド宣言
                if matches!(field.node.left.as_ref(), left_expr if left_expr == left) {
                    // 右辺がルーン呼び出しかチェック
                    // TODO: Expression から JsExpr への変換が必要
                    // let rune = get_rune(right, context.state.scope);

                    // if let Some(rune_name) = rune {
                    //     let in_constructor = rune_name != "$derived" && rune_name != "$derived.by";
                    //
                    //     let mut child_state = context.state.clone();
                    //     child_state.in_constructor = in_constructor;
                    //
                    //     // Visit with new state
                    //     let mut value = visit_with_state(right, &child_state);
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

                // ケース 2: プライベートフィールドへの代入
                if matches!(member.property, JsMemberProperty::PrivateIdentifier(_)) {
                    // TODO: visit right and build_assignment_value
                    // let value = visit(build_assignment_value(operator, left, right));
                    //
                    // let needs_proxy = field.field_type == "$state"
                    //     && is_non_coercive_operator(operator)
                    //     && should_proxy(right, context.state.scope);
                    //
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
        }
    }

    // ルート識別子を取得
    let mut object = left.clone();
    while let JsExpr::Member(m) = object {
        object = (*m.object).clone();
    }

    let object_name = match &object {
        JsExpr::Identifier(name) => name,
        _ => return None,
    };

    // バインディングを取得
    let binding = context.state.get_binding(object_name)?;

    // トランスフォームを取得
    let transform = context.state.transform.get(object_name);

    // パスを取得（コンテキスト判定用）
    let path: Vec<&str> = context.path.iter()
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
            // TODO: BindDirective などの判定
            _ => "Unknown",
        })
        .collect();

    // ケース 3: 再代入（object === left）
    if object == *left {
        if let Some(t) = transform {
            if let Some(assign_fn) = t.assign {
                // プリミティブかチェック
                let is_primitive = path.last() == Some(&"BindDirective")
                    && (path.get(path.len().saturating_sub(2)) == Some(&"RegularElement"));

                // TODO: visit right and build_assignment_value
                // let value = visit(build_assignment_value(operator, left, right));
                //
                // let needs_proxy = !is_primitive
                //     && !matches!(binding.kind,
                //         BindingKind::Prop | BindingKind::BindableProp |
                //         BindingKind::RawState | BindingKind::Derived | BindingKind::StoreSub)
                //     && context.state.analysis.runes
                //     && should_proxy(right, context.state.scope)
                //     && is_non_coercive_operator(operator);
                //
                // return Some(assign_fn(object.clone(), value, needs_proxy));
            }
        }
    }

    // ケース 4: 変更（mutation）
    if let Some(t) = transform {
        if let Some(mutate_fn) = t.mutate {
            // TODO: visit left and right
            // let visited_left = visit(left);
            // let visited_right = visit(right);
            //
            // return Some(mutate_fn(
            //     object.clone(),
            //     b::assign_op(operator, visited_left, visited_right),
            // ));
        }
    }

    // ケース 5: プロキシ化が必要な代入
    let mut should_transform = context.state.dev
        && path.last() != Some(&"ExpressionStatement")
        && is_non_coercive_operator(operator);

    // 特殊ケース: イベントハンドラ内の代入は無視
    if path.last() == Some(&"ArrowFunctionExpression")
        && (path.get(path.len().saturating_sub(2)) == Some(&"RegularElement")
            || path.get(path.len().saturating_sub(2)) == Some(&"SvelteElement"))
    {
        // TODO: 属性がイベントハンドラかチェック
        should_transform = false;
    }

    // 特殊ケース: bind: ディレクティブ内は無視
    if path.last() == Some(&"BindDirective")
        || path.last() == Some(&"Component")
        || path.last() == Some(&"SvelteComponent")
    {
        should_transform = false;
    }

    if let JsExpr::Member(member) = left {
        if should_transform {
            let callee = get_assign_callee(operator);

            let property_expr = match &member.property {
                JsMemberProperty::Identifier(name) if !member.computed => {
                    b::string(name)
                }
                JsMemberProperty::Identifier(name) => {
                    b::id(name)
                }
                JsMemberProperty::Expression(expr) => {
                    (**expr).clone()
                }
                JsMemberProperty::PrivateIdentifier(name) => {
                    b::string(name)
                }
            };

            // TODO: visit right
            // let visited_right = visit(right);

            let loc = locate_node(&JsAssignmentExpression {
                operator: JsAssignmentOp::Assign,
                left: Box::new(left.clone()),
                right: Box::new(right.clone()),
            });

            return Some(b::call(
                b::member_path(callee),
                vec![
                    (*member.object).clone(),
                    property_expr,
                    right.clone(), // TODO: visited_right
                    b::string(&loc),
                ],
            ));
        }
    }

    None
}

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

#### Step 3: IdentifierTransform の拡張

```rust
// src/compiler/phases/3_transform/client/types.rs

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

## 🧪 テスト戦略

### ユニットテスト

各関数に対してテストを書きます：

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_get_rune_state() {
        // $state() 呼び出しを検出
    }

    #[test]
    fn test_should_proxy_object() {
        // オブジェクトリテラルはプロキシ化が必要
    }

    #[test]
    fn test_build_assignment_value_add() {
        // += を + に展開
    }
}
```

### 統合テスト

実際の Svelte コンポーネントをコンパイルして確認：

```svelte
<!-- tests/fixtures/assignment.svelte -->
<script>
  let count = $state(0);

  function increment() {
    count += 1;  // これが正しく変換されるか
  }
</script>
```

### リグレッションテスト

既存のテストが壊れていないことを確認：

```bash
cargo test
npm run compatibility-report
```

---

## 📚 参照資料

### JavaScript の元実装

| ファイル | パス |
|---------|------|
| AnimateDirective | `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AnimateDirective.js` |
| AssignmentExpression | `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/AssignmentExpression.js` |
| function | `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/function.js` |
| utils | `svelte/packages/svelte/src/compiler/phases/3-transform/client/visitors/shared/utils.js` |
| scope utilities | `svelte/packages/svelte/src/compiler/phases/3-transform/scope.js` |
| ast utilities | `svelte/packages/svelte/src/compiler/utils/ast.js` |

### 関連する Rust モジュール

- `src/ast/js.rs` - JavaScript AST 定義
- `src/compiler/phases/2_analyze/scope.rs` - スコープとバインディング
- `src/compiler/phases/3_transform/js_ast/` - JS AST ビルダーとコード生成
- `src/compiler/phases/3_transform/client/types.rs` - 変換コンテキスト

### 外部リソース

- [ESTree 仕様](https://github.com/estree/estree) - JavaScript AST の標準仕様
- [Svelte コンパイラドキュメント](https://github.com/sveltejs/svelte/tree/main/packages/svelte/src/compiler)

---

## ✅ チェックリスト

### フェーズ 1: 基盤整備

- [ ] `expression_converter.rs` を作成
  - [ ] `convert_expression()` の基本実装
  - [ ] `convert_identifier()` の実装
  - [ ] `convert_literal()` の実装
  - [ ] `convert_member_expression()` の実装
  - [ ] `convert_call_expression()` の実装
  - [ ] その他の ESTree ノードタイプの実装
  - [ ] ユニットテストの作成

- [ ] ScopeRoot アクセスの追加
  - [ ] `ComponentClientTransformState` に `scope_root` フィールドを追加
  - [ ] `get_binding()` メソッドの実装
  - [ ] すべての呼び出し元を更新
  - [ ] テストの更新

### フェーズ 2: 中核機能

- [ ] `animate_directive.rs` の完全実装
  - [ ] `convert_expression()` の使用
  - [ ] `convert_blockers()` の実装
  - [ ] プレースホルダー関数の削除
  - [ ] テストの作成

- [ ] `validate_mutation` の完全実装
  - [ ] `get_binding()` の使用
  - [ ] プロパティパスの構築
  - [ ] 所有権検証呼び出しの生成
  - [ ] ソース位置の取得（オプション）
  - [ ] テストの作成

### フェーズ 3: 高度な機能

- [ ] `assignment_helpers.rs` の作成
  - [ ] `get_rune()` の実装
  - [ ] `should_proxy()` の実装
  - [ ] `build_assignment_value()` の実装
  - [ ] `get_name()` の実装
  - [ ] `locate_node()` の実装
  - [ ] ユニットテスト

- [ ] `assignment_expression.rs` の完全実装
  - [ ] `is_non_coercive_operator()` の実装
  - [ ] `get_assign_callee()` の実装
  - [ ] `build_assignment()` の段階的実装
    - [ ] ルーンモードのステートフィールド代入
    - [ ] プライベートフィールド代入
    - [ ] トランスフォーム適用（再代入）
    - [ ] トランスフォーム適用（変更）
    - [ ] プロキシ化が必要な代入
  - [ ] `assignment_expression()` の実装
  - [ ] 統合テスト

### 最終確認

- [ ] すべてのユニットテストがパス
- [ ] 統合テストがパス
- [ ] リグレッションテストがパス（`cargo test`）
- [ ] 互換性レポートの確認（`npm run compatibility-report`）
- [ ] コードレビュー
- [ ] ドキュメントの更新

---

## 🚀 推奨実装スケジュール

### Week 1: 基盤整備
- Day 1-2: `expression_converter.rs` の基本実装
- Day 3-4: ESTree ノードタイプの完全実装
- Day 5: ScopeRoot アクセスの追加とテスト

### Week 2: 中核機能
- Day 1-2: `animate_directive.rs` の完全実装とテスト
- Day 3-4: `validate_mutation` の完全実装とテスト
- Day 5: 統合テストとバグ修正

### Week 3: 高度な機能
- Day 1-2: `assignment_helpers.rs` の実装
- Day 3-5: `assignment_expression.rs` の段階的実装

### Week 4: テストと仕上げ
- Day 1-3: 統合テストとバグ修正
- Day 4: ドキュメント整備
- Day 5: 最終レビューとリリース準備

---

## 💡 ヒント

1. **段階的に実装する**: すべてを一度に実装しようとせず、小さな部分から始めて徐々に拡張します。

2. **テストファーストで進める**: 各関数の実装前にテストを書くことで、仕様を明確化できます。

3. **JavaScript 実装を参照する**: 詰まったら元の JavaScript 実装を読み返します。ロジックは同じです。

4. **コンパイルエラーを恐れない**: 型エラーは Rust コンパイラが教えてくれる無料のレビューです。

5. **プレースホルダーを活用する**: 完全実装できない部分は TODO コメントとプレースホルダーを残して先に進みます。

6. **コミュニティに相談する**: 詰まったら GitHub Issue や Discord で質問しましょう。

---

## 📝 完了後のアクション

実装が完了したら：

1. Pull Request を作成
2. CI/CD でテストが通ることを確認
3. 互換性レポートを更新
4. AGENTS.md を更新
5. このガイドを更新（新しい知見を追加）

---

**Good luck! 🎉**

このガイドに従って実装すれば、Phase 3 Transform の完全実装に到達できます。
段階的に進めることが成功の鍵です。
