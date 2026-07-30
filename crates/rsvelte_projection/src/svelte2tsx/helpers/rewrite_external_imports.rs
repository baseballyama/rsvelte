//! Rewrite relative import specifiers that escape the workspace so they stay
//! valid from the generated `.tsx` location — mirrors
//! `src/helpers/rewriteExternalImports.ts`.

use super::super::interfaces::RewriteExternalImportsOptions;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub(crate) struct TextEdit {
    pub(crate) start: u32,
    pub(crate) end: u32,
    pub(crate) replacement_len: u32,
    pub(crate) replacement_utf16_len: u32,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct TextRewrite {
    pub(crate) replacement: Option<String>,
    pub(crate) edits: Vec<TextEdit>,
}

fn parent_dir(path: &str) -> &str {
    match path.rfind('/') {
        Some(0) => &path[..1],
        Some(i) => &path[..i],
        None => "",
    }
}

#[derive(Debug, Clone, Copy)]
struct ComponentRange {
    start: usize,
    end: usize,
}

#[derive(Debug, Clone, Copy)]
struct TargetComponent {
    truncate_to: usize,
    range: ComponentRange,
}

struct PreparedRewritePaths<'a> {
    source_target: String,
    source_components: Vec<TargetComponent>,
    generated_dir: &'a str,
    generated_components: Vec<ComponentRange>,
    workspace_dir: &'a str,
}

impl<'a> PreparedRewritePaths<'a> {
    fn new(opts: &'a RewriteExternalImportsOptions) -> Self {
        let source_dir = parent_dir(&opts.source_path);
        let mut source_target = String::with_capacity(source_dir.len().max(1));
        let mut source_components = Vec::new();
        if source_dir.starts_with('/') {
            source_target.push('/');
        }
        for component in source_dir
            .split('/')
            .filter(|component| !component.is_empty() && *component != ".")
        {
            push_target_component(&mut source_target, &mut source_components, component);
        }

        let generated_dir = parent_dir(&opts.generated_path);
        let mut generated_components = Vec::new();
        let mut offset = 0;
        for component in generated_dir.split('/') {
            let start = offset;
            let end = start + component.len();
            // A `.` segment must not count as a directory level for the
            // common-prefix walk in `write_relative_target` — e.g. a
            // relative `.` workspace joined onto a file path via
            // `PathBuf::join` (which does not normalise) leaves one here,
            // and counting it inflates the `..` count by one (#1919).
            if !component.is_empty() && component != "." {
                generated_components.push(ComponentRange { start, end });
            }
            offset = end + 1;
        }

        Self {
            source_target,
            source_components,
            generated_dir,
            generated_components,
            workspace_dir: opts.workspace_path.trim_end_matches('/'),
        }
    }

    fn compute_rewrite(&self, specifier: &str, scratch: &mut RewriteScratch) -> Option<usize> {
        let suffix_start = split_specifier(specifier);
        let path_part = &specifier[..suffix_start];
        if !path_part.starts_with("../") {
            return None;
        }

        scratch.target.clear();
        scratch.target.push_str(&self.source_target);
        scratch.target_components.clear();
        scratch
            .target_components
            .extend_from_slice(&self.source_components);
        scratch.target.reserve(path_part.len());

        for component in path_part.split('/') {
            if component.is_empty() || component == "." {
                continue;
            }
            if component == ".." {
                if let Some(component) = scratch.target_components.pop() {
                    scratch.target.truncate(component.truncate_to);
                }
            } else {
                push_target_component(
                    &mut scratch.target,
                    &mut scratch.target_components,
                    component,
                );
            }
        }

        if is_within_dir(&scratch.target, self.workspace_dir) {
            return None;
        }

        self.write_relative_target(scratch);
        (scratch.rewritten != path_part).then_some(suffix_start)
    }

