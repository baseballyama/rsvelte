//! Pure-Rust Tailwind CSS class sorter for the **default** design system.
//!
//! This crate reproduces the class ordering that
//! `prettier-plugin-tailwindcss` (and, underneath it, Tailwind v4's
//! `getClassOrder`) produces for a project using the stock, zero-config
//! Tailwind setup (`@import "tailwindcss";` with no `@plugin`, no custom
//! `@utility`, and only the default theme). It intentionally does **not**
//! run any Tailwind/JS engine — it sorts from three embedded tables that were
//! extracted once from the real engine (see `README.md` and `data/`).
//!
//! # Scope
//!
//! Faithful for: named default utilities (incl. negatives, `/opacity`
//! modifiers, `!important`), the default variants (pseudo-classes, responsive
//! breakpoints, `dark`, `group-*`/`peer-*`/`data-*`/`aria-*`/`has-*` families,
//! arbitrary `[&…]` variants), and arbitrary *values* (`w-[10px]`).
//!
//! Out of scope (returns the class as "unknown", preserved first, exactly as
//! the default-config engine also would): anything introduced by a JS
//! `tailwind.config.js`, a v3 config, `@plugin`, custom `@utility` /
//! `@custom-variant` / `@theme` tokens, or a `safelist`. Reproducing those
//! requires executing the project's Tailwind stylesheet/config, which is
//! impossible without the JS engine.
//!
//! # oxc integration
//!
//! [`sort_classes`] matches the shape oxc's formatter expects for its
//! `TailwindCallback` (`Vec<String> -> Vec<String>`), so this crate can back
//! that callback directly without a Node worker for default-config projects.

mod compare;

use std::cmp::Ordering;
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;

/// The intrinsic (variant-less) order of every named default utility, one per
/// line, in ascending sort order.
const DEFAULT_ORDER: &str = include_str!("../data/default_order.txt");

/// The ordered list of default *variant families*. Static variants appear
/// verbatim (`hover`, `sm`, `dark`, …); parametric families appear as a
/// `root-*` label (`group-*`, `data-*`, `@container-named`, …).
const VARIANT_ROOTS: &str = include_str!("../data/variant_roots_order.txt");

/// `property<TAB>anchor` per line: for an arbitrary property `[prop:val]`, the
/// number of named utilities that sort before it (its position among reals).
/// Mirrors Tailwind's `GLOBAL_PROPERTY_ORDER`; the special `--` row is the
/// anchor shared by custom-property declarations (`[--foo:bar]`).
const PROPERTY_ANCHOR: &str = include_str!("../data/property_anchor.txt");

/// The default theme's color-family namespace (`red`, `blue`, …), one per line.
/// Used to tell a color utility (`text-red-500`) from a same-root non-color one
/// (`text-sm`) so an arbitrary value lands in the correct fingerprint cluster.
const COLOR_FAMILIES: &str = include_str!("../data/color_families.txt");

/// Base order key. Named utilities land on even values `2*index`; an arbitrary
/// property anchored before real utility `a` lands on the odd `2*a - 1`, so it
/// sorts strictly between real `a-1` and real `a` without colliding with either.
type BaseOrder = i64;

fn real_order(index: u32) -> BaseOrder {
    2 * index as i64
}

fn anchored_order(anchor: u32) -> BaseOrder {
    2 * anchor as i64 - 1
}

struct Tables {
    /// utility name -> intrinsic order index (exact, one per named utility)
    base: HashMap<&'static str, u32>,
    /// utility root (`w`, `bg`, `text`, …) -> its named members in table order,
    /// used to place arbitrary values (`w-[10px]`) among their siblings.
    root_siblings: HashMap<&'static str, Vec<(&'static str, u32)>>,
    /// CSS property name -> anchor (named utilities sorting before `[prop:…]`).
    property_anchor: HashMap<&'static str, u32>,
    /// anchor shared by custom-property declarations (`[--foo:bar]`).
    custom_property_anchor: u32,
    /// total number of named utilities; the anchor for a property absent from
    /// `GLOBAL_PROPERTY_ORDER`, which the engine sorts after all known ones.
    real_count: u32,
    /// default theme color families (`red`, `blue`, …)
    color_families: HashSet<&'static str>,
    /// roots whose siblings mix color and non-color members (`text`, `bg`, …),
    /// where an arbitrary value must be matched to the right sub-cluster.
    mixed_roots: HashSet<&'static str>,
    /// variant family label -> rank
    variant: HashMap<&'static str, u32>,
    /// rank assigned to arbitrary `[&…]` variants (sorts after all named ones)
    arbitrary_variant_rank: u32,
}

