//! Port of the compiler's own `compilerOptions` validator.
//!
//! Upstream svelte-check hands the parsed `compilerOptions` object straight to
//! `svelte.compile` (`SvelteDocument.ts`'s `getCompiledWith`), so the compiler's
//! `validate-options.js` runs over it and every unrecognised key / illegal value
//! surfaces as an `options_unrecognised` / `options_invalid_value` /
//! `options_removed` diagnostic on each checked component. rsvelte-check builds
//! a typed `CompileOptions` instead, so nothing validates what it reads — and a
//! per-key check for whichever option a bug report happened to name does not
//! scale. This is the whole table, mirroring
//! `submodules/svelte/packages/svelte/src/compiler/validate-options.js`, checked
//! against that file by `schema_matches_upstream`.
//!
//! Two deliberate under-approximations, both chosen so this can never invent a
//! diagnostic upstream would not raise:
//!   * a value that is not a literal (an identifier, a call, a spread-in key)
//!     is unreadable here but perfectly readable to the real config loader, so
//!     it is skipped rather than judged;
//!   * `deprecate` / `warn_removed` options produce *warnings*, and upstream's
//!     `warn_once` fires them once per process — which component they land on
//!     is an artefact of compile order, so they are not reproduced at all.

/// A `compilerOptions` value as far as static parsing can tell.
#[derive(Debug, Clone, PartialEq)]
pub enum ConfigValue {
    Bool(bool),
    Number(f64),
    Str(String),
    Null,
    Object(ConfigObject),
    Array,
    Function,
    /// Not statically readable — an identifier, call, member expression,
    /// template literal, `undefined`, …
    Unknown,
}

/// The statically-visible part of an object literal.
#[derive(Debug, Clone, PartialEq)]
pub struct ConfigObject {
    entries: Vec<(String, ConfigValue)>,
    /// False when a spread element or a computed key hid part of the key set,
    /// which is what makes "this key is unrecognised" unanswerable.
    complete: bool,
}

/// Nothing read yet — and nothing hidden either, so the first source merged in
/// decides completeness.
impl Default for ConfigObject {
    fn default() -> Self {
        Self {
            entries: Vec::new(),
            complete: true,
        }
    }
}

impl ConfigObject {
    /// An object whose key set is fully known (no spread, no computed key).
    #[must_use]
    pub const fn complete(entries: Vec<(String, ConfigValue)>) -> Self {
        Self {
            entries,
            complete: true,
        }
    }

    #[must_use]
    pub const fn partial(entries: Vec<(String, ConfigValue)>) -> Self {
        Self {
            entries,
            complete: false,
        }
    }

    #[must_use]
    pub const fn is_empty(&self) -> bool {
        self.entries.is_empty()
    }

    #[must_use]
    pub fn get(&self, name: &str) -> Option<&ConfigValue> {
        // Last wins, as in JS: a duplicate key overwrites the earlier one.
        self.entries
            .iter()
            .rev()
            .find(|(k, _)| k == name)
            .map(|(_, v)| v)
    }

    /// Merge `other` over `self`, mirroring vite-plugin-svelte's
    /// `svelte.config` → inline plugin options precedence. Object-valued keys
    /// merge recursively so a source that declares `experimental.async` alone
    /// does not erase a sibling.
    pub fn merge(&mut self, other: &Self) {
        self.complete &= other.complete;
        for (key, value) in &other.entries {
            match (self.get_mut(key), value) {
                (Some(ConfigValue::Object(existing)), ConfigValue::Object(incoming)) => {
                    existing.merge(incoming);
                }
                (Some(slot), _) => *slot = value.clone(),
                (None, _) => self.entries.push((key.clone(), value.clone())),
            }
        }
    }

    fn get_mut(&mut self, name: &str) -> Option<&mut ConfigValue> {
        self.entries
            .iter_mut()
            .rev()
            .find(|(k, _)| k == name)
            .map(|(_, v)| v)
    }
}

