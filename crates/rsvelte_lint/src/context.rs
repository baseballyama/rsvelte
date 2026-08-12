//! [`LintContext`] — the handle a rule uses to report findings.
//!
//! The visitor sets the "current rule" + its resolved severity before invoking
//! each hook, so `report*` calls don't have to thread the rule id or severity
//! through every call site (port of `vize_patina`'s `context.rs`). The context
//! also borrows the resolved [`LintConfig`] so a rule can read its own parsed
//! options via [`LintContext::option_bool`] / [`LintContext::option_str_list`].

use std::cell::OnceCell;
use std::path::Path;
use std::rc::Rc;

use serde_json::Value;

use rsvelte_core::compiler::phases::phase2_analyze::ComponentAnalysis;

use crate::config::LintConfig;
use crate::diagnostic::{Fix, LintDiagnostic, Suggestion};
use crate::rule::{RuleMeta, Severity};

/// Per-file lint context shared across all rules during the single AST walk.
pub struct LintContext<'a> {
    diagnostics: Vec<LintDiagnostic>,
    cur_rule: &'static str,
    cur_severity: Severity,
    config: &'a LintConfig,
    source: &'a str,
    /// The file name (base name only, e.g. `+page.svelte`), used by rules that
    /// need to gate on the `SvelteKit` route file type.
    filename: &'a str,
    /// Path of the file being linted, when known. `None` in contexts with no
    /// filesystem (the wasm playground, or linting an in-memory string). Rules
    /// that inspect sibling files on disk (e.g.
    /// `svelte/no-companion-module-shadow`) must no-op when this is `None`.
    path: Option<&'a Path>,
    /// Script-scope resolver (oxc-semantic-backed), built once per file by the
    /// engine and borrowed here. `None` when no resolver was built (e.g. the
    /// rule that needs it is disabled). Rules use it to distinguish a real
    /// global reference from a local binding that shares a global's name.
    scope_resolver: Option<&'a crate::scope::ScopeResolver>,
    /// The component's Phase-2 analysis (bindings/scopes), run on first use.
    /// Running it costs a full parse + analyze — several rules need it, so they
    /// share one result per file instead of each re-analyzing the source.
    /// `None` records an analysis failure (rules fall back to their own scan).
    /// `(content_offset, end)` of the component's `<script>` blocks, taken from
    /// the `Root` the pass already parsed. Rules that only need script bounds
    /// used to re-parse the whole source to recover them.
    script_spans: Vec<(u32, u32)>,
    scope_analysis: OnceCell<Option<Rc<ComponentAnalysis>>>,
    /// The template fragment as `ESTree` JSON (default parse options), built on
    /// first use — several script rules scan template expressions and would
    /// otherwise each re-parse and re-serialize the whole source.
    template_fragment_json: OnceCell<Rc<Value>>,
    /// The component's template AST as `ESTree` JSON, serialized on first use.
    /// Several rules walk the whole tree generically; serializing it is one of
    /// the most expensive things a lint pass does, so they share one value.
    /// `Value::Null` records a serialization failure (rules bail on it).
    root_json: OnceCell<Rc<Value>>,
}

impl<'a> LintContext<'a> {
    #[must_use]
    pub const fn new(config: &'a LintConfig, source: &'a str, filename: &'a str) -> Self {
        Self {
            diagnostics: Vec::new(),
            cur_rule: "",
            cur_severity: Severity::Warn,
            config,
            source,
            filename,
            path: None,
            scope_resolver: None,
            script_spans: Vec::new(),
            scope_analysis: OnceCell::new(),
            template_fragment_json: OnceCell::new(),
            root_json: OnceCell::new(),
        }
    }

    /// Attach the path of the file being linted (builder style). Left `None` by
    /// default so string / wasm callers are unaffected.
    #[must_use]
    pub const fn with_path(mut self, path: Option<&'a Path>) -> Self {
        self.path = path;
        self
    }

    /// Attach the component's `<script>` spans (builder style).
    #[must_use]
    pub fn with_script_spans(mut self, spans: Vec<(u32, u32)>) -> Self {
        self.script_spans = spans;
        self
    }

    /// `(content_offset, end)` for each `<script>` block, empty when unknown.
    pub fn script_spans(&self) -> &[(u32, u32)] {
        &self.script_spans
    }

    /// Attach the script-scope resolver (builder style). Left `None` by default.
    #[must_use]
    pub const fn with_scope_resolver(
        mut self,
        resolver: Option<&'a crate::scope::ScopeResolver>,
    ) -> Self {
        self.scope_resolver = resolver;
        self
    }

    /// The component's Phase-2 analysis, run once per file and shared by every
    /// rule that asks for it. `None` when the component fails to analyze (an
    /// invalid component still lints — rules fall back to a parse-only scan).
    pub fn scope_analysis(&self) -> Option<Rc<ComponentAnalysis>> {
        self.scope_analysis
            .get_or_init(|| crate::scope::analyze_scope(self.source).map(Rc::new))
            .clone()
    }

    /// The component's template AST as `ESTree` JSON, serialized once per file
    /// and shared by every rule that asks for it. Returns `Value::Null` if the
    /// tree could not be serialized. The `Rc` handout keeps the borrow off
    /// `self`, so a rule can report while holding the JSON.
    pub fn root_json(&self, root: &rsvelte_core::ast::template::Root) -> Rc<Value> {
        self.root_json
            .get_or_init(|| {
                Rc::new(rsvelte_core::ast::arena::with_serialize_arena(
                    &root.arena,
                    || serde_json::to_value(root).unwrap_or(Value::Null),
                ))
            })
            .clone()
    }

