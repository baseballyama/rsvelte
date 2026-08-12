use std::ffi::OsStr;
use std::path::Path;

const SVELTE_EXT: &str = "svelte";

/// Extensions formatted in-process via `oxc_formatter` (the same engine `oxfmt`
/// uses for these files), so they need no `oxfmt` subprocess. JSON is handled by
/// the separate native-JSON path ([`NATIVE_JSON_EXTS`]); everything else `oxfmt`
/// supports (`.css`/`.md`/`.yaml`/`.toml`/`.html`) stays delegated.
const NATIVE_JS_EXTS: &[&str] = &["ts", "tsx", "js", "jsx", "mjs", "cjs", "mts", "cts"];

pub fn is_native_js(p: &Path) -> bool {
    p.extension()
        .and_then(OsStr::to_str)
        .is_some_and(|e| NATIVE_JS_EXTS.contains(&e))
}

/// Extensions formatted in-process via `oxc_formatter_json` (the same engine
/// `oxfmt` uses for JSON, so byte-identical) — except `package.json`, which
/// `oxfmt` additionally runs through `sortPackageJson` (a key-ordering pass that
/// isn't in oxc), so those are delegated to `oxfmt` like a parse-error fallback.
const NATIVE_JSON_EXTS: &[&str] = &["json", "jsonc", "json5"];

pub fn is_native_json(p: &Path) -> bool {
    p.extension()
        .and_then(OsStr::to_str)
        .is_some_and(|e| NATIVE_JSON_EXTS.contains(&e))
}

/// Extensions formatted in-process via `oxc_formatter_css` (the same engine
/// `oxfmt` uses for these files, so byte-identical) — brace-based CSS dialects
/// only. `.sass`/`.styl` (indented syntax) aren't handled by `oxc_formatter_css`
/// and stay delegated to `oxfmt`.
const NATIVE_CSS_EXTS: &[&str] = &["css", "scss", "less"];

pub fn is_native_css(p: &Path) -> bool {
    p.extension()
        .and_then(OsStr::to_str)
        .is_some_and(|e| NATIVE_CSS_EXTS.contains(&e))
}

/// `package.json` needs oxfmt's `sortPackageJson`; never format it natively.
pub fn is_package_json(p: &Path) -> bool {
    p.file_name().and_then(OsStr::to_str) == Some("package.json")
}

/// `oxc_formatter_core::LineWidth`'s maximum (1..=320). A file whose resolved
/// `printWidth` exceeds this can't be represented natively, so it's delegated to
/// oxfmt (which honors larger widths) to keep output byte-identical.
pub const LINE_WIDTH_MAX: u16 = 320;

/// oxfmt exclude pattern that keeps `.svelte` files out of the delegated pass —
/// those are handled in-process by `rsvelte_formatter`. Applies to directory
/// walks and to any explicitly-passed `.svelte` path.
pub const OXFMT_EXCLUDE_SVELTE: &str = "!**/*.svelte";

/// oxfmt exclude globs that keep the native-`.ts`/`.js` set out of the delegated
/// directory pass — those are handled in-process. One per extension in
/// [`NATIVE_JS_EXTS`]; only added when the native path is enabled.
pub const OXFMT_EXCLUDE_NATIVE_JS: &[&str] = &[
    "!**/*.ts",
    "!**/*.tsx",
    "!**/*.js",
    "!**/*.jsx",
    "!**/*.mjs",
    "!**/*.cjs",
    "!**/*.mts",
    "!**/*.cts",
];

/// oxfmt exclude globs that keep the native-JSON set out of the delegated
/// directory pass — non-`package.json` JSON is formatted in-process. `oxfmt`
/// still formats `package.json` (re-included as explicit paths for the
/// `sortPackageJson` pass) and any native parse-error fallbacks.
pub const OXFMT_EXCLUDE_NATIVE_JSON: &[&str] = &["!**/*.json", "!**/*.jsonc", "!**/*.json5"];

/// oxfmt exclude globs that keep the native-CSS set out of the delegated
/// directory pass — those are formatted in-process. One per extension in
/// [`NATIVE_CSS_EXTS`]; only added when the native-CSS path is enabled.
pub const OXFMT_EXCLUDE_NATIVE_CSS: &[&str] = &["!**/*.css", "!**/*.scss", "!**/*.less"];

pub fn is_svelte(p: &Path) -> bool {
    p.extension().and_then(OsStr::to_str) == Some(SVELTE_EXT)
}
