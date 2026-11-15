use std::collections::BTreeMap;

use super::{Reader, Registry, UnitTable};

#[test]
fn a_pack_with_a_reader_that_applies_is_not_skipped() {
    let registry = Registry {
        dir: "_registry".into(),
        units: BTreeMap::new(),
        readers: BTreeMap::from([(
            "svelte.compile.warnings".to_owned(),
            Reader {
                pack: "svelte.compile/client".to_owned(),
                file: "warnings.json".to_owned(),
            },
        )]),
    };
    let table = |skips: &[&str]| UnitTable {
        skip: skips
            .iter()
            .map(|s| ((*s).to_owned(), "reason".to_owned()))
            .collect(),
    };
    let compile = table(&["svelte.compile"]);
    assert!(!registry.skips_every_reader(&compile, "svelte.compile/client"));
    assert!(registry.skips_every_reader(&compile, "svelte.compile/server"));
    let both = table(&["svelte.compile/client", "svelte.compile.warnings"]);
    assert!(registry.skips_every_reader(&both, "svelte.compile/client"));
    assert!(!registry.skips_every_reader(&table(&[]), "svelte.compile/client"));
}
