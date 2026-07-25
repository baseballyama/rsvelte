use std::io::Write;
use std::path::{Path, PathBuf};
use std::process::Stdio;
use std::sync::Arc;

use oxc_formatter::JsFormatOptions;
use oxc_formatter_core::{IndentStyle, IndentWidth, LineWidth};
use rsvelte_formatter::{
    CssFormatOptions, CssSingleQuote, CssTrailingCommas, FormatOptions, JsonFormatOptions,
    JsonVariant, SortOrderSpec,
};

use crate::cli::Cli;
use crate::config::OxfmtConfig;
use crate::oxfmt::{oxfmt_command, oxfmt_ext};
use crate::tailwind;
use crate::tailwind_sidecar;
use crate::tailwind_sort::{PendingJsSort, js_sort_env};

/// The option-resolution inputs the command line contributes, split out of
/// [`Cli`] so an in-process embedder (the language server) resolves options
/// through exactly the same layering as the CLI instead of reimplementing it.
#[derive(Debug, Clone)]
pub(crate) struct OptionFlags {
    pub(crate) print_width: Option<u16>,
    pub(crate) tab_width: Option<u8>,
    pub(crate) use_tabs: bool,
    pub(crate) no_native_css: bool,
    pub(crate) oxfmt_bin: PathBuf,
}

impl Default for OptionFlags {
    fn default() -> Self {
        Self {
            print_width: None,
            tab_width: None,
            use_tabs: false,
            no_native_css: false,
            oxfmt_bin: PathBuf::from("oxfmt"),
        }
    }
}

impl OptionFlags {
    pub(crate) fn from_cli(cli: &Cli) -> Self {
        Self {
            print_width: cli.print_width,
            tab_width: cli.tab_width,
            use_tabs: cli.use_tabs,
            no_native_css: cli.no_native_css,
            oxfmt_bin: cli.oxfmt_bin.clone(),
        }
    }
}

