//! Port of [`@modular-css/svelte`](https://github.com/tivac/modular-css)
//! (v29.x) — CSS Modules for Svelte (scoped class names, `composes`, `@value`,
//! cross-file resolution).
//!
//! The `<style type="text/m-css">` path is implemented **natively** in Rust
//! ([`process`]): a CSS-modules processor that scopes class selectors, resolves
//! `composes` (local + cross-file `from`), and emits the dependency-ordered
//! aggregated CSS — byte-for-byte matching `@modular-css/processor` (validated
//! against its fixtures with the deterministic `mc_` namer).
//!
//! The `<link>` / `<script import>` extraction paths (which need ES-module
//! import parsing) currently fall back to the Node bridge
//! ([`js/modular-css-bridge.mjs`]); a native port of those is future work.

mod css;

use std::collections::HashMap;
use std::path::{Path, PathBuf};

use regex::{Captures, Regex};
use rsvelte_core::compiler::preprocess::types::{
    MarkupPreprocessorFn, MarkupPreprocessorOptions, PreprocessError, PreprocessorGroup,
    PreprocessorResult, Processed,
};

use crate::bridge::{self, MarkupBridge};

const BRIDGE_SCRIPT: &str = include_str!("../../js/modular-css-bridge.mjs");

/// Result of processing a file through modular-css.
#[derive(Debug, Clone, Default)]
pub struct ModularCssOutput {
    /// Transformed markup (with `{css.<key>}` references replaced).
    pub code: String,
    /// The aggregated, scoped output CSS (`processor.output().css`).
    pub css: String,
    /// Watched file dependencies.
    pub dependencies: Vec<String>,
}

