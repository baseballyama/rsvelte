//! Top-level runner. Walks the workspace, runs the rsvelte compiler on
//! every `.svelte` file, and produces a flat list of diagnostics ready
//! for the writers in `writers.rs`.
//!
//! v0.1 only collects Svelte-side diagnostics (parse / analysis /
//! transform errors + compiler warnings). The TypeScript pipeline
//! (svelte2tsx → tsgo → diagnostic mapper) is the next milestone.

use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};

use crate::compiler::{CompileOptions, ExperimentalOptions, GenerateMode, compile};

use super::config::{
    CompilerOptionsSettings, load_compiler_options_with_config, warning_filter_config_path,
};
use super::diagnostic::{Diagnostic, DiagnosticSeverity, Position, Range};
use super::kit_file::load_kit_files_settings_with_config;
use super::manifest::{
    self, CachedDiagnostics, SerializableDiagnostic, WarningCache, current_stats,
};
use super::mapper::{is_syntactic_ts_code, map_tsgo_diagnostics};
use super::overlay::{OverlayLayout, materialize_overlay_with_kit};
use super::tsgo::{TsgoError, find_compiler, run_tsgo};
use super::walker::find_relevant_files;

/// Per-warning override: promote to error or drop entirely. Mirrors
/// the JS reference's `--compiler-warnings code:error,code:ignore`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WarningOverride {
    Error,
    Ignore,
}

/// Diagnostic sources the run should keep. Mirrors the JS reference's
/// `--diagnostic-sources svelte,ts,css` filter.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum DiagnosticSource {
    Svelte,
    Ts,
    Css,
}

impl DiagnosticSource {
    pub fn as_str(self) -> &'static str {
        match self {
            DiagnosticSource::Svelte => "svelte",
            DiagnosticSource::Ts => "ts",
            DiagnosticSource::Css => "css",
        }
    }
    pub fn parse(s: &str) -> Option<Self> {
        Some(match s {
            "svelte" => DiagnosticSource::Svelte,
            "ts" | "js" => DiagnosticSource::Ts,
            "css" => DiagnosticSource::Css,
            _ => return None,
        })
    }
}

/// Inputs to a `svelte-check` run.
#[derive(Debug, Clone)]
pub struct RunOptions {
    /// Workspace root — `.svelte` files are searched under this directory.
    pub workspace: PathBuf,
    /// Path fragments to skip while walking (relative to the workspace root).
    pub ignore: Vec<String>,
    /// Whether to treat warnings as errors for exit-code purposes.
    pub fail_on_warnings: bool,
    /// When `true`, materialise `.tsx` shadow files + an overlay
    /// tsconfig under `<workspace>/.svelte-check/`. Used by the
    /// upcoming tsgo integration; on its own this only emits files
    /// without spawning a TypeScript compiler.
    pub emit_overlay: bool,
    /// Optional path to a project tsconfig.json the overlay should
    /// `extends`. None → write a self-contained overlay tsconfig.
    pub tsconfig: Option<PathBuf>,
    /// When `true`, materialise the overlay and run a TypeScript
    /// compiler (`tsc` by default, or `tsgo` when `prefer_tsgo`) against
    /// it, surfacing the mapped TypeScript diagnostics on the original
    /// `.svelte` source. This is the behaviour the `rsvelte-check` CLI
    /// turns on by default — without it the run only reports Svelte-side
    /// compile diagnostics. Implies `emit_overlay`.
    pub type_check: bool,
    /// Backend preference when `type_check` is set: `true` prefers
    /// Microsoft's native `tsgo` (falling back to `tsc`), `false` (the
    /// default) prefers the stock `tsc` (falling back to `tsgo`). Has no
    /// effect unless `type_check` is set.
    pub prefer_tsgo: bool,
    /// Compiler-warning overrides keyed by warning code (e.g.
    /// `css-unused-selector` → `Ignore`). Empty = pass all warnings
    /// through unchanged. Mirrors the JS `--compiler-warnings`.
    pub compiler_warnings: HashMap<String, WarningOverride>,
    /// Subset of diagnostic sources to surface. `None` = all sources.
    /// Mirrors the JS `--diagnostic-sources`.
    pub diagnostic_sources: Option<HashSet<DiagnosticSource>>,
    /// When `true`, the overlay reads/writes a `manifest.json` cache
    /// under `<cacheDir>/` and skips re-emitting `.tsx` shadows whose
    /// source `(mtime_ms, size)` hasn't changed since the previous run.
    /// Mirrors the JS reference's `--incremental` flag.
    pub incremental: bool,
    /// Explicit `svelte.config.*` / `vite.config.*` path whose
    /// diagnostic-relevant `compilerOptions` (and `kit.files`) override
    /// workspace discovery. `None` = discover under the workspace.
    /// Mirrors the JS reference's `--config`.
    pub config: Option<PathBuf>,
}