    fn write_relative_target(&self, scratch: &mut RewriteScratch) {
        let common = self
            .generated_components
            .iter()
            .zip(&scratch.target_components)
            .take_while(|(generated, target)| {
                self.generated_dir[generated.start..generated.end]
                    == scratch.target[target.range.start..target.range.end]
            })
            .count();

        scratch.rewritten.clear();
        scratch
            .rewritten
            .reserve(self.generated_dir.len() + scratch.target.len());
        for _ in common..self.generated_components.len() {
            push_path_component(&mut scratch.rewritten, "..");
        }
        for target in scratch.target_components.iter().skip(common) {
            push_path_component(
                &mut scratch.rewritten,
                &scratch.target[target.range.start..target.range.end],
            );
        }
        if scratch.rewritten.is_empty() {
            scratch.rewritten.push('.');
        }
    }
}

struct RewriteScratch {
    target: String,
    target_components: Vec<TargetComponent>,
    rewritten: String,
}

impl RewriteScratch {
    fn new(paths: &PreparedRewritePaths<'_>) -> Self {
        Self {
            target: String::with_capacity(paths.source_target.len() + 32),
            target_components: Vec::with_capacity(paths.source_components.len() + 8),
            rewritten: String::with_capacity(
                paths.generated_dir.len() + paths.source_target.len() + 32,
            ),
        }
    }
}

fn push_target_component(
    target: &mut String,
    components: &mut Vec<TargetComponent>,
    component: &str,
) {
    let truncate_to = target.len();
    if !target.is_empty() && !target.ends_with('/') {
        target.push('/');
    }
    let start = target.len();
    target.push_str(component);
    components.push(TargetComponent {
        truncate_to,
        range: ComponentRange {
            start,
            end: target.len(),
        },
    });
}

fn push_path_component(path: &mut String, component: &str) {
    if !path.is_empty() {
        path.push('/');
    }
    path.push_str(component);
}

fn is_within_dir(target: &str, dir: &str) -> bool {
    target == dir || (target.starts_with(dir) && target.as_bytes().get(dir.len()) == Some(&b'/'))
}

fn split_specifier(spec: &str) -> usize {
    let q = spec.find('?');
    let h = spec.find('#');
    match (q, h) {
        (None, None) => spec.len(),
        (Some(q), None) => q,
        (None, Some(h)) => h,
        (Some(q), Some(h)) => q.min(h),
    }
}

#[inline]
fn is_ws_byte(b: u8) -> bool {
    matches!(b, b' ' | b'\t' | b'\n' | b'\r')
}

#[inline]
fn is_ident_byte_local(b: u8) -> bool {
    b.is_ascii_alphanumeric() || b == b'_' || b == b'$'
}

