use std::cell::{OnceCell, RefCell};

use rsvelte_kernel::index::IndexVector;
use rsvelte_stylesheet_semantic::matcher::{self, Match};
use rsvelte_stylesheet_syntax::syntax_tree::{Rule, RuleIdentifier};
use rustc_hash::FxHashMap;

use crate::compiler_syntax_tree::{self, CompilerNodeIdentifier, CompilerSyntaxTree};

mod attributes;
mod candidates;
mod duplicates;
mod element;
mod external;
mod relations;
mod topology;
mod worklist;
use attributes::AttributeFacts;
use candidates::Candidates;
use duplicates::Duplicates;
use topology::Topology;

use super::Analysis;
use crate::input::ComponentInput;

pub(super) fn analyze(
    input: &ComponentInput<'_>,
    resolution: &crate::resolve::Resolution,
    analysis: &mut Analysis,
) {
    let Some(sheet) = input.style else {
        return;
    };
    analysis.stylesheet_used = vec![false; sheet.selector_count as usize];
    analysis.stylesheet_scoped = vec![false; sheet.relative_count as usize];
    external::mark_external(
        input.source_text,
        &sheet.rules,
        false,
        &mut analysis.stylesheet_used,
    );
    let in_global_blocks = external::in_global_blocks(
        input.source_text,
        &sheet.rules,
        sheet.selector_count as usize,
    );
    for (used, &inside) in analysis.stylesheet_used.iter_mut().zip(&in_global_blocks) {
        *used |= inside;
    }
    let facts = Facts {
        input,
        resolution,
        topology: OnceCell::new(),
        attributes: OnceCell::new(),
        rules: OnceCell::new(),
    };
    let nesting = RefCell::new(FxHashMap::default());
    let candidates = Candidates::new(input.compiler_syntax_tree, input.source_text, sheet);
    let mut duplicates = Duplicates::default();
    let elements_scoped = &mut analysis.scoped;
    sheet.visit_selectors(|selector| {
        if in_global_blocks[selector.id as usize] {
            return;
        }
        duplicates.match_once(
            selector,
            input.source_text,
            &mut analysis.stylesheet_used,
            &mut analysis.stylesheet_scoped,
            |used, scoped| {
                for identifier in candidates.matching(selector, sheet, input.source_text) {
                    let element = El {
                        compiler_syntax_tree: input.compiler_syntax_tree,
                        source_text: input.source_text,
                        identifier,
                        facts: &facts,
                        nesting: &nesting,
                        sheet,
                    };
                    matcher::matches_with(
                        input.source_text,
                        selector,
                        element,
                        &mut |matched, relative| {
                            elements_scoped[matched.identifier] = true;
                            scoped(relative.id);
                        },
                        used,
                    );
                }
            },
        );
    });
}

struct Facts<'a> {
    input: &'a ComponentInput<'a>,
    resolution: &'a crate::resolve::Resolution,
    topology: OnceCell<Topology<'a>>,
    attributes: OnceCell<AttributeFacts<'a>>,
    rules: OnceCell<IndexVector<RuleIdentifier, Option<&'a Rule>>>,
}

impl<'a> Facts<'a> {
    fn rules(&self) -> &IndexVector<RuleIdentifier, Option<&'a Rule>> {
        self.rules.get_or_init(|| {
            let sheet = self
                .input
                .style
                .expect("stylesheet facts require a stylesheet");
            let mut rules = IndexVector::from_element_n(None, sheet.rule_count);
            index_rules(&sheet.rules, &mut rules);
            rules
        })
    }

    fn topology(&self) -> &Topology<'_> {
        self.topology
            .get_or_init(|| Topology::new(self.input, self.resolution))
    }

    fn attributes(&self) -> &AttributeFacts<'a> {
        self.attributes
            .get_or_init(|| AttributeFacts::new(self.input))
    }
}

#[derive(Clone, Copy)]
struct El<'a> {
    sheet: &'a rsvelte_stylesheet_syntax::StyleSheet,
    compiler_syntax_tree: &'a CompilerSyntaxTree,
    source_text: &'a str,
    identifier: CompilerNodeIdentifier,
    facts: &'a Facts<'a>,
    nesting: &'a RefCell<FxHashMap<(RuleIdentifier, CompilerNodeIdentifier), Match>>,
}

const fn is_dom(element: &compiler_syntax_tree::Element) -> bool {
    matches!(
        element.kind,
        compiler_syntax_tree::ElementKind::Regular
            | compiler_syntax_tree::ElementKind::Title
            | compiler_syntax_tree::ElementKind::Metadata(Some(
                compiler_syntax_tree::MetadataTag::Element
            ))
    )
}

fn index_rules<'a>(
    children: &'a [Rule],
    index: &mut IndexVector<RuleIdentifier, Option<&'a Rule>>,
) {
    for rule in children {
        if let Some(id) = rule.identifier {
            index[id] = Some(rule);
        }
        index_rules(&rule.children, index);
    }
}