impl Default for RunOptions {
    fn default() -> Self {
        Self {
            workspace: std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")),
            ignore: Vec::new(),
            fail_on_warnings: false,
            emit_overlay: false,
            tsconfig: None,
            type_check: false,
            prefer_tsgo: false,
            compiler_warnings: HashMap::new(),
            diagnostic_sources: None,
            incremental: false,
            config: None,
        }
    }
}

/// Result of a `svelte-check` run.
#[derive(Debug, Default)]
pub struct RunResult {
    pub diagnostics: Vec<Diagnostic>,
    pub files_checked: usize,
    /// `Some` whenever the overlay was materialised — i.e. when
    /// `RunOptions::emit_overlay` or `RunOptions::type_check` was set.
    pub overlay: Option<OverlayLayout>,
}

impl RunResult {
    pub fn error_count(&self) -> usize {
        self.diagnostics
            .iter()
            .filter(|d| d.severity == DiagnosticSeverity::Error)
            .count()
    }

    pub fn warning_count(&self) -> usize {
        self.diagnostics
            .iter()
            .filter(|d| d.severity == DiagnosticSeverity::Warning)
            .count()
    }

    /// Process exit code per the JS reference: 1 if any errors, 1 also
    /// when `fail_on_warnings` and any warnings exist, 0 otherwise.
    pub fn exit_code(&self, fail_on_warnings: bool) -> i32 {
        if self.error_count() > 0 || (fail_on_warnings && self.warning_count() > 0) {
            1
        } else {
            0
        }
    }
}