fn tables() -> &'static Tables {
    static TABLES: OnceLock<Tables> = OnceLock::new();
    TABLES.get_or_init(|| {
        let mut base = HashMap::new();
        let mut root_siblings: HashMap<&'static str, Vec<(&'static str, u32)>> = HashMap::new();
        let mut real_count = 0u32;
        for (i, name) in DEFAULT_ORDER.lines().filter(|l| !l.is_empty()).enumerate() {
            let idx = i as u32;
            base.insert(name, idx);
            root_siblings
                .entry(utility_root(name))
                .or_default()
                .push((name, idx));
            real_count = idx + 1;
        }

        let mut property_anchor = HashMap::new();
        let mut custom_property_anchor = real_count;
        for line in PROPERTY_ANCHOR.lines().filter(|l| !l.is_empty()) {
            let (prop, anchor) = line.split_once('\t').expect("property\\tanchor");
            let anchor: u32 = anchor.parse().expect("numeric anchor");
            if prop == "--" {
                custom_property_anchor = anchor;
            } else {
                property_anchor.insert(prop, anchor);
            }
        }

        let color_families: HashSet<&str> =
            COLOR_FAMILIES.lines().filter(|l| !l.is_empty()).collect();

        // A root is "mixed" when it has both a color and a non-color sibling.
        let mut mixed_roots = HashSet::new();
        for (root, siblings) in &root_siblings {
            let mut has_color = false;
            let mut has_plain = false;
            for &(name, _) in siblings {
                if is_named_color_utility(name, root, &color_families) {
                    has_color = true;
                } else {
                    has_plain = true;
                }
            }
            if has_color && has_plain {
                mixed_roots.insert(*root);
            }
        }

        let mut variant = HashMap::new();
        let mut n = 0u32;
        for (i, label) in VARIANT_ROOTS.lines().filter(|l| !l.is_empty()).enumerate() {
            variant.insert(label, i as u32);
            n = i as u32;
        }

        Tables {
            base,
            root_siblings,
            property_anchor,
            custom_property_anchor,
            real_count,
            color_families,
            mixed_roots,
            variant,
            arbitrary_variant_rank: n + 1,
        }
    })
}

/// The utility "root": the leading segment up to the first `-`, keeping any
/// leading `-` (negative) so `-mt-4` and `mt-4` share the root `mt`.
fn utility_root(name: &str) -> &str {
    let neg = name.starts_with('-');
    let body = if neg { &name[1..] } else { name };
    match body.find('-') {
        Some(p) => &body[..p],
        None => body,
    }
}

/// A computed sort key. `Unknown` classes are ones the default design system
/// cannot resolve; they are kept ahead of everything else in their original
/// relative order (matching prettier-plugin-tailwindcss's `null`-order rule).
/// The candidate string used for the final tiebreak is not stored here — it is
/// the token itself, compared by index at sort time.
enum Key {
    Unknown,
    Known {
        /// variant ranks, sorted descending — compared lexicographically this
        /// reproduces Tailwind's OR-of-bitmask variant ordering.
        variants: Vec<u32>,
        /// intrinsic utility order
        base: BaseOrder,
    },
}