/// Build the [`FormatOptions`] for the in-process Svelte formatter, layering
/// the resolved `.oxfmtrc` under any explicit CLI flags. Precedence for the
/// keys that exist in both places (`--print-width`/`--tab-width`/`--use-tabs`):
/// CLI flag > `.oxfmtrc` > built-in default. Keys with no CLI equivalent
/// (`singleQuote`, `semi`, `trailingComma`, …) come straight from `.oxfmtrc`.
pub(crate) fn build_format_options(
    cli: &OptionFlags,
    cfg: &OxfmtConfig,
) -> (FormatOptions, Option<PendingJsSort>) {
    let use_tabs = cli.use_tabs || cfg.use_tabs.unwrap_or(false);
    let indent_style = if use_tabs {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    let tab_width = cli.tab_width.or(cfg.tab_width).unwrap_or(2);
    let print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let indent_width = IndentWidth::try_from(tab_width).unwrap_or(IndentWidth::default());
    let line_width = LineWidth::try_from(print_width).unwrap_or(LineWidth::default());

    let mut js = JsFormatOptions {
        indent_style,
        indent_width,
        line_width,
        ..JsFormatOptions::new()
    };
    // Layer the remaining `.oxfmtrc` JS keys (quotes, semicolons, …) so inline
    // `<script>` blocks match standalone files. See #693.
    cfg.apply_js(&mut js);
    // `sortImports` reorders imports inside embedded `<script>` (and native
    // `.ts`/`.js`) just as oxfmt does for standalone files.
    js.sort_imports = cfg.sort_imports_options();

    // Resolve `svelteSortOrder`; an unrecognised value falls back to the default
    // and warns, mirroring oxfmt rejecting it (we warn rather than hard-fail).
    let sort_order = match &cfg.svelte_sort_order {
        Some(s) => SortOrderSpec::parse(s).unwrap_or_else(|| {
            eprintln!(
                "rsvelte-fmt: warning: unrecognised svelteSortOrder \"{s}\"; using the default \
                 \"options-scripts-markup-styles\""
            );
            SortOrderSpec::default()
        }),
        None => SortOrderSpec::default(),
    };

    // `sortTailwindcss` orders class names by the project's tailwind stylesheet.
    // A stock, zero-config setup sorts natively (byte-for-byte). A custom
    // stylesheet / config is delegated to a Node sidecar running the real
    // `prettier-plugin-tailwindcss` (see `PendingJsSort`); the sort itself is
    // resolved later, once every class string across the run is collected. With
    // no Node available we warn and leave classes unchanged. The Node probe runs
    // lazily — only if `decide` reaches a JS branch — so a stock config never
    // spawns `node --version`; the probed env is captured for the `SortViaJs` arm.
    let mut js_env: Option<tailwind_sidecar::SidecarEnv> = None;
    let decision = tailwind::decide(cfg.sort_tailwindcss.as_ref(), cfg.path.as_deref(), || {
        js_env = js_sort_env();
        js_env.is_some()
    });
    let (class_sorter, class_attributes, pending_js) = match decision {
        tailwind::Decision::Sort { sorter, attributes } => (Some(sorter), attributes, None),
        tailwind::Decision::SortViaJs {
            filepath,
            stylesheet_path,
            config_path,
            attributes,
            preserve_whitespace,
            preserve_duplicates,
        } => (
            None,
            attributes,
            Some(PendingJsSort {
                env: js_env.expect("the js probe set an env when it returned SortViaJs"),
                filepath,
                stylesheet_path,
                config_path,
                preserve_whitespace,
                preserve_duplicates,
            }),
        ),
        tailwind::Decision::Skip { reason } => {
            eprintln!("rsvelte-fmt: warning: `sortTailwindcss` left unapplied — {reason}.");
            (None, Vec::new(), None)
        }
        tailwind::Decision::Off => (None, Vec::new(), None),
    };

    // `functions` (script `cn(...)` / `cva(...)` sorting) applies only when a sort
    // is actually active — native (`class_sorter`) or the JS sidecar (`pending_js`).
    let tailwind_functions = if class_sorter.is_some() || pending_js.is_some() {
        tailwind::function_names(cfg.sort_tailwindcss.as_ref())
    } else {
        Vec::new()
    };

    // Embedded `<style>` blocks are formatted in-process via `oxc_formatter_css`
    // by default (same engine as `oxfmt`, no subprocess). `--no-native-css`
    // reverts to spawning `oxfmt`, which the batched Svelte pipeline drives.
    let style_formatter = if cli.no_native_css {
        make_oxfmt_style_formatter(cli.oxfmt_bin.clone(), cfg.oxfmt_arg_path.clone())
    } else {
        rsvelte_formatter::native_style_formatter(build_css_options(cli, cfg))
    };

    let options = FormatOptions {
        js,
        style_formatter: Some(style_formatter),
        // `format` derives this per-document from `<script lang="ts">`.
        typescript: false,
        single_attribute_per_line: cfg.single_attribute_per_line.unwrap_or(false),
        allow_shorthand: cfg.svelte_allow_shorthand.unwrap_or(true),
        indent_script_and_style: cfg.svelte_indent_script_and_style.unwrap_or(true),
        sort_order,
        bracket_same_line: cfg.bracket_same_line.unwrap_or(false),
        class_sorter,
        class_attributes,
        tailwind_functions,
    };
    (options, pending_js)
}

/// The base [`JsonFormatOptions`] for the native-JSON path: width/indent/EOL
/// resolved exactly as the JS path, plus `bracketSpacing`. `objectWrap` is left
/// at oxc's default (`Expand::Auto` = Prettier `preserve`), matching `oxfmt`.
/// `variant` is set per file by [`json_variant`].
pub(crate) fn build_json_options(cli: &OptionFlags, cfg: &OxfmtConfig) -> JsonFormatOptions {
    let use_tabs = cli.use_tabs || cfg.use_tabs.unwrap_or(false);
    let indent_style = if use_tabs {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    let tab_width = cli.tab_width.or(cfg.tab_width).unwrap_or(2);
    let print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let indent_width = IndentWidth::try_from(tab_width).unwrap_or_default();
    let line_width = LineWidth::try_from(print_width).unwrap_or_default();

    let mut opts = JsonFormatOptions {
        indent_style,
        indent_width,
        line_width,
        ..JsonFormatOptions::default()
    };
    if let Some(eol) = cfg.end_of_line {
        opts.line_ending = eol;
    }
    if let Some(spacing) = cfg.bracket_spacing {
        opts.bracket_spacing = spacing.into();
    }
    opts
}

/// The `oxc_formatter_json` variant for a file extension, mirroring how `oxfmt`
/// picks a JSON parser/printer per extension.
pub(crate) fn json_variant(ext: &str) -> JsonVariant {
    match ext {
        "jsonc" => JsonVariant::Jsonc,
        "json5" => JsonVariant::Json5,
        _ => JsonVariant::Json,
    }
}

/// The base [`CssFormatOptions`] for the native-CSS path: width/indent/EOL
/// resolved exactly as the JS/JSON paths, plus `singleQuote` / `trailingComma`
/// (the only Prettier keys the CSS languages consume). `variant` is set per
/// file/block by the caller; `line_width` is narrowed per embedded `<style>`
/// block to its column.
pub(crate) fn build_css_options(cli: &OptionFlags, cfg: &OxfmtConfig) -> CssFormatOptions {
    let use_tabs = cli.use_tabs || cfg.use_tabs.unwrap_or(false);
    let indent_style = if use_tabs {
        IndentStyle::Tab
    } else {
        IndentStyle::Space
    };
    let tab_width = cli.tab_width.or(cfg.tab_width).unwrap_or(2);
    let print_width = cli.print_width.or(cfg.print_width).unwrap_or(80);
    let indent_width = IndentWidth::try_from(tab_width).unwrap_or_default();
    let line_width = LineWidth::try_from(print_width).unwrap_or_default();

    let mut opts = CssFormatOptions {
        indent_style,
        indent_width,
        line_width,
        ..CssFormatOptions::default()
    };
    if let Some(eol) = cfg.end_of_line {
        opts.line_ending = eol;
    }
    if let Some(single) = cfg.single_quote {
        opts.single_quote = CssSingleQuote::from(single);
    }
    // Prettier's `trailingComma` reaches only multi-line SCSS maps for CSS:
    // `none` → no trailing comma, everything else (`all`/`es5`, or the unset
    // default) → trailing comma. Matches `oxc_formatter_css`'s own default.
    opts.trailing_commas = match cfg.trailing_comma {
        Some(oxc_formatter::TrailingCommas::None) => CssTrailingCommas::Never,
        _ => CssTrailingCommas::Always,
    };
    opts
}

/// Build the callback that runs `oxfmt --stdin-filepath inline.<lang>`
/// for every `<style>` body inside a `.svelte` file.
/// This way CSS / SCSS / Less inside Svelte components are formatted
/// by the same engine that handles standalone `.css` files.
/// Build a per-width oxfmt config: start from the base config's JSON (if any) and
/// force `printWidth = width`, so embedded `<style>` CSS wraps at the column it
/// renders at. Returns the temp config path, or the base config (no override) for
/// a non-JSON / unreadable base. Configs are cached by width under a per-process
/// temp dir.
pub(crate) fn css_config_for_width(base: Option<&Path>, width: usize) -> Option<PathBuf> {
    let json = css_options_for_width(base, width);
    if !json.is_object() {
        return base.map(Path::to_path_buf);
    }
    let dir = std::env::temp_dir().join(format!("rsvelte-fmt-css-cfg-{}", std::process::id()));
    if std::fs::create_dir_all(&dir).is_err() {
        return base.map(Path::to_path_buf);
    }
    let p = dir.join(format!("w{width}.json"));
    match std::fs::write(&p, json.to_string()) {
        Ok(()) => Some(p),
        Err(_) => base.map(Path::to_path_buf),
    }
}

/// The resolved oxfmt options for an inline `<style>` block at `width`: the base
/// `.oxfmtrc` (if any) with `printWidth` forced to the block's column. Returned
/// as a JSON value so the daemon path can send it inline as `format()`'s options
/// and the spawn path can serialize it to a temp config — both at byte parity.
pub(crate) fn css_options_for_width(base: Option<&Path>, width: usize) -> serde_json::Value {
    let mut json: serde_json::Value = base
        .and_then(|p| std::fs::read_to_string(p).ok())
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_else(|| serde_json::Value::Object(serde_json::Map::new()));
    if let Some(obj) = json.as_object_mut() {
        obj.insert("printWidth".into(), serde_json::Value::from(width));
    }
    json
}

fn make_oxfmt_style_formatter(
    oxfmt: PathBuf,
    config: Option<PathBuf>,
) -> rsvelte_formatter::StyleFormatter {
    Arc::new(
        move |body: &str, lang: &str, width: usize| -> Result<String, String> {
            let filename = format!("inline.{}", oxfmt_ext(lang));
            // oxfmt reads stdin implicitly when `--stdin-filepath` is given with no
            // path arguments. It has no `--stdin` flag and errors if one is passed
            // (#680), so feed the body on stdin and pass only `--stdin-filepath`.
            let mut cmd = oxfmt_command(&oxfmt);
            // Force the resolved project config (with printWidth narrowed to the
            // style's column) so inline `<style>` settings match standalone files.
            // See #693.
            let cfg = css_config_for_width(config.as_deref(), width);
            if let Some(c) = &cfg {
                cmd.arg("-c").arg(c);
            }
            let mut child = cmd
                .arg("--stdin-filepath")
                .arg(&filename)
                .stdin(Stdio::piped())
                .stdout(Stdio::piped())
                .stderr(Stdio::piped())
                .spawn()
                .map_err(|e| format!("spawn `{}`: {e}", oxfmt.display()))?;
            if let Some(mut stdin) = child.stdin.take() {
                stdin
                    .write_all(body.as_bytes())
                    .map_err(|e| format!("write stdin: {e}"))?;
            }
            let out = child.wait_with_output().map_err(|e| format!("wait: {e}"))?;
            if !out.status.success() {
                return Err(format!(
                    "oxfmt for {filename} exited with {:?}: {}",
                    out.status.code(),
                    String::from_utf8_lossy(&out.stderr)
                ));
            }
            String::from_utf8(out.stdout).map_err(|e| format!("oxfmt produced invalid utf-8: {e}"))
        },
    )
}