/// Run rsvelte's compiler on every `.svelte` file under `options.workspace`
/// and collect the resulting diagnostics. tsgo / svelte2tsx integration
/// will plug in here in a follow-up.
pub fn run(options: &RunOptions) -> RunResult {
    let kit_settings =
        load_kit_files_settings_with_config(&options.workspace, options.config.as_deref());
    // `compilerOptions` that influence diagnostics (e.g. `experimental.async`),
    // resolved from both `svelte.config.*` and the `vite.config.*` Svelte
    // plugin call (issue #1034). `--config` overrides that discovery.
    let compiler_opts =
        load_compiler_options_with_config(&options.workspace, options.config.as_deref());
    let relevant = find_relevant_files(&options.workspace, &options.ignore, &kit_settings);
    let files = relevant.svelte;
    let kit_files = relevant.kit;
    let files_checked = files.len();
    let diagnostics = compile_files_with_cache(
        &files,
        &options.workspace,
        options.incremental,
        &compiler_opts,
    );
    let mut result = RunResult {
        diagnostics,
        files_checked,
        overlay: None,
    };

    let need_overlay = options.emit_overlay || options.type_check;
    if need_overlay {
        match materialize_overlay_with_kit(
            &options.workspace,
            &files,
            &kit_files,
            options.tsconfig.as_deref(),
            options.incremental,
            &kit_settings,
        ) {
            Ok(layout) => {
                if options.type_check {
                    run_type_check_phase(
                        &layout,
                        &options.workspace,
                        options.prefer_tsgo,
                        &mut result.diagnostics,
                    );
                }
                result.overlay = Some(layout);
            }
            Err(e) => {
                // Surface the overlay error as a workspace-level
                // diagnostic so the user sees it in the same stream as
                // compile errors.
                result.diagnostics.push(Diagnostic {
                    file: options.workspace.clone(),
                    severity: DiagnosticSeverity::Error,
                    code: Some("overlay-error".into()),
                    message: format!("overlay generation failed: {e}"),
                    range: None,
                    source: "svelte",
                });
            }
        }
    }

    // Scope reported diagnostics to the workspace being checked. Official
    // svelte-check only reports the invoked workspace's own documents; a
    // monorepo sibling pulled in transitively (e.g.
    // `packages/frontend/design-system/...` resolved through a workspace
    // symlink) is that package's own concern — its internal diagnostics (such
    // as a `Foo.svelte` + `Foo.svelte.ts` companion's no-default-export edge)
    // must not leak into every consumer's report. Errors at the *use* site in
    // the workspace are unaffected; only diagnostics whose file lives outside
    // the workspace root are dropped.
    drop_out_of_workspace_diagnostics(&mut result.diagnostics, &options.workspace);

    apply_filters(&mut result.diagnostics, options);

    // Honor `compilerOptions.warningFilter` — a JS predicate the native compiler
    // can't run — via a one-shot Node sidecar. Applied last, over the fully
    // resolved warning set, which is equivalent to Svelte's emit-time filter
    // because it's a pure per-warning predicate (#1666). Zero cost when the
    // config declares no function `warningFilter`.
    apply_warning_filter(&mut result.diagnostics, options);

    result
}

/// Run the project's function `warningFilter` over the collected Svelte warnings
/// through the Node sidecar, when both a filter is declared and the sidecar is
/// available. A no-op otherwise (and a fail-open on any sidecar error).
fn apply_warning_filter(diagnostics: &mut Vec<Diagnostic>, options: &RunOptions) {
    let Some(config_path) =
        warning_filter_config_path(&options.workspace, options.config.as_deref())
    else {
        return;
    };
    let Some(env) = super::warning_filter::SidecarEnv::from_env() else {
        eprintln!(
            "rsvelte-check: warning: `compilerOptions.warningFilter` is set but could not be \
             evaluated (no Node sidecar available). All warnings are shown."
        );
        return;
    };
    super::warning_filter::apply(&env, &config_path, diagnostics);
}

/// Drop diagnostics whose file lives outside the checked workspace root.
fn drop_out_of_workspace_diagnostics(diagnostics: &mut Vec<Diagnostic>, workspace: &Path) {
    let ws = workspace
        .canonicalize()
        .unwrap_or_else(|_| workspace.to_path_buf());
    diagnostics.retain(|d| {
        let abs = if d.file.is_absolute() {
            d.file.clone()
        } else {
            workspace.join(&d.file)
        };
        let canon = abs.canonicalize().unwrap_or(abs);
        canon.starts_with(&ws)
    });
}

/// Apply compiler-warnings + diagnostic-source filters in place.
fn apply_filters(diagnostics: &mut Vec<Diagnostic>, options: &RunOptions) {
    if !options.compiler_warnings.is_empty() {
        diagnostics.retain_mut(|d| {
            if d.severity != DiagnosticSeverity::Warning {
                return true;
            }
            let Some(code) = d.code.as_deref() else {
                return true;
            };
            match options.compiler_warnings.get(code) {
                Some(WarningOverride::Ignore) => false,
                Some(WarningOverride::Error) => {
                    d.severity = DiagnosticSeverity::Error;
                    true
                }
                None => true,
            }
        });
    }
    if let Some(allowed) = &options.diagnostic_sources {
        diagnostics.retain(|d| {
            DiagnosticSource::parse(d.source)
                .map(|s| allowed.contains(&s))
                .unwrap_or(true)
        });
    }
}