/// Split a class token into its variant prefixes and the trailing base, being
/// careful not to split on `:` inside `[…]` (arbitrary values/variants).
fn split_variants(token: &str) -> (Vec<&str>, &str) {
    let bytes = token.as_bytes();
    let mut depth = 0i32;
    let mut variants = Vec::new();
    let mut start = 0usize;
    let mut i = 0usize;
    while i < bytes.len() {
        match bytes[i] {
            b'[' | b'(' => depth += 1,
            b']' | b')' => depth -= 1,
            b':' if depth == 0 => {
                variants.push(&token[start..i]);
                start = i + 1;
            }
            _ => {}
        }
        i += 1;
    }
    (variants, &token[start..])
}

/// Classify a single variant prefix into a family rank. `None` means the
/// variant is not part of the default design system (a custom `@custom-variant`
/// or a typo) — which makes the whole class unknown.
fn variant_rank(v: &str, t: &Tables) -> Option<u32> {
    // Named group/peer reference (`group-hover/item`) — the `/name` does not
    // affect the family.
    let v = match v.split_once('/') {
        Some((head, _)) if !head.is_empty() => head,
        _ => v,
    };

    if v.starts_with('[') {
        return Some(t.arbitrary_variant_rank);
    }
    // Exact static variant (must win over prefix families so `in-range`,
    // `first-of-type`, `has` etc. are not misread as `in-*`/`has-*`).
    if let Some(&r) = t.variant.get(v) {
        return Some(r);
    }

    // Parametric families, longest-prefix first.
    const FAMILIES: &[(&str, &str)] = &[
        ("group-has-", "group-has-*"),
        ("group-aria-", "group-aria-*"),
        ("group-data-", "group-data-*"),
        ("group-", "group-*"),
        ("peer-has-", "peer-has-*"),
        ("peer-data-", "peer-data-*"),
        ("peer-", "peer-*"),
        ("not-", "not-*"),
        ("in-", "in-*"),
        ("has-", "has-*"),
        ("aria-", "aria-*"),
        ("data-", "data-*"),
        ("supports-", "supports-*"),
        ("nth-last-", "nth-last-*"),
        ("nth-", "nth-*"),
        ("min-", "min-*"),
        ("max-", "max-*"),
    ];
    for (prefix, label) in FAMILIES {
        if v.starts_with(prefix)
            && let Some(&r) = t.variant.get(label)
        {
            return Some(r);
        }
    }
    // Container queries: `@[…]` (arbitrary) vs `@md` (named).
    if let Some(rest) = v.strip_prefix('@') {
        let label = if rest.starts_with('[') {
            "@container-arb"
        } else {
            "@container-named"
        };
        if let Some(&r) = t.variant.get(label) {
            return Some(r);
        }
    }
    None
}

/// Resolve the intrinsic base order of a token's base segment (variants already
/// stripped). Handles `!important`, `/opacity` modifiers, arbitrary properties,
/// arbitrary values, and spacing-scale gaps the sampled table omits verbatim.
fn base_order(base: &str, t: &Tables) -> Option<BaseOrder> {
    // Strip `!important` markers (leading `!` in v3/v4, trailing `!` in v4).
    let base = base.strip_prefix('!').unwrap_or(base);
    let base = base.strip_suffix('!').unwrap_or(base);

    if let Some(&idx) = t.base.get(base) {
        return Some(real_order(idx));
    }

    // A `/opacity` (or similar) modifier does not change ordering; retry the
    // un-modified stem. The modifier only matters for the candidate tiebreak.
    let stem = match base.rsplit_once('/') {
        Some((s, _)) if !s.ends_with(']') && !s.is_empty() => s,
        _ => base,
    };
    if stem != base
        && let Some(&idx) = t.base.get(stem)
    {
        return Some(real_order(idx));
    }

    // Arbitrary property, e.g. `[content-visibility:auto]`, `[--foo:bar]`. It
    // sorts at its emitted property's position in `GLOBAL_PROPERTY_ORDER`;
    // custom properties share one slot; a property absent from the list sorts
    // after all known ones. The value only feeds the candidate tiebreak.
    if let Some(inner) = stem.strip_prefix('[').and_then(|s| s.strip_suffix(']')) {
        let prop = inner.split_once(':')?.0.trim();
        let anchor = if prop.starts_with("--") {
            t.custom_property_anchor
        } else {
            t.property_anchor.get(prop).copied().unwrap_or(t.real_count)
        };
        return Some(anchored_order(anchor));
    }

    // Arbitrary value (`w-[10px]`, `h-(--foo)`) — always resolvable in the
    // default engine — or a numeric spacing/axis value the sampled table simply
    // omits (`end-9`, `-inset-y-1`). Both are placed among their named
    // root-siblings; a non-numeric tail (`bg-dark-10`, `text-primary-600`) is
    // left unknown, matching how the default engine treats custom theme tokens.
    let placeable = stem.contains("-[") || stem.contains("-(") || has_numeric_tail(stem);
    if placeable && let Some(idx) = place_among_siblings(stem, t) {
        return Some(real_order(idx));
    }

    None
}

