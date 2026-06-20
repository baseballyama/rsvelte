//! AST-based server template/script visitors (Phase-3 rewrite).
//!
//! This module will host the Rust ports of every server visitor in
//! `submodules/svelte/packages/svelte/src/compiler/phases/3-transform/server/visitors/`.
//! Each visitor consumes a Svelte template/JS node and appends real oxc AST
//! statements/expressions to the [`super::ServerTransformState`] output
//! buffers — no text processing. Nothing is implemented yet; this file
//! documents the fan-out surface so the port can proceed visitor-by-visitor.
//!
//! Upstream visitor inventory (38 — `template_visitors` + `global_visitors`):
//!
//! Template visitors:
// TODO: Fragment
// TODO: RegularElement
// TODO: SvelteElement
// TODO: Component
// TODO: SvelteComponent
// TODO: SvelteSelf
// TODO: SvelteFragment
// TODO: SvelteBoundary
// TODO: SvelteHead
// TODO: TitleElement
// TODO: SlotElement
// TODO: EachBlock
// TODO: IfBlock
// TODO: AwaitBlock
// TODO: KeyBlock
// TODO: SnippetBlock
// TODO: RenderTag
// TODO: HtmlTag
// TODO: ConstTag
// TODO: ExpressionTag
// TODO: Text
// TODO: Comment
// TODO: BindDirective
// TODO: LetDirective
// TODO: ClassDirective
// TODO: StyleDirective
// TODO: AttachTag
//!
//! Global (script / JS) visitors:
// TODO: VariableDeclaration
// TODO: ExpressionStatement
// TODO: CallExpression
// TODO: AssignmentExpression
// TODO: UpdateExpression
// TODO: Identifier
// TODO: MemberExpression
// TODO: PropertyDefinition
// TODO: ImportDeclaration (instance-script: hoist)
// TODO: ExportNamedDeclaration (instance-script: unwrap declaration)
// TODO: LabeledStatement (legacy reactive `$:`)