fn run_type_check_phase(
    layout: &OverlayLayout,
    workspace: &Path,
    prefer_tsgo: bool,
    out: &mut Vec<Diagnostic>,
) {
    let binary = match find_compiler(workspace, prefer_tsgo) {
        Ok(b) => b,
        Err(TsgoError::NotFound) => {
            out.push(Diagnostic {
                file: workspace.to_path_buf(),
                severity: DiagnosticSeverity::Warning,
                code: Some("ts-compiler-not-found".into()),
                message: "Skipping TypeScript diagnostics: no `tsc` or `tsgo` binary found. \
                     Install `typescript` (or `@typescript/native-preview` for `--tsgo`), \
                     or set `TSGO_BIN`."
                    .into(),
                range: None,
                source: "ts",
            });
            return;
        }
        Err(e) => {
            out.push(Diagnostic {
                file: workspace.to_path_buf(),
                severity: DiagnosticSeverity::Error,
                code: Some("ts-compiler-error".into()),
                message: format!("{e}"),
                range: None,
                source: "ts",
            });
            return;
        }
    };
    match run_tsgo(&binary, &layout.overlay_tsconfig, workspace) {
        Ok(raw) => {
            let mapped = map_tsgo_diagnostics(&raw, layout, workspace);
            // Before merging tsgo's output, guard against the silent
            // false-negative in #728: a syntactically-invalid generated
            // overlay makes TypeScript suppress every SEMANTIC diagnostic
            // program-wide, so a malformed overlay would otherwise look
            // like a clean pass. `out` already holds the Svelte-side
            // diagnostics, which lets us tell an rsvelte/svelte2tsx defect
            // (clean Svelte compile but broken TSX) from the user's own
            // syntax error (reported on the Svelte side already).
            let loud = overlay_syntax_loud_diagnostics(
                &mapped.overlay_syntax_sources,
                &mapped.diagnostics,
                out,
                workspace,
            );
            out.extend(mapped.diagnostics);
            out.extend(loud);
        }
        Err(e) => {
            out.push(Diagnostic {
                file: workspace.to_path_buf(),
                severity: DiagnosticSeverity::Error,
                code: Some("ts-compiler-error".into()),
                message: format!("TypeScript compiler execution failed: {e}"),
                range: None,
                source: "ts",
            });
        }
    }
}