/// Find the index a value should inherit among its root-siblings: the last
/// sibling whose name still sorts before it, else the first sibling. For a root
/// whose siblings mix color and non-color members (`text-red-500` vs `text-sm`),
/// the candidate is matched only against siblings of its own kind, so an
/// arbitrary value lands in the correct CSS-property cluster.
fn place_among_siblings(stem: &str, t: &Tables) -> Option<u32> {
    let bracket = stem.find("-[").or_else(|| stem.find("-("));
    let root = utility_root(bracket.map_or(stem, |b| &stem[..b]));
    let siblings = t.root_siblings.get(root)?;

    let color_filter = if t.mixed_roots.contains(root) {
        Some(stem_is_color(stem, bracket))
    } else {
        None
    };
    let matches = |name: &str| match color_filter {
        Some(want) => is_named_color_utility(name, root, &t.color_families) == want,
        None => true,
    };

    let mut idx = None;
    let mut first = None;
    for &(name, i) in siblings {
        if !matches(name) {
            continue;
        }
        first.get_or_insert(i);
        if compare::compare(name, stem) == Ordering::Less {
            idx = Some(i);
        } else {
            break;
        }
    }
    idx.or(first).or_else(|| siblings.first().map(|&(_, i)| i))
}

/// Whether a named utility of the given root carries a theme color, i.e. its
/// value segment names a color family (`text-red-500`) or a color keyword.
fn is_named_color_utility(name: &str, root: &str, families: &HashSet<&str>) -> bool {
    let body = name.strip_prefix('-').unwrap_or(name);
    let Some(value) = body.strip_prefix(root).and_then(|v| v.strip_prefix('-')) else {
        return false;
    };
    let first = value.split('-').next().unwrap_or(value);
    families.contains(first)
        || matches!(
            value,
            "transparent" | "current" | "inherit" | "black" | "white"
        )
}

/// Whether an arbitrary value denotes a color, ported from Tailwind's data-type
/// inference: an explicit `color:` hint, a CSS color function/hex, a color
/// keyword, or a `--color-*` theme reference. A `length:`/`number:`/… hint or
/// any other value is non-color.
fn stem_is_color(stem: &str, bracket: Option<usize>) -> bool {
    let Some(b) = bracket else {
        // A bare numeric/spacing gap (`end-9`) is never a color.
        return false;
    };
    let inner = stem[b + 2..]
        .strip_suffix([']', ')'])
        .unwrap_or(&stem[b + 2..]);
    if let Some((hint, _)) = inner.split_once(':')
        && !hint.starts_with("--")
    {
        return hint == "color";
    }
    let v = inner.trim();
    v.starts_with('#')
        || v.starts_with("var(--color-")
        || matches!(v, "currentColor" | "transparent")
        || [
            "rgb(",
            "rgba(",
            "hsl(",
            "hsla(",
            "hwb(",
            "lab(",
            "lch(",
            "oklab(",
            "oklch(",
            "color(",
            "color-mix(",
        ]
        .iter()
        .any(|f| v.starts_with(f))
}

