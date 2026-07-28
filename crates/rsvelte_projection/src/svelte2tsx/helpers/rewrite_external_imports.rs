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
    pub(crate) code: String,
    pub(crate) edits: Vec<TextEdit>,
}

fn parent_dir(path: &str) -> String {
    match path.rfind('/') {
        Some(0) => "/".to_string(),
        Some(i) => path[..i].to_string(),
        None => "".to_string(),
    }
}

/// POSIX-style `path.resolve(base, rel)` — joins `base` and `rel` and
/// normalises away `.` / `..` components.
fn resolve_posix(base: &str, rel: &str) -> String {
    let abs = base.starts_with('/');
    let mut parts: Vec<&str> = base
        .split('/')
        .filter(|s| !s.is_empty() && *s != ".")
        .collect();
    for p in rel.split('/') {
        if p.is_empty() || p == "." {
            continue;
        }
        if p == ".." {
            parts.pop();
        } else {
            parts.push(p);
        }
    }
    let joined = parts.join("/");
    if abs { format!("/{}", joined) } else { joined }
}

/// POSIX-style `path.relative(from, to)`.
fn relative_posix(from: &str, to: &str) -> String {
    let from_parts: Vec<&str> = from.split('/').filter(|s| !s.is_empty()).collect();
    let to_parts: Vec<&str> = to.split('/').filter(|s| !s.is_empty()).collect();
    let common = from_parts
        .iter()
        .zip(to_parts.iter())
        .take_while(|(a, b)| a == b)
        .count();
    let mut result: Vec<String> = Vec::new();
    for _ in common..from_parts.len() {
        result.push("..".to_string());
    }
    for p in to_parts.iter().skip(common) {
        result.push((*p).to_string());
    }
    if result.is_empty() {
        ".".to_string()
    } else {
        result.join("/")
    }
}

fn is_within_dir(target: &str, dir: &str) -> bool {
    let dir = dir.trim_end_matches('/');
    target == dir || target.starts_with(&format!("{}/", dir))
}

fn split_specifier(spec: &str) -> (&str, &str) {
    let q = spec.find('?');
    let h = spec.find('#');
    let cut = match (q, h) {
        (None, None) => return (spec, ""),
        (Some(q), None) => q,
        (None, Some(h)) => h,
        (Some(q), Some(h)) => q.min(h),
    };
    (&spec[..cut], &spec[cut..])
}

fn compute_rewrite(specifier: &str, opts: &RewriteExternalImportsOptions) -> Option<String> {
    let (path_part, suffix) = split_specifier(specifier);
    if !path_part.starts_with("../") {
        return None;
    }
    let source_dir = parent_dir(&opts.source_path);
    let generated_dir = parent_dir(&opts.generated_path);
    let target = resolve_posix(&source_dir, path_part);
    if is_within_dir(&target, &opts.workspace_path) {
        return None;
    }
    let rewritten = relative_posix(&generated_dir, &target);
    let full = format!("{}{}", rewritten, suffix);
    if full == specifier {
        return None;
    }
    Some(full)
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
/// returns a freshly-rewritten `String` instead of mutating a MagicString.
/// Used for the synthesised `import_text` chunk that is generated from the
/// original source (not from the MagicString) and therefore needs its own
/// pass so the hoisted imports also pick up the rewrite.
pub(crate) fn rewrite_external_specifiers_in_text(
    text: &str,
    opts: &RewriteExternalImportsOptions,
) -> TextRewrite {
    let bytes = text.as_bytes();
    let len = bytes.len();
    let mut out = String::with_capacity(text.len());
    let mut edits = Vec::new();
    let mut copied = 0usize;
    let mut i = 0;

    let mut try_rewrite_specifier =
        |spec_start: usize, spec_end: usize, out: &mut String, copied: &mut usize| {
            let spec = &text[spec_start..spec_end];
            if let Some(rewrite) = compute_rewrite(spec, opts) {
                out.push_str(&text[*copied..spec_start]);
                out.push_str(&rewrite);
                edits.push(TextEdit {
                    start: spec_start as u32,
                    end: spec_end as u32,
                    replacement_len: rewrite.len() as u32,
                    replacement_utf16_len: rewrite.encode_utf16().count() as u32,
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
                    try_rewrite_specifier(spec_start, spec_end, &mut out, &mut copied);
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
                        try_rewrite_specifier(spec_start, spec_end, &mut out, &mut copied);
                        i = spec_end + 1;
                        continue;
                    }
                }
            }
        }

        i += 1;
    }
    if copied < text.len() {
        out.push_str(&text[copied..]);
    }
    TextRewrite { code: out, edits }
}