/// Build the loud, attention-grabbing diagnostics that keep a
/// syntactically-invalid generated overlay from looking like a clean pass
/// (#728).
///
/// TypeScript/tsgo suppress every SEMANTIC diagnostic (`TS2xxx`+)
/// program-wide the moment the program contains ANY syntactic error
/// (`TS1xxx`). So if one generated `.tsx` overlay fails to parse, tsgo
/// prints only syntax errors and silently drops every real type error in
/// the whole project — a silent false negative, the worst failure mode for
/// a type-checker.
///
/// We distinguish two cases:
///   * **rsvelte/svelte2tsx defect** — the overlay came from a `.svelte`
///     file that rsvelte itself parsed cleanly (no Svelte-side
///     `compile-error`), yet the generated TSX failed to parse. This is
///     our bug; emit an `internal error … please report this` per file.
///   * **user's own syntax error** — the `.svelte`/`.ts` source is itself
///     malformed. That's already reported (on the Svelte side for
///     `.svelte`, or as a passthrough TS1xxx for plain `.ts`), so we don't
///     blame rsvelte — but semantics are STILL suppressed program-wide, so
///     we attach one note so the hidden type errors aren't a surprise.
///
/// Returns an empty vec for clean programs (no `TS1xxx` anywhere), so the
/// common all-overlays-valid path is untouched and never gains a false
/// positive.
fn overlay_syntax_loud_diagnostics(
    overlay_syntax_sources: &[PathBuf],
    mapped_ts: &[Diagnostic],
    svelte_side: &[Diagnostic],
    workspace: &Path,
) -> Vec<Diagnostic> {
    // Any syntactic diagnostic anywhere in the overlay program — including
    // passthrough TS1xxx on plain user `.ts`/`.js` files that never went
    // through svelte2tsx — means semantics were suppressed program-wide.
    let any_syntactic = mapped_ts
        .iter()
        .any(|d| d.source == "ts" && d.code.as_deref().is_some_and(is_syntactic_ts_code));
    if !any_syntactic {
        return Vec::new();
    }

    // `.svelte` files whose own source rsvelte failed to parse — the user's
    // bug, already surfaced on the Svelte side, so the matching invalid TSX
    // is a downstream symptom, not an rsvelte codegen defect.
    let svelte_failed: HashSet<&Path> = svelte_side
        .iter()
        .filter(|d| {
            d.source == "svelte"
                && d.severity == DiagnosticSeverity::Error
                && d.code.as_deref() == Some("compile-error")
        })
        .map(|d| d.file.as_path())
        .collect();

    let mut loud = Vec::new();
    for source in overlay_syntax_sources {
        if svelte_failed.contains(source.as_path()) {
            continue;
        }
        let rel = source.strip_prefix(workspace).unwrap_or(source);
        loud.push(Diagnostic {
            file: source.clone(),
            severity: DiagnosticSeverity::Error,
            code: Some("overlay-invalid-tsx".into()),
            message: format!(
                "internal error: rsvelte produced invalid TSX for {} — \
                 TypeScript suppressed type errors for the rest of the project; \
                 please report this at https://github.com/baseballyama/rsvelte/issues",
                rel.display()
            ),
            range: None,
            source: "ts",
        });
    }

    // One program-wide note. Always emitted when syntax errors exist, even
    // when every one is the user's own — semantics are suppressed either
    // way, so this makes the hidden type errors explicit. Non-zero exit is
    // already guaranteed by the underlying syntax Error(s) / internal error.
    loud.push(Diagnostic {
        file: workspace.to_path_buf(),
        severity: DiagnosticSeverity::Warning,
        code: Some("tsgo-semantics-suppressed".into()),
        message: "TypeScript suppressed all semantic (type) diagnostics \
             program-wide because the overlay program contains a syntax error; \
             real type errors elsewhere may be hidden until it is resolved."
            .into(),
        range: None,
        source: "ts",
    });

    loud
}

/// Compile every `.svelte` file in `files` and return diagnostics in
/// stable input order. The compile step is pure CPU and trivially
/// parallel; with the `native` feature we fan out across rayon's
/// global pool, otherwise we fall back to sequential iteration.
fn compile_files(files: &[PathBuf], compiler_opts: &CompilerOptionsSettings) -> Vec<Diagnostic> {
    #[cfg(feature = "rayon")]
    {
        use rayon::prelude::*;
        files
            .par_iter()
            .flat_map_iter(|file| diagnostics_for_file(file, compiler_opts).into_iter())
            .collect()
    }
    #[cfg(not(feature = "rayon"))]
    {
        files
            .iter()
            .flat_map(|file| diagnostics_for_file(file, compiler_opts).into_iter())
            .collect()
    }
}

