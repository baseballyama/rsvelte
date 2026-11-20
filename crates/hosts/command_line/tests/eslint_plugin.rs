//! `apps/eslint-plugin/rules.json`, the rules `eslint-plugin-rsvelte` turns off, stays the set of
//! rules `rsvelte lint` runs. `UPDATE_EXPECT=1` writes it.

use std::path::Path;

use rsvelte_svelte_lint::rule::Files;

/// One flat `ESLint` configuration object: the files a lint task reads and the rules it runs there.
struct Block {
    name: &'static str,
    files: &'static str,
    rules: Vec<&'static str>,
}

fn blocks() -> Vec<Block> {
    let svelte = || rsvelte_svelte_lint::reporting_rules();
    let mut blocks = vec![
        Block {
            name: "rsvelte/svelte",
            files: "**/*.svelte",
            rules: svelte().map(|rule| rule.name).collect(),
        },
        // The Svelte rules that also run on modules once a configuration turns one on.
        Block {
            name: "rsvelte/svelte-modules",
            files: "**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
            rules: svelte()
                .filter(|rule| rule.files == Files::All)
                .map(|rule| rule.name)
                .collect(),
        },
        Block {
            name: "rsvelte/typescript",
            files: "**/*.{js,mjs,cjs,ts,mts,cts}",
            rules: rsvelte_typescript_lint::rule_names().collect(),
        },
        Block {
            name: "rsvelte/vue",
            files: "**/*.vue",
            rules: rsvelte_vue_lint::rule_names().collect(),
        },
    ];
    for block in &mut blocks {
        block.rules.sort_unstable();
        block.rules.dedup();
    }
    blocks
}

/// One rule per line, so a change to the rules reads as a one-line diff.
fn render(blocks: &[Block]) -> String {
    let blocks: Vec<String> = blocks
        .iter()
        .map(|block| {
            let rules: Vec<String> = block
                .rules
                .iter()
                .map(|rule| format!("\t\t\t\"{rule}\""))
                .collect();
            format!(
                concat!(
                    "\t{{\n",
                    "\t\t\"name\": \"{}\",\n",
                    "\t\t\"files\": [\"{}\"],\n",
                    "\t\t\"rules\": [\n{}\n\t\t]\n",
                    "\t}}",
                ),
                block.name,
                block.files,
                rules.join(",\n")
            )
        })
        .collect();
    format!("[\n{}\n]\n", blocks.join(",\n"))
}

#[test]
fn rules_json_lists_every_rule_rsvelte_lint_runs() {
    let path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../../../apps/eslint-plugin/rules.json");
    let expected = render(&blocks());
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

#[test]
fn every_block_turns_off_something() {
    for block in blocks() {
        assert!(!block.rules.is_empty(), "{} has no rules", block.name);
    }
}