    /// The `fragment` of the shared root JSON (same lenient parse the lint pass
    /// already did), for rules that hold the `Root` and only walk the template.
    pub fn root_fragment_json(
        &self,
        root: &rsvelte_core::ast::template::Root,
    ) -> Option<Rc<Value>> {
        let json = self.root_json(root);
        json.get("fragment").is_some().then_some(json)
    }

    /// The template fragment as `ESTree` JSON, parsed with the *default* options
    /// (not the lenient lint options — a script rule scanning template
    /// expressions must see what the strict parse produces) and cached per
    /// file. Script rules reach the template through this instead of
    /// re-parsing + re-serializing the source on every call.
    pub fn template_fragment_json(&self) -> Rc<Value> {
        self.template_fragment_json
            .get_or_init(|| {
                let alloc = rsvelte_core::Allocator::default();
                let Ok(root) =
                    rsvelte_core::parse(self.source, &alloc, rsvelte_core::ParseOptions::default())
                else {
                    return Rc::new(Value::Null);
                };
                Rc::new(rsvelte_core::ast::arena::with_serialize_arena(
                    &root.arena,
                    || serde_json::to_value(&root.fragment).unwrap_or(Value::Null),
                ))
            })
            .clone()
    }

    /// The script-scope resolver for this file, when one was built.
    pub const fn scope_resolver(&self) -> Option<&'a crate::scope::ScopeResolver> {
        self.scope_resolver
    }

    /// The path of the file being linted, when known. `None` for in-memory /
    /// wasm linting (no filesystem).
    pub const fn path(&self) -> Option<&'a Path> {
        self.path
    }

    /// The base file name of the file being linted (e.g. `+page.svelte`).
    pub const fn filename(&self) -> &'a str {
        self.filename
    }

    /// The full source text of the file being linted.
    pub const fn source(&self) -> &'a str {
        self.source
    }

    /// The source slice for a byte range, clamped to the source bounds.
    pub fn slice(&self, start: u32, end: u32) -> &'a str {
        let (s, e) = (start as usize, end as usize);
        if s <= e && e <= self.source.len() {
            &self.source[s..e]
        } else {
            ""
        }
    }

    /// Called by the visitor immediately before dispatching a hook on `meta`.
    pub const fn enter_rule(&mut self, meta: &RuleMeta, severity: Severity) {
        self.cur_rule = meta.name;
        self.cur_severity = severity;
    }

    /// The raw options for the current rule: the `[…]` array of everything
    /// after the severity (`ESLint` rule options are variadic). `None` when the
    /// rule was configured without options.
    pub fn options(&self) -> Option<&Value> {
        self.config.options_for(self.cur_rule)
    }

    /// The first options element (`options[0]`) — the conventional single
    /// options object most rules use.
    pub fn option0(&self) -> Option<&Value> {
        match self.options()? {
            Value::Array(a) => a.first(),
            v => Some(v),
        }
    }

    /// Read a boolean from the first options object, falling back to `default`.
    pub fn option_bool(&self, key: &str, default: bool) -> bool {
        self.option0()
            .and_then(|o| o.get(key))
            .and_then(Value::as_bool)
            .unwrap_or(default)
    }

    /// Read a `string[]` from the first options object (empty when absent).
    pub fn option_str_list(&self, key: &str) -> Vec<String> {
        self.option0()
            .and_then(|o| o.get(key))
            .and_then(Value::as_array)
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_default()
    }

    /// Report a finding spanning `[start, end)` (UTF-8 byte offsets).
    pub fn report(&mut self, start: u32, end: u32, message: impl Into<String>) {
        self.push(start, end, message.into(), None, None, Vec::new());
    }

    /// Report with an attached `help:` note.
    pub fn report_with_help(
        &mut self,
        start: u32,
        end: u32,
        message: impl Into<String>,
        help: impl Into<String>,
    ) {
        self.push(
            start,
            end,
            message.into(),
            Some(help.into()),
            None,
            Vec::new(),
        );
    }

    /// Report with an autofix.
    pub fn report_with_fix(&mut self, start: u32, end: u32, message: impl Into<String>, fix: Fix) {
        self.push(start, end, message.into(), None, Some(fix), Vec::new());
    }

    /// Report with editor suggestions (code actions never applied by `--fix`).
    /// Mirrors `ESLint`'s `suggest`: the finding itself has no autofix, but offers
    /// one or more named suggestions.
    pub fn report_with_suggestions(
        &mut self,
        start: u32,
        end: u32,
        message: impl Into<String>,
        suggestions: Vec<Suggestion>,
    ) {
        self.push(start, end, message.into(), None, None, suggestions);
    }

    fn push(
        &mut self,
        start: u32,
        end: u32,
        message: String,
        help: Option<String>,
        fix: Option<Fix>,
        suggestions: Vec<Suggestion>,
    ) {
        self.diagnostics.push(LintDiagnostic {
            rule: self.cur_rule.to_string(),
            severity: self.cur_severity,
            message,
            start,
            end,
            help,
            fix,
            suggestions,
        });
    }

    /// Consume the context, returning the collected findings.
    pub fn into_diagnostics(self) -> Vec<LintDiagnostic> {
        self.diagnostics
    }
}