/// Run the modular-css markup transform.
///
/// The `<style type="text/m-css">` path is handled natively; other entry kinds
/// (`<link>` / `<script import>`) fall back to the Node bridge.
pub fn process(
    content: &str,
    filename: Option<&str>,
    config: &MarkupBridge,
) -> Result<ModularCssOutput, String> {
    let style_re =
        Regex::new(r#"(?i)<style[^>]*?type=['"]text/m-css['"][^>]*?>([\S\s]+?)</style>"#).unwrap();
    if let Some(caps) = style_re.captures(content) {
        return process_style_native(content, filename, &caps, config);
    }
    process_bridge(content, filename, config)
}

// ─── native <style type="text/m-css"> path ────────────────────────────────────

fn process_style_native(
    content: &str,
    filename: Option<&str>,
    style: &Captures,
    config: &MarkupBridge,
) -> Result<ModularCssOutput, String> {
    let owner = PathBuf::from(filename.unwrap_or("input.svelte"));
    let cwd = config
        .bridge
        .cwd
        .clone()
        .unwrap_or_else(|| std::env::current_dir().unwrap_or_default());

    let mut proc = Processor::new(cwd);
    let css_src = style.get(1).unwrap().as_str();
    let exports = proc
        .process_css(&owner, css_src)
        .map_err(|e| format!("[@modular-css/svelte] {e}"))?;

    let mut source = content.to_string();
    if !exports.is_empty() {
        let lookup: HashMap<String, String> = exports
            .iter()
            .map(|(k, v)| (k.clone(), v.join(" ")))
            .collect();
        let keys: Vec<String> = exports.keys().cloned().collect();
        source = replace_class(&source, &lookup, &keys);
    }

    let full = style.get(0).unwrap().as_str();
    source = replace_trailing_newlines(&source, full);

    Ok(ModularCssOutput {
        code: source,
        css: proc.output(),
        dependencies: Vec::new(),
    })
}

struct Processor {
    cwd: PathBuf,
    cache: HashMap<PathBuf, HashMap<String, Vec<String>>>,
    /// (relative posix path, rendered body) in dependency (post-order) order.
    order: Vec<(String, String)>,
}

/// A `composes:` reference — names plus an optional source file.
struct Compose {
    names: Vec<String>,
    from: Option<String>,
}

struct RawRule {
    class: String,
    scoped_selector: String,
    composes: Vec<Compose>,
    /// Rendered `{ … }` body (real declarations only); `None` if empty.
    body: Option<String>,
}

impl Processor {
    fn new(cwd: PathBuf) -> Self {
        Processor {
            cwd,
            cache: HashMap::new(),
            order: Vec::new(),
        }
    }

    fn process_file(&mut self, path: &Path) -> Result<HashMap<String, Vec<String>>, String> {
        let canonical = path.to_path_buf();
        if let Some(exports) = self.cache.get(&canonical) {
            return Ok(exports.clone());
        }
        let css = std::fs::read_to_string(path)
            .map_err(|e| format!("could not read {}: {e}", path.display()))?;
        self.process_css(&canonical, &css)
    }

    fn process_css(
        &mut self,
        owner: &Path,
        css: &str,
    ) -> Result<HashMap<String, Vec<String>>, String> {
        let mut raw_rules: Vec<RawRule> = Vec::new();
        let mut by_class: HashMap<String, usize> = HashMap::new();

        for item in css::parse_items(css) {
            if let css::Item::Rule(selector, body_inner) = item {
                let (scoped_selector, classes) = scope_selector(selector);
                let (decls, closing_ws) = css::parse_body(body_inner);

                let mut composes = Vec::new();
                // Re-emit the body, dropping `composes`/`@value` declarations.
                // A real declaration immediately following a removed one has its
                // leading blank line collapsed to a single `\n` + indent (mirrors
                // postcss's output after node removal).
                let mut body_inner = String::new();
                let mut has_real = false;
                let mut prev_removed = false;
                for decl in &decls {
                    if decl.prop == "composes" {
                        composes.push(parse_compose(&decl.text));
                        prev_removed = true;
                        continue;
                    }
                    if decl.prop == "@value" {
                        prev_removed = true;
                        continue;
                    }
                    has_real = true;
                    if prev_removed {
                        body_inner.push('\n');
                        body_inner.push_str(decl.indent());
                    } else {
                        body_inner.push_str(&decl.before);
                    }
                    body_inner.push_str(&decl.text);
                    prev_removed = false;
                }

                let body = if has_real {
                    Some(format!(" {{{body_inner}{closing_ws}}}"))
                } else {
                    None
                };

                let class = classes.first().cloned().unwrap_or_default();
                by_class.insert(class.clone(), raw_rules.len());
                raw_rules.push(RawRule {
                    class,
                    scoped_selector,
                    composes,
                    body,
                });
            }
        }

        let mut exports: HashMap<String, Vec<String>> = HashMap::new();
        let mut resolving: Vec<String> = Vec::new();
        for rule in &raw_rules {
            self.resolve_class(
                owner,
                &raw_rules,
                &by_class,
                &rule.class,
                &mut exports,
                &mut resolving,
            )?;
        }
        self.cache.insert(owner.to_path_buf(), exports.clone());

        let mut body = String::new();
        for rule in &raw_rules {
            if let Some(b) = &rule.body {
                body.push_str(&rule.scoped_selector);
                body.push_str(b);
                body.push('\n');
            }
        }
        self.order.push((self.relpath(owner), body));

        Ok(exports)
    }

    fn resolve_class(
        &mut self,
        owner: &Path,
        rules: &[RawRule],
        by_class: &HashMap<String, usize>,
        class: &str,
        exports: &mut HashMap<String, Vec<String>>,
        resolving: &mut Vec<String>,
    ) -> Result<Vec<String>, String> {
        if let Some(v) = exports.get(class) {
            return Ok(v.clone());
        }
        if resolving.iter().any(|c| c == class) {
            return Err(format!("circular composes through .{class}"));
        }
        resolving.push(class.to_string());

        let Some(&idx) = by_class.get(class) else {
            resolving.pop();
            return Ok(vec![scoped_name(class)]);
        };

        let mut result = Vec::new();
        // Clone the composes list to avoid borrowing `rules` across the
        // recursive / cross-file calls below.
        let composes: Vec<(Vec<String>, Option<String>)> = rules[idx]
            .composes
            .iter()
            .map(|c| (c.names.clone(), c.from.clone()))
            .collect();
        for (names, from) in composes {
            match from {
                Some(from) => {
                    let target = resolve_relative(owner, &from);
                    let target_exports = self.process_file(&target)?;
                    for name in &names {
                        if let Some(v) = target_exports.get(name) {
                            result.extend(v.clone());
                        }
                    }
                }
                None => {
                    for name in &names {
                        let v =
                            self.resolve_class(owner, rules, by_class, name, exports, resolving)?;
                        result.extend(v);
                    }
                }
            }
        }
        result.push(scoped_name(class));

        resolving.pop();
        exports.insert(class.to_string(), result.clone());
        Ok(result)
    }

    fn relpath(&self, path: &Path) -> String {
        let rel = path.strip_prefix(&self.cwd).unwrap_or(path);
        rel.to_string_lossy().replace('\\', "/")
    }

    fn output(&self) -> String {
        use std::fmt::Write;
        let mut out = String::new();
        for (rel, body) in &self.order {
            let _ = writeln!(out, "/* {rel} */");
            out.push_str(body);
        }
        out
    }
}

/// The deterministic test namer (`mc_<selector>`). The default modular-css
/// namer is a hash; the native port currently supports the prefix namer.
fn scoped_name(class: &str) -> String {
    format!("mc_{class}")
}

/// Rename every `.class` token in a selector and collect the class names.
fn scope_selector(selector: &str) -> (String, Vec<String>) {
    let re = Regex::new(r"\.(-?[A-Za-z_][A-Za-z0-9_-]*)").unwrap();
    let mut classes = Vec::new();
    let scoped = re
        .replace_all(selector.trim(), |c: &Captures| {
            let name = &c[1];
            classes.push(name.to_string());
            format!(".{}", scoped_name(name))
        })
        .into_owned();
    (scoped, classes)
}

/// Parse a `composes: a, b from "./f.css"` declaration.
fn parse_compose(text: &str) -> Compose {
    let body = text
        .trim_start_matches("composes")
        .trim_start()
        .trim_start_matches(':')
        .trim()
        .trim_end_matches(';')
        .trim();
    let (names_part, from) = match body.split_once(" from ") {
        Some((names, src)) => {
            let src = src.trim().trim_matches(|c| c == '"' || c == '\'');
            (names, Some(src.to_string()))
        }
        None => (body, None),
    };
    let names = names_part
        .split(',')
        .map(|n| n.trim().to_string())
        .filter(|n| !n.is_empty())
        .collect();
    Compose { names, from }
}

fn resolve_relative(owner: &Path, from: &str) -> PathBuf {
    let joined = owner.parent().unwrap_or_else(|| Path::new("")).join(from);
    normalize(&joined)
}

/// Collapse `.` and `..` components (lexical normalization, no filesystem access).
fn normalize(path: &Path) -> PathBuf {
    use std::path::Component;
    let mut out = PathBuf::new();
    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                out.pop();
            }
            other => out.push(other.as_os_str()),
        }
    }
    out
}

