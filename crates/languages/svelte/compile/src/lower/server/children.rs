use rsvelte_svelte_semantic::compiler_syntax_tree::NodeKind;
use rsvelte_svelte_syntax::syntax_tree::escape_markup;

use super::template::Template;
use super::{R, ServerCompilationContext, known_string};
use crate::lower::builder::Runtime;
use crate::render_plan::Item;

impl<'o> ServerCompilationContext<'_, 'o> {
    /// Upstream `process_children` (server).
    pub(super) fn process_children(
        &mut self,
        items: &[Item],
        template: &mut Template<'_, 'o>,
    ) -> R<()> {
        let mut sequence: Vec<&Item> = Vec::new();
        for item in items {
            match item {
                Item::Text { .. } | Item::Expression(_) => sequence.push(item),
                Item::Comment => {
                    self.flush(&mut sequence, template);
                    template.text("<!---->");
                }
                Item::Node(identifier) => {
                    self.flush(&mut sequence, template);
                    match self.compiler_syntax_tree.node(*identifier).kind {
                        NodeKind::Element(_) => self.element(*identifier, template)?,
                        NodeKind::If { .. } => self.if_block(*identifier, template)?,
                        NodeKind::Each(_) => self.each_block(*identifier, template)?,
                        NodeKind::Key { .. } => self.key_block(*identifier, template)?,
                        NodeKind::Await(_) => self.await_block(*identifier, template)?,
                        // Upstream `HtmlTag` (server).
                        NodeKind::Html { expression } => template
                            .expression(self.b.runtime("html", [self.expression(expression)])),
                        NodeKind::Render { .. } => self.render_tag(*identifier, false, template),
                        _ => unreachable!("clean_nodes keeps only elements and blocks as nodes"),
                    }
                }
            }
        }
        self.flush(&mut sequence, template);
        Ok(())
    }

    fn flush(&self, sequence: &mut Vec<&Item>, template: &mut Template<'_, 'o>) {
        if sequence.is_empty() {
            return;
        }
        let mut quasis = vec![String::new()];
        let mut expressions = Vec::new();
        for item in sequence.drain(..) {
            match item {
                Item::Text { data, .. } => {
                    quasis
                        .last_mut()
                        .expect("never empty")
                        .push_str(&escape_markup(
                            data.get(self.source_text, self.compiler_syntax_tree),
                            false,
                        ));
                }
                Item::Expression(e) => {
                    let evaluated = self.evaluate(*e);
                    if evaluated.is_known {
                        let s = known_string(&evaluated.value);
                        quasis
                            .last_mut()
                            .expect("never empty")
                            .push_str(&escape_markup(&s, false));
                    } else {
                        expressions.push(self.b.runtime("escape", [self.expression(*e)]));
                        quasis.push(String::new());
                    }
                }
                Item::Node(_) | Item::Comment => {
                    unreachable!("sequences hold text and expressions")
                }
            }
        }
        template.quasis(quasis, expressions);
    }
}