/// True if, after the utility root and any leading single-letter axis segments
/// (`x`, `y`, `t`, `bl`, …), the tail is a bare numeric spacing value. This
/// separates spacing/sizing scale members (`end-9`, `inset-y-1`) from custom
/// color scales (`primary-600`, `dark-10`), which must stay unknown.
fn has_numeric_tail(stem: &str) -> bool {
    let body = stem.strip_prefix('-').unwrap_or(stem);
    let Some((_root, mut tail)) = body.split_once('-') else {
        return false;
    };
    // Skip an optional Tailwind axis/side segment (`inset-y-1`, `scroll-mt-2`)
    // that sits between the root and the numeric value. The set is explicit:
    // a permissive "any short segment" rule would swallow plugin utility names
    // like `zoom-in-95` (`in` is not an axis) and misclassify them as known.
    const AXES: &[&str] = &[
        "x", "y", "t", "r", "b", "l", "s", "e", "tl", "tr", "bl", "br", "ss", "se", "ee", "es",
    ];
    if let Some((seg, rest)) = tail.split_once('-')
        && AXES.contains(&seg)
    {
        tail = rest;
    }
    !tail.is_empty()
        && tail
            .bytes()
            .all(|c| c.is_ascii_digit() || matches!(c, b'.' | b'/'))
}

fn key_for(token: &str, t: &Tables) -> Key {
    let (variants, base) = split_variants(token);

    let mut vranks = Vec::with_capacity(variants.len());
    for v in variants {
        match variant_rank(v, t) {
            Some(r) => vranks.push(r),
            None => return Key::Unknown,
        }
    }
    let Some(base) = base_order(base, t) else {
        return Key::Unknown;
    };

    // Descending sort makes lexicographic comparison equivalent to comparing
    // the OR-ed variant bitmask by magnitude.
    vranks.sort_unstable_by(|a, b| b.cmp(a));
    Key::Known {
        variants: vranks,
        base,
    }
}

/// Compare two already-computed keys, using the original tokens for the final
/// numeric-aware tiebreak.
fn cmp_keys(a: &Key, ta: &str, b: &Key, tb: &str) -> Ordering {
    match (a, b) {
        // Unknown before Known; two Unknowns are Equal so a stable sort keeps
        // their input order.
        (Key::Unknown, Key::Unknown) => Ordering::Equal,
        (Key::Unknown, Key::Known { .. }) => Ordering::Less,
        (Key::Known { .. }, Key::Unknown) => Ordering::Greater,
        (
            Key::Known {
                variants: va,
                base: ba,
            },
            Key::Known {
                variants: vb,
                base: bb,
            },
        ) => va
            .iter()
            .cmp(vb.iter())
            .then_with(|| ba.cmp(bb))
            .then_with(|| compare::compare(ta, tb)),
    }
}

/// Sort a single list of Tailwind class tokens into Tailwind's canonical order
/// for the default design system.
///
/// Unknown classes (not part of default Tailwind) are kept ahead of the sorted
/// known classes in their original relative order. Duplicates are preserved;
/// callers that want `prettier`-style dedupe should use [`sort_class_string`].
///
/// This is the callback shape oxc's formatter uses for Tailwind sorting.
pub fn sort_classes(classes: Vec<String>) -> Vec<String> {
    let t = tables();
    let keys: Vec<Key> = classes.iter().map(|c| key_for(c, t)).collect();
    let mut order: Vec<usize> = (0..classes.len()).collect();
    order.sort_by(|&a, &b| {
        cmp_keys(&keys[a], &classes[a], &keys[b], &classes[b]).then_with(|| a.cmp(&b))
    });
    order.into_iter().map(|i| classes[i].clone()).collect()
}

/// Sort a whitespace-separated class attribute value, matching
/// `prettier-plugin-tailwindcss`'s `sortClassAttributes`: split on whitespace,
/// sort, and drop duplicate classes (keeping the first occurrence).
pub fn sort_class_string(classes: &str) -> String {
    let tokens: Vec<String> = classes.split_whitespace().map(str::to_owned).collect();
    let sorted = sort_classes(tokens);
    let mut seen = std::collections::HashSet::new();
    let mut out: Vec<&str> = Vec::with_capacity(sorted.len());
    for c in &sorted {
        if seen.insert(c.as_str()) {
            out.push(c);
        }
    }
    out.join(" ")
}
