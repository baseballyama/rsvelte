//! The arm of `main`'s lint crate, `rsvelte_lint`. `rules` prints each rule it registers and
//! its kind: `native`, `meta` (only the full lint runs it) or `type-aware`.
//!
//! Mode `rules` calls `lint_source_raw`, the rules alone. Mode `product` calls `lint_source`, which
//! also compiles each component for the compiler's warnings, as `rsvelte-lint` does; there every
//! other rule is turned off, so the compiler's warnings keep their default severity.

mod harness;

use std::fmt::Write as _;
use std::path::PathBuf;

use harness::{Arm, Mode};
use rsvelte_core::CompileOptions;
use rsvelte_lint::LintConfig;

#[global_allocator]
static ALLOCATOR: harness::Allocator = harness::Allocator;

struct Main;

struct Linter {
    files: Vec<(PathBuf, String)>,
    mode: Mode,
    config: LintConfig,
    options: CompileOptions,
}

impl Linter {
    fn run(&self, index: usize) -> Vec<String> {
        let (path, source) = &self.files[index];
        match self.mode {
            Mode::Rules => rsvelte_lint::lint_source_raw(source, path, &self.config)
                .into_iter()
                .map(|d| d.rule)
                .collect(),
            Mode::Product => rsvelte_lint::lint_source(source, path, &self.options, &self.config)
                .into_iter()
                .map(|d| d.code.unwrap_or_default())
                .collect(),
        }
    }
}

impl harness::Linter for Linter {
    fn count(&self, index: usize) -> usize {
        let (path, source) = &self.files[index];
        match self.mode {
            Mode::Rules => rsvelte_lint::lint_source_raw(source, path, &self.config).len(),
            Mode::Product => {
                rsvelte_lint::lint_source(source, path, &self.options, &self.config).len()
            }
        }
    }

    fn codes(&self, index: usize) -> Result<Vec<String>, String> {
        Ok(self.run(index))
    }
}

impl Arm for Main {
    type Linter = Linter;
    const NAME: &'static str = "main";

    fn rules(_: &[String]) {
        let meta: Vec<&str> = rsvelte_lint::registry::meta_rule_metas()
            .map(|m| m.name)
            .collect();
        let mut metas = rsvelte_lint::registry::registered_rule_metas();
        metas.sort_by_key(|m| m.name);
        metas.dedup_by_key(|m| m.name);
        for m in metas {
            let kind = if m.type_aware {
                "type-aware"
            } else if meta.contains(&m.name) {
                "meta"
            } else {
                "native"
            };
            println!("{}\t{kind}", m.name);
        }
    }

    fn linter(
        mode: Mode,
        rules: &[String],
        files: Vec<(String, String)>,
    ) -> Result<Linter, String> {
        let mut json = String::from("{");
        if mode == Mode::Rules {
            json.push_str("\"extends\":[\"none\"],");
        }
        json.push_str("\"rules\":{");
        let mut first = true;
        let mut entry = |json: &mut String, name: &str, severity: &str| {
            if !first {
                json.push(',');
            }
            first = false;
            let _ = write!(json, "\"{name}\":\"{severity}\"");
        };
        if mode == Mode::Product {
            for m in rsvelte_lint::registry::registered_rule_metas() {
                if !rules.iter().any(|r| r == m.name) {
                    entry(&mut json, m.name, "off");
                }
            }
        }
        for name in rules {
            entry(&mut json, name, "error");
        }
        json.push_str("}}");
        let config = LintConfig::from_json_str(&json).map_err(|e| e.to_string())?;
        Ok(Linter {
            files: files
                .into_iter()
                .map(|(path, source)| (PathBuf::from(path), source))
                .collect(),
            mode,
            config,
            options: CompileOptions::default(),
        })
    }
}

fn main() {
    harness::main::<Main>();
}
