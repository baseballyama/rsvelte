use rsvelte_kernel::output::edits::BorrowedEdits as Edits;
use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet_syntax::properties::{names_keyframes, without_browser_prefix};
use rsvelte_stylesheet_syntax::syntax_tree::{Declaration, Rule, RuleKind, StyleSheet};
use rustc_hash::FxHashSet;

pub(super) struct Names<'a> {
    source: &'a str,
    local: FxHashSet<&'a str>,
    prefix: &'a str,
    tokens: &'a [Span],
}

impl<'a> Names<'a> {
    pub(super) fn new(source: &'a str, sheet: &'a StyleSheet, prefix: &'a str) -> Self {
        fn collect<'a>(
            source: &'a str,
            rules: &[Rule],
            global: bool,
            names: &mut FxHashSet<&'a str>,
        ) {
            for rule in rules {
                let mut global = global;
                if let RuleKind::Style { selectors, .. } = &rule.kind {
                    global |= selectors.iter().any(|s| s.opens_global_block(source));
                }
                if let RuleKind::At { name, prelude, .. } = rule.kind
                    && without_browser_prefix(name.text(source)) == "keyframes"
                    && !global
                    && !prelude.text(source).starts_with("-global-")
                {
                    names.insert(prelude.text(source));
                }
                collect(source, &rule.children, global, names);
            }
        }
        let mut local = FxHashSet::default();
        collect(source, &sheet.rules, false, &mut local);
        Self {
            source,
            local,
            prefix,
            tokens: &sheet.value_tokens,
        }
    }

    pub(super) fn rename(&self, name: Span, global: bool, edits: &mut Edits<'a>) {
        if name.text(self.source).starts_with("-global-") {
            edits.replace(
                Span::new(
                    name.start_offset,
                    name.start_offset + "-global-".len() as u32,
                ),
                "",
            );
        } else if !global {
            edits.insert(name.start_offset, self.prefix);
        }
    }

    pub(super) fn declaration(&self, declaration: &Declaration, edits: &mut Edits<'a>) {
        if self.local.is_empty() {
            return;
        }
        if names_keyframes(declaration.property.text(self.source)) {
            for token in
                &self.tokens[declaration.tokens.start as usize..declaration.tokens.end as usize]
            {
                if self.local.contains(token.text(self.source)) {
                    edits.insert(token.start_offset, self.prefix);
                }
            }
        }
    }
}