/// A diagnostic `svelte.compile` would throw before compiling anything.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OptionDiagnostic {
    pub code: &'static str,
    pub message: String,
}

impl OptionDiagnostic {
    fn error(code: &'static str, body: impl std::fmt::Display) -> Self {
        Self {
            message: format!("{body}\nhttps://svelte.dev/e/{code}"),
            code,
        }
    }
}

type Check = fn(&ConfigValue, &str) -> Option<String>;

/// A member of `list([...])`. Upstream compares with `Array.includes`, so a
/// number and its string spelling are different values.
#[derive(Debug, Clone, Copy, PartialEq)]
pub enum Lit {
    Str(&'static str),
    Num(f64),
}

impl Lit {
    fn matches(self, value: &ConfigValue) -> bool {
        match (self, value) {
            (Self::Str(s), ConfigValue::Str(v)) => s == v,
            (Self::Num(n), ConfigValue::Number(v)) => n.to_bits() == v.to_bits(),
            _ => false,
        }
    }

    fn spelling(self) -> String {
        match self {
            Self::Str(s) => s.to_string(),
            Self::Num(n) => format!("{n}"),
        }
    }
}

/// The validator families of `validate-options.js`, one variant per helper.
pub enum Kind {
    Boolean,
    Str,
    List(&'static [Lit]),
    Function,
    Object(&'static [Opt]),
    Removed(&'static str),
    /// Warns rather than errors, and only once per process — not reproduced.
    WarnRemoved,
    /// `validator` / `parametric` — a hand-written normalizer whose body no
    /// derivation can read. `None` is upstream's identity normalizer, which
    /// accepts every value.
    Custom(Option<Check>),
}

pub struct Opt {
    pub name: &'static str,
    pub kind: Kind,
    /// `deprecate(...)` — a once-per-process warning wrapped around a
    /// validator that still runs.
    pub deprecated: bool,
}

const fn opt(name: &'static str, kind: Kind) -> Opt {
    Opt {
        name,
        kind,
        deprecated: false,
    }
}

const fn deprecated(name: &'static str, kind: Kind) -> Opt {
    Opt {
        name,
        kind,
        deprecated: true,
    }
}

const EXPERIMENTAL: &[Opt] = &[opt("async", Kind::Boolean)];

const COMPATIBILITY: &[Opt] = &[opt(
    "componentApi",
    Kind::List(&[Lit::Num(4.0), Lit::Num(5.0)]),
)];

/// `object({ ...common_options, ...component_options })` — declaration order
/// matters, because upstream validates children in key order and the first
/// throw wins.
pub const COMPONENT_OPTIONS: &[Opt] = &[
    // common_options
    opt("filename", Kind::Str),
    opt("rootDir", Kind::Str),
    opt("dev", Kind::Boolean),
    opt("generate", Kind::Custom(Some(check_generate))),
    opt("warningFilter", Kind::Function),
    opt("experimental", Kind::Object(EXPERIMENTAL)),
    // component_options
    deprecated("accessors", Kind::Boolean),
    opt("css", Kind::Custom(Some(check_css))),
    opt("cssHash", Kind::Function),
    opt("cssOutputFilename", Kind::Str),
    opt("customElement", Kind::Custom(Some(check_custom_element))),
    opt("discloseVersion", Kind::Boolean),
    deprecated("immutable", Kind::Boolean),
    opt(
        "legacy",
        Kind::Removed(
            "The legacy option has been removed. If you are using this because of \
             legacy.componentApi, use compatibility.componentApi instead",
        ),
    ),
    opt("compatibility", Kind::Object(COMPATIBILITY)),
    opt("loopGuardTimeout", Kind::WarnRemoved),
    opt("name", Kind::Str),
    opt(
        "namespace",
        Kind::List(&[Lit::Str("html"), Lit::Str("mathml"), Lit::Str("svg")]),
    ),
    opt("modernAst", Kind::Boolean),
    opt("outputFilename", Kind::Str),
    opt("preserveComments", Kind::Boolean),
    opt(
        "fragments",
        Kind::List(&[Lit::Str("html"), Lit::Str("tree")]),
    ),
    opt("preserveWhitespace", Kind::Boolean),
    opt("runes", Kind::Custom(None)),
    opt("hmr", Kind::Boolean),
    opt("sourcemap", Kind::Custom(None)),
    opt("enableSourcemap", Kind::WarnRemoved),
    opt("hydratable", Kind::WarnRemoved),
    opt(
        "format",
        Kind::Removed(
            "The format option has been removed in Svelte 4, the compiler only outputs ESM now. \
             Remove \"format\" from your compiler options. If you did not set this yourself, bump \
             the version of your bundler plugin \
             (vite-plugin-svelte/rollup-plugin-svelte/svelte-loader)",
        ),
    ),
    opt(
        "tag",
        Kind::Removed(
            "The tag option has been removed in Svelte 5. Use `<svelte:options \
             customElement=\"tag-name\" />` inside the component instead. If that does not solve \
             your use case, please open an issue on GitHub with details.",
        ),
    ),
    opt(
        "sveltePath",
        Kind::Removed(
            "The sveltePath option has been removed in Svelte 5. If this option was crucial for \
             you, please open an issue on GitHub with your use case.",
        ),
    ),
    opt(
        "errorMode",
        Kind::Removed(
            "The errorMode option has been removed. If you are using this through \
             svelte-preprocess with TypeScript, use the \
             https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead",
        ),
    ),
    opt(
        "varsReport",
        Kind::Removed(
            "The vars option has been removed. If you are using this through svelte-preprocess \
             with TypeScript, use the \
             https://www.typescriptlang.org/tsconfig#verbatimModuleSyntax setting instead",
        ),
    ),
];

/// Module compilation recognizes every component option.
///
/// It follows `object({ ...common_options, ...Object.fromEntries(Object.keys(component_options)
/// .map((key) => [key, () => {}])) })`. Module compilation recognises every
/// component option, but only validates the common subset.
pub const MODULE_OPTIONS: &[Opt] = &[
    opt("filename", Kind::Str),
    opt("rootDir", Kind::Str),
    opt("dev", Kind::Boolean),
    opt("generate", Kind::Custom(Some(check_generate))),
    opt("warningFilter", Kind::Function),
    opt("experimental", Kind::Object(EXPERIMENTAL)),
    opt("accessors", Kind::Custom(None)),
    opt("css", Kind::Custom(None)),
    opt("cssHash", Kind::Custom(None)),
    opt("cssOutputFilename", Kind::Custom(None)),
    opt("customElement", Kind::Custom(None)),
    opt("discloseVersion", Kind::Custom(None)),
    opt("immutable", Kind::Custom(None)),
    opt("legacy", Kind::Custom(None)),
    opt("compatibility", Kind::Custom(None)),
    opt("loopGuardTimeout", Kind::Custom(None)),
    opt("name", Kind::Custom(None)),
    opt("namespace", Kind::Custom(None)),
    opt("modernAst", Kind::Custom(None)),
    opt("outputFilename", Kind::Custom(None)),
    opt("preserveComments", Kind::Custom(None)),
    opt("fragments", Kind::Custom(None)),
    opt("preserveWhitespace", Kind::Custom(None)),
    opt("runes", Kind::Custom(None)),
    opt("hmr", Kind::Custom(None)),
    opt("sourcemap", Kind::Custom(None)),
    opt("enableSourcemap", Kind::Custom(None)),
    opt("hydratable", Kind::Custom(None)),
    opt("format", Kind::Custom(None)),
    opt("tag", Kind::Custom(None)),
    opt("sveltePath", Kind::Custom(None)),
    opt("errorMode", Kind::Custom(None)),
    opt("varsReport", Kind::Custom(None)),
];

fn check_generate(value: &ConfigValue, keypath: &str) -> Option<String> {
    match value {
        // 'dom' / 'ssr' are renamed, not rejected (a once-per-process warning).
        ConfigValue::Str(s) if matches!(s.as_str(), "client" | "server" | "dom" | "ssr") => None,
        ConfigValue::Bool(false) => None,
        _ => Some(format!("{keypath} must be \"client\", \"server\" or false")),
    }
}

fn check_css(value: &ConfigValue, _keypath: &str) -> Option<String> {
    match value {
        // A function is normalized on call, against a value we cannot see.
        ConfigValue::Function => None,
        ConfigValue::Bool(_) => Some(
            "The boolean options have been removed from the css option. Use \"external\" instead \
             of false and \"injected\" instead of true"
                .to_string(),
        ),
        ConfigValue::Str(s) if s == "none" => Some(
            "css: \"none\" is no longer a valid option. If this was crucial for you, please open \
             an issue on GitHub with your use case."
                .to_string(),
        ),
        ConfigValue::Str(s) if s == "external" || s == "injected" => None,
        _ => Some(
            "css should be either \"external\" (default, recommended) or \"injected\"".to_string(),
        ),
    }
}

fn check_custom_element(value: &ConfigValue, keypath: &str) -> Option<String> {
    match value {
        ConfigValue::Function | ConfigValue::Bool(_) => None,
        _ => Some(format!("{keypath} should be true or false")),
    }
}

/// The first diagnostic `svelte.compile` would raise for these options, or
/// `None` when nothing statically readable is wrong with them.
#[must_use]
pub fn validate_component_options(options: &ConfigObject) -> Option<OptionDiagnostic> {
    validate_object(options, "", COMPONENT_OPTIONS)
}

#[must_use]
pub fn validate_module_options(options: &ConfigObject) -> Option<OptionDiagnostic> {
    validate_object(options, "", MODULE_OPTIONS)
}

fn validate_object(
    obj: &ConfigObject,
    keypath: &str,
    children: &'static [Opt],
) -> Option<OptionDiagnostic> {
    // Upstream reports every unrecognised key before validating any known one,
    // and the first report throws.
    if obj.complete {
        for (key, _) in &obj.entries {
            if !children.iter().any(|c| c.name == key) {
                return Some(OptionDiagnostic::error(
                    "options_unrecognised",
                    format!("Unrecognised compiler option {}", join(keypath, key)),
                ));
            }
        }
    }
    for child in children {
        let Some(value) = obj.get(child.name) else {
            continue;
        };
        // Absent and unreadable are the same thing here: judging either would
        // be a diagnostic upstream never raises.
        if matches!(value, ConfigValue::Unknown) {
            continue;
        }
        if let Some(found) = validate_value(value, &join(keypath, child.name), &child.kind) {
            return Some(found);
        }
    }
    None
}

fn validate_value(
    value: &ConfigValue,
    keypath: &str,
    kind: &'static Kind,
) -> Option<OptionDiagnostic> {
    let invalid = |detail: String| {
        Some(OptionDiagnostic::error(
            "options_invalid_value",
            format!("Invalid compiler option: {detail}"),
        ))
    };
    match kind {
        Kind::Boolean => match value {
            ConfigValue::Bool(_) => None,
            _ => invalid(format!("{keypath} should be true or false, if specified")),
        },
        Kind::Str => match value {
            ConfigValue::Str(_) => None,
            _ => invalid(format!("{keypath} should be a string, if specified")),
        },
        Kind::Function => match value {
            ConfigValue::Function => None,
            _ => invalid(format!("{keypath} should be a function, if specified")),
        },
        Kind::List(options) => {
            if options.iter().any(|lit| lit.matches(value)) {
                return None;
            }
            invalid(format!("{keypath} should be {}", list_spelling(options)))
        }
        Kind::Object(children) => match value {
            ConfigValue::Object(nested) => validate_object(nested, keypath, children),
            // Falsy non-objects survive upstream's type check and fail later on
            // a child instead; under-approximating keeps this side silent.
            ConfigValue::Null | ConfigValue::Bool(false) => None,
            _ => invalid(format!("{keypath} should be an object")),
        },
        Kind::Removed(detail) => Some(OptionDiagnostic::error(
            "options_removed",
            format!("Invalid compiler option: {detail}"),
        )),
        Kind::WarnRemoved => None,
        Kind::Custom(check) => check.and_then(|f| f(value, keypath)).and_then(invalid),
    }
}

fn list_spelling(options: &[Lit]) -> String {
    if options.len() > 2 {
        let (last, head) = options.split_last().expect("non-empty list");
        let head = head
            .iter()
            .map(|o| format!("\"{}\"", o.spelling()))
            .collect::<Vec<_>>()
            .join(", ");
        format!("one of {head} or \"{}\"", last.spelling())
    } else {
        format!(
            "either \"{}\" or \"{}\"",
            options[0].spelling(),
            options[1].spelling()
        )
    }
}

fn join(keypath: &str, key: &str) -> String {
    if keypath.is_empty() {
        key.to_string()
    } else {
        format!("{keypath}.{key}")
    }
}

#[cfg(test)]
mod derived {
    //! The table above is checked against the file it mirrors instead of being
    //! maintained by hand: a new upstream option, a renamed one, a changed
    //! `list([...])` set or an option moving to `removed` fails here rather
    //! than becoming another silently-dropped key. What it cannot derive is the
    //! *body* of a `validator` / `parametric` normalizer — those are compared
    //! only as "hand-written", and their semantics are pinned by the unit tests
    //! and the check fixtures instead.

    use std::path::PathBuf;

    use oxc_allocator::Allocator;
    use oxc_ast::ast as oxc;
    use oxc_parser::Parser as OxcParser;
    use oxc_span::SourceType;

    use super::*;

    fn upstream_source() -> Option<String> {
        let path = PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .join("../../submodules/svelte/packages/svelte/src/compiler/validate-options.js");
        std::fs::read_to_string(path).ok()
    }

    fn repr(opt: &Opt) -> String {
        let base = match &opt.kind {
            Kind::Boolean => "boolean".to_string(),
            Kind::Str => "string".to_string(),
            Kind::Function => "fun".to_string(),
            Kind::List(options) => format!(
                "list({})",
                options
                    .iter()
                    .map(|o| o.spelling())
                    .collect::<Vec<_>>()
                    .join(",")
            ),
            Kind::Object(children) => format!("object({})", reprs(children).join("; ")),
            Kind::Removed(_) => "removed".to_string(),
            Kind::WarnRemoved => "warn_removed".to_string(),
            Kind::Custom(_) => "custom".to_string(),
        };
        if opt.deprecated {
            format!("deprecate({base})")
        } else {
            base
        }
    }

    fn reprs(options: &[Opt]) -> Vec<String> {
        options
            .iter()
            .map(|o| format!("{} = {}", o.name, repr(o)))
            .collect()
    }

    fn unwrap_parens<'a>(expr: &'a oxc::Expression<'a>) -> &'a oxc::Expression<'a> {
        match expr {
            oxc::Expression::ParenthesizedExpression(p) => unwrap_parens(&p.expression),
            oxc::Expression::TSAsExpression(a) => unwrap_parens(&a.expression),
            _ => expr,
        }
    }

    fn upstream_repr(expr: &oxc::Expression) -> String {
        let oxc::Expression::CallExpression(call) = unwrap_parens(expr) else {
            return "?".to_string();
        };
        let oxc::Expression::Identifier(callee) = &call.callee else {
            return "?".to_string();
        };
        match callee.name.as_str() {
            "boolean" => "boolean".to_string(),
            "string" => "string".to_string(),
            "fun" => "fun".to_string(),
            "removed" => "removed".to_string(),
            "warn_removed" => "warn_removed".to_string(),
            "validator" | "parametric" => "custom".to_string(),
            "list" => {
                let Some(oxc::Argument::ArrayExpression(arr)) = call.arguments.first() else {
                    return "list(?)".to_string();
                };
                let members: Vec<String> = arr
                    .elements
                    .iter()
                    .map(|el| match el {
                        oxc::ArrayExpressionElement::StringLiteral(s) => s.value.to_string(),
                        oxc::ArrayExpressionElement::NumericLiteral(n) => format!("{}", n.value),
                        _ => "?".to_string(),
                    })
                    .collect();
                format!("list({})", members.join(","))
            }
            "object" => {
                let Some(oxc::Argument::ObjectExpression(obj)) = call.arguments.first() else {
                    return "object(?)".to_string();
                };
                format!("object({})", upstream_reprs(obj).join("; "))
            }
            "deprecate" => {
                let Some(oxc::Argument::CallExpression(_)) = call.arguments.get(1) else {
                    return "deprecate(?)".to_string();
                };
                let inner = call.arguments[1].to_expression();
                format!("deprecate({})", upstream_repr(inner))
            }
            other => other.to_string(),
        }
    }

    fn upstream_reprs(obj: &oxc::ObjectExpression) -> Vec<String> {
        obj.properties
            .iter()
            .filter_map(|prop| {
                let oxc::ObjectPropertyKind::ObjectProperty(p) = prop else {
                    return None;
                };
                let oxc::PropertyKey::StaticIdentifier(key) = &p.key else {
                    return None;
                };
                Some(format!("{} = {}", key.name, upstream_repr(&p.value)))
            })
            .collect()
    }

    fn declared_object<'a>(
        program: &'a oxc::Program<'a>,
        name: &str,
    ) -> Option<&'a oxc::ObjectExpression<'a>> {
        for stmt in &program.body {
            let oxc::Statement::VariableDeclaration(decl) = stmt else {
                continue;
            };
            for d in &decl.declarations {
                let oxc::BindingPattern::BindingIdentifier(id) = &d.id else {
                    continue;
                };
                if id.name.as_str() != name {
                    continue;
                }
                if let Some(oxc::Expression::ObjectExpression(obj)) = &d.init {
                    return Some(obj);
                }
            }
        }
        None
    }

    #[test]
    fn schema_matches_upstream() {
        let Some(source) = upstream_source() else {
            // Only a job that promised this submodule may fail on its absence.
            assert!(
                std::env::var_os("RSVELTE_REQUIRE_PREREQS").is_none(),
                "submodules/svelte is not checked out in a job that declares \
                 RSVELTE_REQUIRE_PREREQS — the option table would go unchecked against the \
                 compiler it mirrors."
            );
            eprintln!("[options_schema] submodules/svelte absent — skipping");
            return;
        };
        let allocator = Allocator::default();
        let parsed = OxcParser::new(&allocator, &source, SourceType::mjs()).parse();
        assert!(
            parsed.diagnostics.is_empty(),
            "validate-options.js did not parse: {:?}",
            parsed.diagnostics
        );
        let common = declared_object(&parsed.program, "common_options")
            .expect("validate-options.js declares common_options");
        let component = declared_object(&parsed.program, "component_options")
            .expect("validate-options.js declares component_options");

        // `validate_component_options` is `object({ ...common, ...component })`,
        // and the order it spreads them in is the order children are validated.
        let mut expected = upstream_reprs(common);
        expected.extend(upstream_reprs(component));
        assert_eq!(reprs(COMPONENT_OPTIONS), expected);

        let mut expected_module = upstream_reprs(common);
        expected_module.extend(upstream_reprs(component).into_iter().map(|entry| {
            let (name, _) = entry
                .split_once(" = ")
                .expect("component option representation contains its name");
            format!("{name} = custom")
        }));
        assert_eq!(reprs(MODULE_OPTIONS), expected_module);
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn object(entries: &[(&str, ConfigValue)]) -> ConfigObject {
        ConfigObject::complete(
            entries
                .iter()
                .map(|(k, v)| ((*k).to_string(), v.clone()))
                .collect(),
        )
    }

    fn code_of(entries: &[(&str, ConfigValue)]) -> Option<&'static str> {
        validate_component_options(&object(entries)).map(|d| d.code)
    }

    fn module_code_of(entries: &[(&str, ConfigValue)]) -> Option<&'static str> {
        validate_module_options(&object(entries)).map(|d| d.code)
    }

