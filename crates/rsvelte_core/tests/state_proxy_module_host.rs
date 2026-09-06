//! `state_proxy_undefined_initial.rs` is the same grid on the **instance**
//! host, where both compilers already agreed. rsvelte keeps the module
//! script's `$state` lowering in its own port with its own pair of lists —
//! one for the `$state(x)` **initializer** and one for a **reassignment**
//! `s = x` — mirroring the instance path's `non_proxy_vars` /
//! `reassign_non_proxy_vars`. The initializer list was built from
//! `is_non_proxy_node_type`; the reassignment list was the empty slice, so
//! every value written into a module `$state` was proxied.
//!
//! One cell per list is the point: with only the initializer rows the grid is
//! green on a tree where the reassignment list is still empty. Every expected
//! value was read out of the official compiler
//! (`submodules/svelte/packages/svelte/src/compiler/index.js`), and both
//! directions are present — a predicate that always proxies passes every
//! `true` row and one that never proxies passes every `false` row.

use rsvelte_core::{CompileOptions, GenerateMode, compile};

#[derive(Clone, Copy)]
enum Site {
    /// `let s = $state(a)`. `s` is reassigned elsewhere on purpose: upstream's
    /// `is_state_source` demotes a never-reassigned `$state` to a plain value,
    /// and then there is no `$.state(...)` to read the decision off.
    Initializer,
    /// `s = a` inside an exported function.
    Reassignment,
}

fn source(site: Site, declaration: &str) -> String {
    match site {
        Site::Initializer => format!(
            "<script module>\n\t{declaration}\n\tlet s = $state(a);\n\texport function bump() {{ s = 1; }}\n</script>\n{{1}}\n"
        ),
        Site::Reassignment => format!(
            "<script module>\n\t{declaration}\n\tlet s = $state(0);\n\texport function go() {{ s = a; }}\n</script>\n{{1}}\n"
        ),
    }
}

/// The `(` … `)` of the first call whose text starts with `needle`, plus how
/// many top-level commas it holds. Read off the whole call rather than a line:
/// both compilers break a call across lines when the value is multi-line.
fn call_at(code: &str, needle: &str) -> Option<(String, usize)> {
    let at = code.find(needle)?;
    let open = at + code[at..].find('(')?;
    let mut depth = 0usize;
    let mut commas = 0usize;
    for (i, b) in code.as_bytes()[open..].iter().enumerate() {
        match b {
            b'(' => depth += 1,
            b')' => {
                depth -= 1;
                if depth == 0 {
                    return Some((code[at..open + i + 1].to_string(), commas));
                }
            }
            b',' if depth == 1 => commas += 1,
            _ => {}
        }
    }
    None
}

fn is_proxied(site: Site, declaration: &str, dev: bool) -> bool {
    let src = source(site, declaration);
    let js = compile(
        &src,
        CompileOptions {
            filename: Some("C.svelte".to_string()),
            generate: GenerateMode::Client,
            dev,
            ..Default::default()
        },
    )
    .expect("compile")
    .js
    .code;
    match site {
        Site::Initializer => {
            let (text, _) = call_at(&js, "$.state(")
                .unwrap_or_else(|| panic!("no `$.state(` for `{declaration}` in:\n{js}"));
            text.contains("$.proxy(")
        }
        Site::Reassignment => {
            let (_, commas) = call_at(&js, "$.set(s,")
                .unwrap_or_else(|| panic!("no `$.set(s,` for `{declaration}` in:\n{js}"));
            commas >= 2
        }
    }
}

/// `(declaration, official proxies the value)` — the same answer at both sites.
const CELLS: &[(&str, bool)] = &[
    ("let a = undefined;", false),
    ("let a = 1;", false),
    ("let a = 'x';", false),
    ("let a = null;", false),
    ("let a = () => 1;", false),
    ("let a = {};", true),
    ("let a = [];", true),
    ("let a;", true),
];

#[test]
fn a_module_state_takes_the_same_proxy_decision_at_both_sites() {
    for &(declaration, expected) in CELLS {
        for site in [Site::Initializer, Site::Reassignment] {
            for dev in [false, true] {
                let site_name = match site {
                    Site::Initializer => "initializer",
                    Site::Reassignment => "reassignment",
                };
                assert_eq!(
                    is_proxied(site, declaration, dev),
                    expected,
                    "`{declaration}` at the {site_name} site (dev={dev})"
                );
            }
        }
    }
    assert!(CELLS.iter().any(|c| c.1), "no cell expects a proxy");
    assert!(CELLS.iter().any(|c| !c.1), "no cell expects no proxy");
}