/// Same as [`compile_files`] but reads `<workspace>/.svelte-check/warnings.json`
/// when `incremental` is true. Files whose `(mtime_ms, size)` matches a
/// cached entry skip the compile pass and emit the cached diagnostics
/// directly. After the run, the cache is rewritten with the fresh
/// `(stats, diagnostics)` pairs so the next incremental run benefits.
fn compile_files_with_cache(
    files: &[PathBuf],
    workspace: &Path,
    incremental: bool,
    compiler_opts: &CompilerOptionsSettings,
) -> Vec<Diagnostic> {
    if !incremental {
        return compile_files(files, compiler_opts);
    }

    let cache_path = workspace.join(".svelte-check").join("warnings.json");
    let mut cache = manifest::load_warnings(&cache_path, workspace);
    // The per-file key is `(mtime_ms, size)`, which a config edit doesn't
    // touch — so if the resolved `compilerOptions` changed since the last
    // run, every cached diagnostic could be stale (e.g. an
    // `experimental_async` error that toggling `experimental.async` should
    // clear). Invalidate the whole cache on a signature mismatch.
    let signature = compiler_opts.signature();
    if cache.config_signature != signature {
        cache.entries.clear();
    }
    cache.config_signature = signature;
    manifest::prune_warnings(&mut cache, files);

    // Per-file lookup → either reuse cached diagnostics or recompile.
    // The output preserves the input file order via a (file -> diags) map.
    let outputs: Vec<(PathBuf, CachedDiagnostics)> = {
        #[cfg(feature = "rayon")]
        {
            use rayon::prelude::*;
            files
                .par_iter()
                .map(|file| compile_or_reuse(file, &cache, compiler_opts))
                .collect()
        }
        #[cfg(not(feature = "rayon"))]
        {
            files
                .iter()
                .map(|file| compile_or_reuse(file, &cache, compiler_opts))
                .collect()
        }
    };

    let mut diagnostics = Vec::new();
    cache.entries.clear();
    for (file, entry) in outputs {
        for d in &entry.diagnostics {
            diagnostics.push(d.clone().into_live());
        }
        cache.entries.insert(file, entry);
    }

    let _ = manifest::save_warnings(&cache_path, &cache, workspace);
    diagnostics
}

fn compile_or_reuse(
    file: &Path,
    cache: &WarningCache,
    compiler_opts: &CompilerOptionsSettings,
) -> (PathBuf, CachedDiagnostics) {
    let stats = current_stats(file);
    if let (Some((mtime, size)), Some(entry)) = (stats, cache.entries.get(file))
        && entry.mtime_ms == mtime
        && entry.size == size
    {
        return (
            file.to_path_buf(),
            CachedDiagnostics {
                mtime_ms: mtime,
                size,
                diagnostics: entry.diagnostics.clone(),
            },
        );
    }

    let diagnostics: Vec<SerializableDiagnostic> = diagnostics_for_file(file, compiler_opts)
        .iter()
        .map(SerializableDiagnostic::from_live)
        .collect();
    let (mtime_ms, size) = stats.unwrap_or((0, 0));
    (
        file.to_path_buf(),
        CachedDiagnostics {
            mtime_ms,
            size,
            diagnostics,
        },
    )
}

fn diagnostics_for_file(file: &Path, compiler_opts: &CompilerOptionsSettings) -> Vec<Diagnostic> {
    let source = match std::fs::read_to_string(file) {
        Ok(s) => s,
        Err(e) => {
            return vec![Diagnostic {
                file: file.to_path_buf(),
                severity: DiagnosticSeverity::Error,
                code: Some("read-error".into()),
                message: format!("could not read file: {e}"),
                range: None,
                source: "svelte",
            }];
        }
    };
    let opts = CompileOptions {
        generate: GenerateMode::Client,
        filename: Some(file.display().to_string()),
        experimental: ExperimentalOptions {
            r#async: compiler_opts.experimental_async,
        },
        runes: compiler_opts.runes,
        ..Default::default()
    };
    match compile(&source, opts) {
        Ok(res) => res
            .warnings
            .into_iter()
            .map(|w| Diagnostic {
                file: file.to_path_buf(),
                severity: DiagnosticSeverity::Warning,
                code: Some(w.code),
                message: w.message,
                range: range_from_warning(w.start.as_ref(), w.end.as_ref()),
                source: "svelte",
            })
            .collect(),
        Err(e) => vec![Diagnostic {
            file: file.to_path_buf(),
            severity: DiagnosticSeverity::Error,
            code: Some("compile-error".into()),
            message: format!("{e}"),
            range: None,
            source: "svelte",
        }],
    }
}