    #[test]
    fn module_options_validate_only_the_common_subset() {
        assert_eq!(
            module_code_of(&[("unknown", ConfigValue::Bool(true))]),
            Some("options_unrecognised")
        );
        assert_eq!(
            module_code_of(&[("dev", ConfigValue::Str("yes".into()))]),
            Some("options_invalid_value")
        );
        assert_eq!(
            module_code_of(&[("css", ConfigValue::Str("not-a-component-value".into()))]),
            None
        );
        assert_eq!(module_code_of(&[("legacy", ConfigValue::Bool(true))]), None);
    }

    #[test]
    fn accepts_the_options_the_compiler_accepts() {
        assert_eq!(
            code_of(&[
                ("runes", ConfigValue::Bool(true)),
                ("css", ConfigValue::Str("injected".into())),
                ("namespace", ConfigValue::Str("svg".into())),
                ("customElement", ConfigValue::Bool(true)),
                ("accessors", ConfigValue::Bool(true)),
                ("generate", ConfigValue::Bool(false)),
                ("warningFilter", ConfigValue::Function),
                (
                    "experimental",
                    ConfigValue::Object(object(&[("async", ConfigValue::Bool(true))])),
                ),
                (
                    "compatibility",
                    ConfigValue::Object(object(&[("componentApi", ConfigValue::Number(4.0))])),
                ),
            ]),
            None
        );
    }

