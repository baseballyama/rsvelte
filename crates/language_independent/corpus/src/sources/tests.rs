use std::collections::BTreeMap;

use super::{Reader, Registry, UnitTable, add_unparseable};

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

#[test]
fn an_unparseable_line_skips_its_task_beside_the_hand_written_skips() {
    let mut units = BTreeMap::from([(
        "svelte/s/a.svelte.ts".to_owned(),
        UnitTable {
            skip: BTreeMap::from([("svelte.lint".to_owned(), "hand".to_owned())]),
        },
    )]);
    let text = "# header\nsvelte/s/a.svelte.ts\tts.compile/default\twhy\n\
                svelte/s/b.svelte.ts\tts.compile/default\twhy\tstill the reason\n";
    add_unparseable(&mut units, text).unwrap();
    assert!(units["svelte/s/a.svelte.ts"].skips("ts.compile/default"));
    assert!(units["svelte/s/a.svelte.ts"].skips("svelte.lint/default"));
    assert!(units["svelte/s/b.svelte.ts"].skips("ts.compile/default"));
    assert_eq!(
        units["svelte/s/b.svelte.ts"].skip["ts.compile/default"],
        "why\tstill the reason"
    );
    assert!(add_unparseable(&mut units, "svelte/s/c.svelte.ts\tts.compile/default\n").is_err());
}