fn range_from_warning(
    start: Option<&crate::compiler::Position>,
    end: Option<&crate::compiler::Position>,
) -> Option<Range> {
    let start = start?;
    let end_pos = end.unwrap_or(start);
    Some(Range {
        start: Position {
            line: start.line as u32,
            // Compiler positions are 0-indexed columns; LSP uses 0-index too.
            column: start.column as u32,
        },
        end: Position {
            line: end_pos.line as u32,
            column: end_pos.column as u32,
        },
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn diag(severity: DiagnosticSeverity, code: &str, source: &'static str) -> Diagnostic {
        Diagnostic {
            file: PathBuf::from("Foo.svelte"),
            severity,
            code: Some(code.into()),
            message: "msg".into(),
            range: None,
            source,
        }
    }

    #[test]
    fn compiler_warnings_ignore_drops_warning_keeps_error() {
        let mut diags = vec![
            diag(DiagnosticSeverity::Warning, "css-unused-selector", "svelte"),
            diag(DiagnosticSeverity::Error, "css-unused-selector", "svelte"),
            diag(DiagnosticSeverity::Warning, "a11y-foo", "svelte"),
        ];
        let mut overrides = HashMap::new();
        overrides.insert("css-unused-selector".into(), WarningOverride::Ignore);
        let opts = RunOptions {
            compiler_warnings: overrides,
            ..RunOptions::default()
        };
        apply_filters(&mut diags, &opts);
        assert_eq!(diags.len(), 2);
        assert_eq!(diags[0].severity, DiagnosticSeverity::Error);
        assert_eq!(diags[1].code.as_deref(), Some("a11y-foo"));
    }

    #[test]
    fn compiler_warnings_error_promotes_warning() {
        let mut diags = vec![diag(DiagnosticSeverity::Warning, "a11y-foo", "svelte")];
        let mut overrides = HashMap::new();
        overrides.insert("a11y-foo".into(), WarningOverride::Error);
        let opts = RunOptions {
            compiler_warnings: overrides,
            ..RunOptions::default()
        };
        apply_filters(&mut diags, &opts);
        assert_eq!(diags.len(), 1);
        assert_eq!(diags[0].severity, DiagnosticSeverity::Error);
    }

    fn ts_diag(file: &str, code: &str, sev: DiagnosticSeverity) -> Diagnostic {
        Diagnostic {
            file: PathBuf::from(file),
            severity: sev,
            code: Some(code.into()),
            message: "msg".into(),
            range: None,
            source: "ts",
        }
    }

    fn svelte_error(file: &str, code: &str) -> Diagnostic {
        Diagnostic {
            file: PathBuf::from(file),
            severity: DiagnosticSeverity::Error,
            code: Some(code.into()),
            message: "compile boom".into(),
            range: None,
            source: "svelte",
        }
    }

    #[test]
    fn loud_clean_program_emits_nothing() {
        // Only semantic diagnostics → no syntax taint → no loud output, so
        // the common all-overlays-valid path gains no false positive.
        let mapped = vec![ts_diag("/ws/A.svelte", "TS2322", DiagnosticSeverity::Error)];
        let loud = overlay_syntax_loud_diagnostics(&[], &mapped, &[], Path::new("/ws"));
        assert!(loud.is_empty(), "{loud:?}");
    }

    #[test]
    fn loud_binder_emitted_ts1192_is_not_a_syntax_taint() {
        // A `.svelte` component with a sibling `Foo.svelte.ts` companion
        // re-exported into its shadow can surface `TS1192` ("Module has no
        // default export"). That code is checker-emitted, NOT a parse error,
        // so tsgo keeps reporting real semantics (the `TS7006` below proves
        // nothing was suppressed). It must therefore raise neither an
        // `overlay-invalid-tsx` internal error nor a `tsgo-semantics-suppressed`
        // note — otherwise every consumer of such a component drowns in a
        // spurious "rsvelte produced invalid TSX" banner.
        let sources = vec![PathBuf::from("/ws/Foo.svelte")];
        let mapped = vec![
            ts_diag("/ws/Foo.svelte", "TS1192", DiagnosticSeverity::Error),
            ts_diag("/ws/Bar.svelte", "TS7006", DiagnosticSeverity::Error),
        ];
        let loud = overlay_syntax_loud_diagnostics(&sources, &mapped, &[], Path::new("/ws"));
        assert!(
            loud.is_empty(),
            "TS1192 is semantic and must not trip the loud syntax-taint path: {loud:?}"
        );
    }

    #[test]
    fn loud_overlay_defect_emits_internal_error_and_note() {
        // rsvelte parsed the .svelte cleanly (no svelte-side compile-error)
        // but the generated TSX failed to parse → blame rsvelte loudly.
        let sources = vec![PathBuf::from("/ws/Foo.svelte")];
        let mapped = vec![ts_diag(
            "/ws/Foo.svelte",
            "TS1005",
            DiagnosticSeverity::Error,
        )];
        let loud = overlay_syntax_loud_diagnostics(&sources, &mapped, &[], Path::new("/ws"));
        let internal = loud
            .iter()
            .find(|d| d.code.as_deref() == Some("overlay-invalid-tsx"))
            .expect("internal error emitted");
        assert_eq!(internal.severity, DiagnosticSeverity::Error);
        assert!(
            internal.message.contains("Foo.svelte"),
            "{}",
            internal.message
        );
        assert!(
            internal.message.contains("please report"),
            "{}",
            internal.message
        );
        assert!(
            loud.iter()
                .any(|d| d.code.as_deref() == Some("tsgo-semantics-suppressed")),
            "suppression note emitted: {loud:?}"
        );
        // The internal error guarantees a non-zero exit.
        let result = RunResult {
            diagnostics: loud,
            ..RunResult::default()
        };
        assert_eq!(result.exit_code(false), 1);
    }

    #[test]
    fn loud_user_svelte_syntax_error_is_not_blamed_on_rsvelte() {
        // The .svelte itself failed rsvelte's own parse → user's bug,
        // already reported on the svelte side. Don't emit an internal
        // error, but still note the program-wide semantic suppression.
        let sources = vec![PathBuf::from("/ws/Bad.svelte")];
        let mapped = vec![ts_diag(
            "/ws/Bad.svelte",
            "TS1109",
            DiagnosticSeverity::Error,
        )];
        let svelte_side = vec![svelte_error("/ws/Bad.svelte", "compile-error")];
        let loud =
            overlay_syntax_loud_diagnostics(&sources, &mapped, &svelte_side, Path::new("/ws"));
        assert!(
            !loud
                .iter()
                .any(|d| d.code.as_deref() == Some("overlay-invalid-tsx")),
            "must not blame rsvelte for the user's own syntax error: {loud:?}"
        );
        assert!(
            loud.iter()
                .any(|d| d.code.as_deref() == Some("tsgo-semantics-suppressed")),
            "{loud:?}"
        );
    }

    #[test]
    fn loud_user_plain_ts_syntax_error_only_notes_suppression() {
        // A syntax error in a plain user `.ts` (passthrough, never went
        // through svelte2tsx) → no overlay source recorded → no internal
        // error, just the program-wide suppression note.
        let mapped = vec![ts_diag("/ws/App.ts", "TS1128", DiagnosticSeverity::Error)];
        let loud = overlay_syntax_loud_diagnostics(&[], &mapped, &[], Path::new("/ws"));
        assert_eq!(loud.len(), 1);
        assert_eq!(loud[0].code.as_deref(), Some("tsgo-semantics-suppressed"));
    }

    #[test]
    fn diagnostic_sources_filter_keeps_only_listed() {
        let mut diags = vec![
            diag(DiagnosticSeverity::Warning, "x", "svelte"),
            diag(DiagnosticSeverity::Error, "x", "ts"),
            diag(DiagnosticSeverity::Warning, "x", "css"),
        ];
        let mut allowed = HashSet::new();
        allowed.insert(DiagnosticSource::Svelte);
        allowed.insert(DiagnosticSource::Ts);
        let opts = RunOptions {
            diagnostic_sources: Some(allowed),
            ..RunOptions::default()
        };
        apply_filters(&mut diags, &opts);
        let sources: Vec<_> = diags.iter().map(|d| d.source).collect();
        assert_eq!(sources, vec!["svelte", "ts"]);
    }
}