    #[test]
    fn rejects_unrecognised_keys_including_nested_ones() {
        assert_eq!(
            code_of(&[("nonsense", ConfigValue::Number(1.0))]),
            Some("options_unrecognised")
        );
        assert_eq!(
            code_of(&[(
                "compatibility",
                ConfigValue::Object(object(&[("nope", ConfigValue::Number(1.0))])),
            )]),
            Some("options_unrecognised")
        );
    }

    /// A spread hides part of the key set, so no key can be called unknown —
    /// but the values that ARE visible are still checked.
    #[test]
    fn a_spread_suppresses_only_the_unrecognised_check() {
        let partial = ConfigObject::partial(vec![
            ("nonsense".to_string(), ConfigValue::Number(1.0)),
            ("dev".to_string(), ConfigValue::Str("yes".into())),
        ]);
        assert_eq!(
            validate_component_options(&partial).map(|d| d.code),
            Some("options_invalid_value")
        );
    }

    #[test]
    fn rejects_illegal_values() {
        for entry in [
            ("dev", ConfigValue::Str("yes".into())),
            ("css", ConfigValue::Str("nonsense".into())),
            ("css", ConfigValue::Bool(true)),
            ("namespace", ConfigValue::Str("foreign".into())),
            ("fragments", ConfigValue::Str("nope".into())),
            ("customElement", ConfigValue::Str("x".into())),
            ("name", ConfigValue::Number(5.0)),
            ("cssHash", ConfigValue::Str("x".into())),
            ("generate", ConfigValue::Str("nope".into())),
        ] {
            assert_eq!(
                code_of(&[(entry.0, entry.1.clone())]),
                Some("options_invalid_value"),
                "{entry:?}"
            );
        }
        assert_eq!(
            code_of(&[(
                "experimental",
                ConfigValue::Object(object(&[("async", ConfigValue::Str("yes".into()))])),
            )]),
            Some("options_invalid_value")
        );
    }

