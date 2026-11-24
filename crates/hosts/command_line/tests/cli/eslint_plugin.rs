//! `apps/eslint-plugin/rules.json`, the rules `@rsvelte/eslint-plugin` turns off, stays the set of
//! rules `rsvelte lint` runs. `UPDATE_EXPECT=1` writes it.

use std::collections::BTreeMap;
use std::path::Path;

use rsvelte_lint_runner::catalog::Category;
use rsvelte_svelte_lint::rule::Files;

/// The files one lint task reads, in the order a rule's file sets name them.
#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Debug)]
enum Kind {
    Svelte,
    JavaScript,
    Jsx,
}

impl Kind {
    const fn label(self) -> &'static str {
        match self {
            Self::Svelte => "svelte",
            Self::JavaScript => "js-ts",
            Self::Jsx => "jsx-tsx",
        }
    }

    const fn glob(self) -> &'static str {
        match self {
            Self::Svelte => "**/*.svelte",
            Self::JavaScript => "**/*.{js,mjs,cjs,ts,mts,cts}",
            Self::Jsx => "**/*.{jsx,tsx}",
        }
    }
}

struct Entry {
    category: Category,
    kinds: Vec<Kind>,
}

/// Every rule `rsvelte lint` runs beside oxlint's own, which eslint-plugin-oxlint turns off: the
/// Svelte linter's, with its category and the files it runs on.
fn rules() -> BTreeMap<&'static str, Entry> {
    let mut rules: BTreeMap<&'static str, Entry> = BTreeMap::new();
    let mut add = |name, category, kinds: &[Kind]| {
        let entry = rules.entry(name).or_insert(Entry {
            category,
            kinds: Vec::new(),
        });
        assert_eq!(entry.category, category, "{name} has two categories");
        entry.kinds.extend(kinds);
        entry.kinds.sort_unstable();
        entry.kinds.dedup();
    };
    for rule in rsvelte_svelte_lint::reporting_rules() {
        let kinds: &[Kind] = match rule.files {
            Files::Components => &[Kind::Svelte],
            // Modules only once a configuration turns such a rule on.
            Files::All => &[Kind::Svelte, Kind::JavaScript, Kind::Jsx],
        };
        // A core rule runs in a component in oxlint's stead, so oxlint's category turns it on.
        let category = if rule.name.contains('/') {
            rule.category
        } else {
            oxlint_category(rule.name)
        };
        add(rule.name, category, kinds);
    }
    rules
}

/// The category of oxlint's core rule `name`.
fn oxlint_category(name: &str) -> Category {
    let table = oxc_linter::table::RuleTable::new(None);
    let row = (table.sections.iter())
        .flat_map(|section| &section.rows)
        .find(|row| row.plugin == "eslint" && row.name == name)
        .unwrap_or_else(|| panic!("oxlint has no core rule {name}"));
    match row.category {
        oxc_linter::RuleCategory::Correctness => Category::Correctness,
        oxc_linter::RuleCategory::Suspicious => Category::Suspicious,
        oxc_linter::RuleCategory::Pedantic => Category::Pedantic,
        oxc_linter::RuleCategory::Perf => Category::Perf,
        oxc_linter::RuleCategory::Style => Category::Style,
        oxc_linter::RuleCategory::Restriction => Category::Restriction,
        oxc_linter::RuleCategory::Nursery => Category::Nursery,
    }
}

/// eslint-plugin-oxlint's scope: the `ESLint` plugin a rule belongs to.
fn scope(name: &str) -> &str {
    match name.split_once('/') {
        None => "eslint",
        Some(("@typescript-eslint", _)) => "typescript",
        Some((plugin, _)) => plugin,
    }
}

fn files_label(kinds: &[Kind]) -> String {
    kinds
        .iter()
        .map(|k| k.label())
        .collect::<Vec<_>>()
        .join("+")
}

/// One rule per line, so a change to the rules reads as a one-line diff.
fn render(rules: &BTreeMap<&'static str, Entry>) -> String {
    let mut sets: BTreeMap<String, &[Kind]> = BTreeMap::new();
    for entry in rules.values() {
        sets.insert(files_label(&entry.kinds), &entry.kinds);
    }
    let sets: Vec<String> = sets
        .iter()
        .map(|(label, kinds)| {
            let globs: Vec<String> = kinds.iter().map(|k| format!("\"{}\"", k.glob())).collect();
            format!("\t\t\"{label}\": [{}]", globs.join(", "))
        })
        .collect();
    let lines: Vec<String> = rules
        .iter()
        .map(|(name, entry)| {
            format!(
                concat!(
                    "\t\t{{ \"name\": \"{}\", \"scope\": \"{}\", ",
                    "\"category\": \"{}\", \"files\": \"{}\" }}",
                ),
                name,
                scope(name),
                entry.category.name(),
                files_label(&entry.kinds)
            )
        })
        .collect();
    format!(
        "{{\n\t\"files\": {{\n{}\n\t}},\n\t\"rules\": [\n{}\n\t]\n}}\n",
        sets.join(",\n"),
        lines.join(",\n")
    )
}

#[test]
fn rules_json_lists_every_rule_rsvelte_lint_runs() {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../apps/eslint-plugin/rules.json");
    let expected = render(&rules());
    if std::env::var_os("UPDATE_EXPECT").is_some() {
        std::fs::write(&path, &expected).expect("write rules.json");
        return;
    }
    let actual = std::fs::read_to_string(&path).expect("read rules.json");
    assert!(
        actual == expected,
        "{} is stale; run with UPDATE_EXPECT=1",
        path.display()
    );
}