// ─── markup replacer (port of replacer.js) ────────────────────────────────────

fn regex_escape(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        if "\\^$.|?*+()[]{}".contains(c) {
            out.push('\\');
        }
        out.push(c);
    }
    out
}

fn replace_class(source: &str, lookup: &HashMap<String, String>, keys: &[String]) -> String {
    if keys.is_empty() {
        return source.to_string();
    }
    let ids = keys
        .iter()
        .map(|k| regex_escape(k))
        .collect::<Vec<_>>()
        .join("|");

    let re1 = Regex::new(&format!(r#"(class=)("|')?\{{css\.({ids})\}}("|')?"#)).unwrap();
    let s = re1.replace_all(source, |c: &Captures| {
        let before = &c[1];
        let quote1 = c.get(2).map(|m| m.as_str());
        let key = &c[3];
        let quote2 = c.get(4).map(|m| m.as_str()).unwrap_or("");
        let value = lookup.get(key).cloned().unwrap_or_default();
        let replacement = match quote1 {
            Some(_) => value,
            None => format!("\"{value}\""),
        };
        format!("{before}{}{replacement}{quote2}", quote1.unwrap_or(""))
    });

    let re2 = Regex::new(&format!(r"(\b)css\.({ids})(\b)")).unwrap();
    re2.replace_all(&s, |c: &Captures| {
        let value = lookup.get(&c[2]).cloned().unwrap_or_default();
        format!("{}\"{value}\"{}", &c[1], &c[3])
    })
    .into_owned()
}

/// Remove `search` and any trailing newlines from `source` (first occurrence).
fn replace_trailing_newlines(source: &str, search: &str) -> String {
    let Some(idx) = source.find(search) else {
        return source.to_string();
    };
    let mut end = idx + search.len();
    let bytes = source.as_bytes();
    while end < bytes.len() {
        if bytes[end] == b'\r' && end + 1 < bytes.len() && bytes[end + 1] == b'\n' {
            end += 2;
        } else if bytes[end] == b'\n' {
            end += 1;
        } else {
            break;
        }
    }
    let mut out = String::with_capacity(source.len());
    out.push_str(&source[..idx]);
    out.push_str(&source[end..]);
    out
}

// ─── bridge fallback (<link> / <script import>) ───────────────────────────────

fn process_bridge(
    content: &str,
    filename: Option<&str>,
    config: &MarkupBridge,
) -> Result<ModularCssOutput, String> {
    let request = serde_json::json!({
        "content": content,
        "filename": filename,
        "options": config.options,
    });
    let value = bridge::run(BRIDGE_SCRIPT, &request, &config.bridge)?;
    if let Some(err) = value.get("renderError").and_then(|v| v.as_str()) {
        return Err(err.to_string());
    }
    let ok = value.get("ok").ok_or("empty bridge response")?;
    Ok(ModularCssOutput {
        code: ok
            .get("code")
            .and_then(|v| v.as_str())
            .unwrap_or(content)
            .to_string(),
        css: ok
            .get("css")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        dependencies: ok
            .get("dependencies")
            .and_then(|v| v.as_array())
            .map(|a| {
                a.iter()
                    .filter_map(|v| v.as_str().map(str::to_string))
                    .collect()
            })
            .unwrap_or_default(),
    })
}

/// Build the `@modular-css/svelte` [`PreprocessorGroup`].
pub fn modular_css(config: MarkupBridge) -> PreprocessorGroup {
    PreprocessorGroup {
        name: Some("@modular-css/svelte".to_string()),
        markup: Some(Box::new(
            move |opts: MarkupPreprocessorOptions| -> PreprocessorResult {
                let config = config.clone();
                Box::pin(async move {
                    let out = process(&opts.content, opts.filename.as_deref(), &config)
                        .map_err(PreprocessError::Other)?;
                    Ok(Some(Processed {
                        code: out.code,
                        dependencies: out.dependencies,
                        ..Default::default()
                    }))
                })
            },
        ) as MarkupPreprocessorFn),
        ..Default::default()
    }
}