/// String-level version of `rewrite_external_imports` — same scanner, but
/// returns replacement text only when at least one specifier changes.
pub(crate) fn rewrite_external_specifiers_in_text(
    text: &str,
    opts: &RewriteExternalImportsOptions,
) -> TextRewrite {
    let paths = PreparedRewritePaths::new(opts);
    let mut scratch = RewriteScratch::new(&paths);
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut replacement: Option<String> = None;
    let mut edits = Vec::new();
    let mut copied = 0usize;
    let mut i = 0;

    let mut try_rewrite_specifier = |spec_start: usize,
                                     spec_end: usize,
                                     replacement: &mut Option<String>,
                                     copied: &mut usize| {
        let spec = &text[spec_start..spec_end];
        if let Some(suffix_start) = paths.compute_rewrite(spec, &mut scratch) {
            let suffix = &spec[suffix_start..];
            let replacement_len = scratch.rewritten.len() + suffix.len();
            let replacement_utf16_len =
                scratch.rewritten.encode_utf16().count() + suffix.encode_utf16().count();
            let out = replacement.get_or_insert_with(|| String::with_capacity(text.len()));
            out.push_str(&text[*copied..spec_start]);
            out.push_str(&scratch.rewritten);
            out.push_str(suffix);
            edits.push(TextEdit {
                start: spec_start as u32,
                end: spec_end as u32,
                replacement_len: replacement_len as u32,
                replacement_utf16_len: replacement_utf16_len as u32,
            });
            *copied = spec_end;
        }
    };

    while i < len {
        let b = bytes[i];

        if b == b'\'' || b == b'"' {
            let q = b;
            i += 1;
            while i < len && bytes[i] != q {
                if bytes[i] == b'\\' && i + 1 < len {
                    i += 2;
                    continue;
                }
                i += 1;
            }
            i = (i + 1).min(len);
            continue;
        }

        if b == b'/' && i + 1 < len && bytes[i + 1] == b'/' {
            while i < len && bytes[i] != b'\n' {
                i += 1;
            }
            continue;
        }

        if b == b'f' && i + 4 <= len && &bytes[i..i + 4] == b"from" {
            let prev_ok = i == 0 || !is_ident_byte_local(bytes[i - 1]);
            if prev_ok {
                let mut j = i + 4;
                while j < len && is_ws_byte(bytes[j]) {
                    j += 1;
                }
                if j < len && (bytes[j] == b'\'' || bytes[j] == b'"') {
                    let q = bytes[j];
                    let spec_start = j + 1;
                    let mut spec_end = spec_start;
                    while spec_end < len && bytes[spec_end] != q {
                        spec_end += 1;
                    }
                    try_rewrite_specifier(spec_start, spec_end, &mut replacement, &mut copied);
                    i = spec_end + 1;
                    continue;
                }
            }
        }

        if b == b'i' && i + 6 <= len && &bytes[i..i + 6] == b"import" {
            let prev_ok = i == 0 || !is_ident_byte_local(bytes[i - 1]);
            if prev_ok {
                let mut j = i + 6;
                while j < len && is_ws_byte(bytes[j]) {
                    j += 1;
                }
                if j < len && bytes[j] == b'(' {
                    j += 1;
                    while j < len && is_ws_byte(bytes[j]) {
                        j += 1;
                    }
                    if j < len && (bytes[j] == b'\'' || bytes[j] == b'"') {
                        let q = bytes[j];
                        let spec_start = j + 1;
                        let mut spec_end = spec_start;
                        while spec_end < len && bytes[spec_end] != q {
                            spec_end += 1;
                        }
                        try_rewrite_specifier(spec_start, spec_end, &mut replacement, &mut copied);
                        i = spec_end + 1;
                        continue;
                    }
                }
            }
        }

        i += 1;
    }
    if let Some(out) = &mut replacement {
        out.push_str(&text[copied..]);
    }
    TextRewrite { replacement, edits }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn parent_dir_oracle(path: &str) -> String {
        match path.rfind('/') {
            Some(0) => "/".to_string(),
            Some(i) => path[..i].to_string(),
            None => "".to_string(),
        }
    }

    fn resolve_posix_oracle(base: &str, rel: &str) -> String {
        let abs = base.starts_with('/');
        let mut parts: Vec<&str> = base
            .split('/')
            .filter(|part| !part.is_empty() && *part != ".")
            .collect();
        for part in rel.split('/') {
            if part.is_empty() || part == "." {
                continue;
            }
            if part == ".." {
                parts.pop();
            } else {
                parts.push(part);
            }
        }
        let joined = parts.join("/");
        if abs { format!("/{joined}") } else { joined }
    }

    fn relative_posix_oracle(from: &str, to: &str) -> String {
        // Mirrors `PreparedRewritePaths::new`'s `generated_components` filter
        // (#1919): a `.` segment isn't a directory level.
        let from_parts: Vec<&str> = from
            .split('/')
            .filter(|component| !component.is_empty() && *component != ".")
            .collect();
        let to_parts: Vec<&str> = to
            .split('/')
            .filter(|component| !component.is_empty() && *component != ".")
            .collect();
        let common = from_parts
            .iter()
            .zip(to_parts.iter())
            .take_while(|(from, to)| from == to)
            .count();
        let mut result = Vec::new();
        for _ in common..from_parts.len() {
            result.push("..".to_string());
        }
        for component in to_parts.iter().skip(common) {
            result.push((*component).to_string());
        }
        if result.is_empty() {
            ".".to_string()
        } else {
            result.join("/")
        }
    }

    fn compute_rewrite_oracle(
        specifier: &str,
        opts: &RewriteExternalImportsOptions,
    ) -> Option<String> {
        let suffix_start = split_specifier(specifier);
        let path_part = &specifier[..suffix_start];
        let suffix = &specifier[suffix_start..];
        if !path_part.starts_with("../") {
            return None;
        }
        let source_dir = parent_dir_oracle(&opts.source_path);
        let generated_dir = parent_dir_oracle(&opts.generated_path);
        let target = resolve_posix_oracle(&source_dir, path_part);
        let workspace_dir = opts.workspace_path.trim_end_matches('/');
        if target == workspace_dir || target.starts_with(&format!("{workspace_dir}/")) {
            return None;
        }
        let rewritten = relative_posix_oracle(&generated_dir, &target);
        let full = format!("{rewritten}{suffix}");
        (full != specifier).then_some(full)
    }

    fn compute_prepared(specifier: &str, opts: &RewriteExternalImportsOptions) -> Option<String> {
        let paths = PreparedRewritePaths::new(opts);
        let mut scratch = RewriteScratch::new(&paths);
        paths
            .compute_rewrite(specifier, &mut scratch)
            .map(|suffix_start| {
                let mut rewritten = scratch.rewritten;
                rewritten.push_str(&specifier[suffix_start..]);
                rewritten
            })
    }

    fn rewrite_options() -> RewriteExternalImportsOptions {
        RewriteExternalImportsOptions {
            source_path: "/workspace/src/App.svelte".to_string(),
            generated_path: "/workspace/.generated/nested/App.svelte.tsx".to_string(),
            workspace_path: "/workspace".to_string(),
        }
    }

    #[test]
    fn no_op_reuses_the_callers_large_buffer() {
        let mut text = "const untouched = 1;\n".repeat(65_536);
        text.push_str("import local from './local.js';\nconst lazy = import('../shared.js');\n");
        let original_ptr = text.as_ptr();
        let original_capacity = text.capacity();
        let rewrite = rewrite_external_specifiers_in_text(&text, &rewrite_options());

        assert!(rewrite.replacement.is_none());
        assert!(rewrite.edits.is_empty());
        let output = rewrite.replacement.unwrap_or(text);
        assert_eq!(output.as_ptr(), original_ptr);
        assert_eq!(output.capacity(), original_capacity);
    }

    #[test]
    fn matches_oracle_across_import_counts() {
        for count in [1, 16, 256, 4096] {
            let opts = rewrite_options();
            let mut input = String::new();
            let mut expected = String::new();
            let mut expected_edits = Vec::new();

            for index in 0..count {
                let specifier = match index % 4 {
                    0 => format!("../../outside/asset-{index}.js?raw#fragment"),
                    1 => format!("../inside/asset-{index}.js"),
                    2 => format!("./local/asset-{index}.js"),
                    _ => format!("../../外部/😀-{index}.js#fragment?raw"),
                };
                let (prefix, suffix) = if index % 2 == 0 {
                    (format!("import value{index} from \""), "\";\n")
                } else {
                    (format!("const value{index} = import('"), "');\n")
                };
                input.push_str(&prefix);
                expected.push_str(&prefix);
                let start = input.len();
                input.push_str(&specifier);
                let end = input.len();

                if let Some(rewritten) = compute_rewrite_oracle(&specifier, &opts) {
                    expected.push_str(&rewritten);
                    expected_edits.push(TextEdit {
                        start: start as u32,
                        end: end as u32,
                        replacement_len: rewritten.len() as u32,
                        replacement_utf16_len: rewritten.encode_utf16().count() as u32,
                    });
                } else {
                    expected.push_str(&specifier);
                }
                input.push_str(suffix);
                expected.push_str(suffix);
            }

            let actual = rewrite_external_specifiers_in_text(&input, &opts);
            assert_eq!(actual.replacement.as_deref(), Some(expected.as_str()));
            assert_eq!(actual.edits, expected_edits);
        }
    }

    #[test]
    fn preserves_scanner_detection_set() {
        let input = concat!(
            "const literal = \"from '../../outside/literal.js'\";\n",
            "// import('../../outside/line-comment.js')\n",
            "/* from '../../outside/block-comment.js' */\n",
            "perform from \"../../outside/broad-match.js\";\n",
            "const dynamic = import('../../outside/dynamic.js');\n",
            "ximport('../../outside/prefixed.js');\n",
        );
        let expected = concat!(
            "const literal = \"from '../../outside/literal.js'\";\n",
            "// import('../../outside/line-comment.js')\n",
            "/* from '../../../outside/block-comment.js' */\n",
            "perform from \"../../../outside/broad-match.js\";\n",
            "const dynamic = import('../../../outside/dynamic.js');\n",
            "ximport('../../outside/prefixed.js');\n",
        );

        let actual = rewrite_external_specifiers_in_text(input, &rewrite_options());
        assert_eq!(actual.replacement.as_deref(), Some(expected));
        assert_eq!(actual.edits.len(), 3);
    }

    #[test]
    fn preserves_audited_posix_path_semantics() {
        let cases = [
            (
                RewriteExternalImportsOptions {
                    source_path: "/root/base/../src/App.svelte".to_string(),
                    generated_path: "/generated/out/App.svelte.tsx".to_string(),
                    workspace_path: "/elsewhere".to_string(),
                },
                "../asset.js",
                Some("../../root/base/../asset.js"),
            ),
            (
                RewriteExternalImportsOptions {
                    source_path: "/workspace/src/App.svelte".to_string(),
                    generated_path: "/workspace/App.svelte.tsx".to_string(),
                    workspace_path: "/elsewhere".to_string(),
                },
                "../?raw#fragment",
                Some(".?raw#fragment"),
            ),
            (
                RewriteExternalImportsOptions {
                    source_path: "/workspace/src/App.svelte".to_string(),
                    generated_path: "/workspace/generated/nested/App.svelte.tsx".to_string(),
                    workspace_path: "/workspace".to_string(),
                },
                "../../workspace-other/asset.js#fragment?raw",
                Some("../../../workspace-other/asset.js#fragment?raw"),
            ),
            (
                RewriteExternalImportsOptions {
                    source_path: "/workspace/src/App.svelte".to_string(),
                    generated_path: "/workspace/generated/App.svelte.tsx".to_string(),
                    workspace_path: "/workspace".to_string(),
                },
                "../../../../outside/asset.js?raw#fragment",
                Some("../../outside/asset.js?raw#fragment"),
            ),
            (
                RewriteExternalImportsOptions {
                    source_path: "/workspace/src/App.svelte".to_string(),
                    generated_path: "/workspace/generated/App.svelte.tsx".to_string(),
                    workspace_path: "/workspace".to_string(),
                },
                "../inside/asset.js",
                None,
            ),
        ];

        for (opts, specifier, expected) in cases {
            assert_eq!(
                compute_prepared(specifier, &opts).as_deref(),
                expected,
                "{specifier}"
            );
            assert_eq!(
                compute_prepared(specifier, &opts),
                compute_rewrite_oracle(specifier, &opts),
                "{specifier}"
            );
        }
    }

    #[test]
    fn matches_oracle_for_deep_paths() {
        let source_path = format!(
            "/workspace/{}/App.svelte",
            (0..192)
                .map(|index| format!("source-{index}"))
                .collect::<Vec<_>>()
                .join("/")
        );
        let generated_path = format!(
            "/workspace/.generated/{}/App.svelte.tsx",
            (0..160)
                .map(|index| format!("generated-{index}"))
                .collect::<Vec<_>>()
                .join("/")
        );
        let specifier = format!("{}外部/😀.js?raw#fragment", "../".repeat(256));
        let opts = RewriteExternalImportsOptions {
            source_path,
            generated_path,
            workspace_path: "/unrelated".to_string(),
        };

        assert_eq!(
            compute_prepared(&specifier, &opts),
            compute_rewrite_oracle(&specifier, &opts)
        );
    }

    #[test]
    fn deterministic_paths_match_previous_implementation() {
        const COMPONENTS: [&str; 7] = ["alpha", "beta", ".", "..", "", "日本", "é"];
        const WORKSPACES: [&str; 7] = [
            "/workspace",
            "/workspace/",
            "/",
            "",
            "/workspace-other",
            "relative",
            "日本",
        ];
        const SUFFIXES: [&str; 6] = [
            "",
            "?raw",
            "#fragment",
            "?raw#fragment",
            "#fragment?raw",
            "?日本#é",
        ];

        fn next(state: &mut u64) -> u64 {
            *state = (*state)
                .wrapping_mul(6_364_136_223_846_793_005)
                .wrapping_add(1_442_695_040_888_963_407);
            *state
        }

        fn make_path(state: &mut u64, absolute: bool, depth: usize, filename: &str) -> String {
            let mut path = if absolute {
                "/".to_string()
            } else {
                String::new()
            };
            for index in 0..depth {
                if index != 0 {
                    path.push('/');
                }
                path.push_str(COMPONENTS[next(state) as usize % COMPONENTS.len()]);
            }
            if !path.is_empty() && !path.ends_with('/') {
                path.push('/');
            }
            path.push_str(filename);
            path
        }

        let mut state = 0x4d59_5df4_d0f3_3173_u64;

        for case in 0..4096 {
            let source_depth = next(&mut state) as usize % 12;
            let generated_depth = next(&mut state) as usize % 12;
            let source_path = make_path(&mut state, case % 3 != 0, source_depth, "App.svelte");
            let generated_path =
                make_path(&mut state, case % 5 != 0, generated_depth, "App.svelte.tsx");
            let workspace_path =
                WORKSPACES[next(&mut state) as usize % WORKSPACES.len()].to_string();
            let mut specifier = "../".repeat(next(&mut state) as usize % 8 + 1);
            let trailing = next(&mut state) as usize % 8;
            for index in 0..trailing {
                if index != 0 {
                    specifier.push('/');
                }
                specifier.push_str(COMPONENTS[next(&mut state) as usize % COMPONENTS.len()]);
            }
            specifier.push_str(SUFFIXES[next(&mut state) as usize % SUFFIXES.len()]);

            let opts = RewriteExternalImportsOptions {
                source_path,
                generated_path,
                workspace_path,
            };
            assert_eq!(
                compute_prepared(&specifier, &opts),
                compute_rewrite_oracle(&specifier, &opts),
                "case {case}: {opts:?}, {specifier:?}"
            );
        }
    }

    #[test]
    fn creates_replacement_and_utf16_aware_edits_when_needed() {
        let text = "const emoji = '😀';\nimport value from \"../../outside/😀.js?raw#asset\";\n";
        let original = "../../outside/😀.js?raw#asset";
        let rewritten = "../../../outside/😀.js?raw#asset";
        let rewrite = rewrite_external_specifiers_in_text(text, &rewrite_options());
        let expected = text.replacen(original, rewritten, 1);

        assert_eq!(rewrite.replacement.as_deref(), Some(expected.as_str()));
        assert_eq!(
            rewrite.edits,
            vec![TextEdit {
                start: text.find(original).unwrap() as u32,
                end: (text.find(original).unwrap() + original.len()) as u32,
                replacement_len: rewritten.len() as u32,
                replacement_utf16_len: rewritten.encode_utf16().count() as u32,
            }]
        );
    }
}