    /// `parametric` with the identity normalizer never rejects anything —
    /// `runes: 'yes'` compiles clean upstream.
    #[test]
    fn parametric_options_accept_every_value() {
        assert_eq!(code_of(&[("runes", ConfigValue::Str("yes".into()))]), None);
        assert_eq!(code_of(&[("sourcemap", ConfigValue::Number(5.0))]), None);
    }

    #[test]
    fn removed_options_are_errors_and_warn_removed_ones_are_silent() {
        assert_eq!(
            code_of(&[("legacy", ConfigValue::Object(ConfigObject::default()))]),
            Some("options_removed")
        );
        assert_eq!(
            code_of(&[("tag", ConfigValue::Str("x-a".into()))]),
            Some("options_removed")
        );
        // Warnings, and once per process — deliberately not reproduced.
        assert_eq!(code_of(&[("hydratable", ConfigValue::Bool(true))]), None);
        assert_eq!(
            code_of(&[("enableSourcemap", ConfigValue::Bool(true))]),
            None
        );
        assert_eq!(
            code_of(&[("generate", ConfigValue::Str("dom".into()))]),
            None
        );
    }

    /// Anything not statically readable must not be judged: the real loader
    /// evaluates it and could produce a perfectly legal value.
    #[test]
    fn unreadable_values_are_never_diagnosed() {
        for name in ["dev", "namespace", "css", "legacy", "cssHash"] {
            assert_eq!(code_of(&[(name, ConfigValue::Unknown)]), None, "{name}");
        }
    }

