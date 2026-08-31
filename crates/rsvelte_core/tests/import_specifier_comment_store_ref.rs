//! A comment between import specifiers must not turn the names after it into
//! store references.
//!
//! `enclosing_pattern_open` walks backwards over raw characters and gives up on
//! `(`, `)` or `;`. It is comment-blind, so a `/* ) c */` between two specifiers
//! hides the enclosing `{` from every name that follows: `is_dollar_ident_import_specifier`
//! then answers "not a specifier" and the `$`-reference collector records a
//! store read. The specifier BEFORE the comment is unaffected, which is the
//! asymmetry that identifies the backward scan rather than the specifier rule.

use rsvelte_core::compiler::{CompileOptions, GenerateMode, compile};

fn store_ops(source: &str, generate: GenerateMode, dev: bool) -> usize {
    let code = compile(
        source,
        CompileOptions {
            filename: Some("P.svelte".to_string()),
            generate,
            dev,
            ..Default::default()
        },
    )
    .expect("compiles")
    .js
    .code;
    code.matches("setup_stores").count() + code.matches("store_get").count()
}

const BLOCK_COMMENT: &str = r#"<script>
	import { $a as a, /* ) c */ $b as b } from 'm';
	let n = 0;
</script>

<button onclick={() => (n = a(b))}>{n}</button>
"#;

const LINE_COMMENT: &str = r#"<script>
	import {
		$a as a,
		// ) c
		$b as b
	} from 'm';
	let n = 0;
</script>

<button onclick={() => (n = a(b))}>{n}</button>
"#;

/// A `;` reaches the same `return None` arm as `)`.
const SEMICOLON_IN_COMMENT: &str = r#"<script>
	import { $a as a, /* ; c */ $b as b } from 'm';
	let n = 0;
</script>

<button onclick={() => (n = a(b))}>{n}</button>
"#;

const NO_COMMENT: &str = r#"<script>
	import { $a as a, $b as b } from 'm';
	let n = 0;
</script>

<button onclick={() => (n = a(b))}>{n}</button>
"#;

/// A real store subscription must still be recognised, so a fix that simply
/// stopped classifying references would fail here.
const REAL_STORE: &str = r#"<script>
	import { s } from 'm';
	let n = 0;
</script>

<button>{$s}{n}</button>
"#;

#[test]
fn a_block_comment_between_specifiers_creates_no_store_reference() {
    for (generate, dev) in targets() {
        assert_eq!(
            store_ops(BLOCK_COMMENT, generate, dev),
            0,
            "a `/* ) c */` between import specifiers must not create a store read ({generate:?}, dev={dev})"
        );
    }
}

#[test]
fn a_line_comment_between_specifiers_creates_no_store_reference() {
    for (generate, dev) in targets() {
        assert_eq!(
            store_ops(LINE_COMMENT, generate, dev),
            0,
            "({generate:?}, dev={dev})"
        );
    }
}

#[test]
fn a_semicolon_in_the_comment_reaches_the_same_arm() {
    for (generate, dev) in targets() {
        assert_eq!(
            store_ops(SEMICOLON_IN_COMMENT, generate, dev),
            0,
            "({generate:?}, dev={dev})"
        );
    }
}

#[test]
fn the_uncommented_import_is_unchanged() {
    // CONTROL: passes in both arms; it establishes that the divergence is the
    // comment and not the `$`-prefixed specifier name.
    for (generate, dev) in targets() {
        assert_eq!(
            store_ops(NO_COMMENT, generate, dev),
            0,
            "({generate:?}, dev={dev})"
        );
    }
}

#[test]
fn a_real_store_subscription_still_compiles_to_store_reads() {
    // CONTROL: the collector must keep finding genuine `$name` reads.
    for (generate, dev) in targets() {
        assert!(
            store_ops(REAL_STORE, generate, dev) > 0,
            "a genuine store read must survive ({generate:?}, dev={dev})"
        );
    }
}

fn targets() -> Vec<(GenerateMode, bool)> {
    vec![
        (GenerateMode::Client, false),
        (GenerateMode::Client, true),
        (GenerateMode::Server, false),
        (GenerateMode::Server, true),
    ]
}