    /// Unrecognised beats invalid, as in upstream's two loops.
    #[test]
    fn unrecognised_is_reported_before_an_illegal_value() {
        assert_eq!(
            code_of(&[
                ("dev", ConfigValue::Str("yes".into())),
                ("nonsense", ConfigValue::Bool(true)),
            ]),
            Some("options_unrecognised")
        );
    }

    #[test]
    fn messages_match_the_compilers_wording() {
        let d = validate_component_options(&object(&[(
            "namespace",
            ConfigValue::Str("foreign".into()),
        )]))
        .unwrap();
        assert_eq!(
            d.message,
            "Invalid compiler option: namespace should be one of \"html\", \"mathml\" or \"svg\"\n\
             https://svelte.dev/e/options_invalid_value"
        );
        let d = validate_component_options(&object(&[(
            "compatibility",
            ConfigValue::Object(object(&[("componentApi", ConfigValue::Number(3.0))])),
        )]))
        .unwrap();
        assert_eq!(
            d.message,
            "Invalid compiler option: compatibility.componentApi should be either \"4\" or \"5\"\n\
             https://svelte.dev/e/options_invalid_value"
        );
    }

    #[test]
    fn later_sources_override_earlier_ones_key_by_key() {
        let mut base = ConfigObject::complete(vec![
            ("runes".to_string(), ConfigValue::Bool(true)),
            (
                "experimental".to_string(),
                ConfigValue::Object(ConfigObject::complete(vec![(
                    "async".to_string(),
                    ConfigValue::Bool(true),
                )])),
            ),
        ]);
        base.merge(&ConfigObject::complete(vec![(
            "experimental".to_string(),
            ConfigValue::Object(ConfigObject::default()),
        )]));
        assert_eq!(base.get("runes"), Some(&ConfigValue::Bool(true)));
        let ConfigValue::Object(exp) = base.get("experimental").unwrap() else {
            panic!("experimental is an object");
        };
        assert_eq!(exp.get("async"), Some(&ConfigValue::Bool(true)));
    }
}
