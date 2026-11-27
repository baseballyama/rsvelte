//! A `<style>` element's `StyleSheet`, as the official parser writes it.

use rsvelte_kernel::source::positions::Span;
use rsvelte_stylesheet_syntax::StyleSheet;
use rsvelte_stylesheet_syntax::syntax_tree::{
    AttributeOperator, Combinator, ComplexSelector, Declaration, RelativeSelector, Rule, RuleKind,
    Simple,
};

use super::Printer;

impl Printer<'_> {
    pub(super) fn rules(&mut self, sheet: &StyleSheet, rules: &[Rule]) {
        self.out.array();
        for rule in rules {
            self.out.element();
            self.rule(sheet, rule);
        }
        self.out.end_array();
    }

    fn rule(&mut self, sheet: &StyleSheet, rule: &Rule) {
        match &rule.kind {
            RuleKind::Style { selectors, block } => {
                self.out.object();
                self.out.key("type").string("Rule");
                self.out.key("prelude");
                self.selector_list(sheet, selectors);
                self.out.key("block");
                self.block(sheet, rule, *block);
                self.span(rule.span);
                self.out.end();
            }
            RuleKind::Keyframe { prelude, block } => {
                self.out.object();
                self.out.key("type").string("Rule");
                self.out.key("prelude");
                self.keyframe_selectors(*prelude);
                self.out.key("block");
                self.block(sheet, rule, *block);
                self.span(rule.span);
                self.out.end();
            }
            RuleKind::At {
                name,
                prelude,
                block,
                ..
            } => {
                self.out.object();
                self.out.key("type").string("Atrule");
                self.span(rule.span);
                self.out.key("name").string(sheet.text(*name, self.source));
                self.out
                    .key("prelude")
                    .string(&value(prelude.text(self.source)));
                self.out.key("block");
                match block {
                    Some(block) => self.block(sheet, rule, *block),
                    None => self.out.null(),
                }
                self.out.end();
            }
        }
    }

    fn block(&mut self, sheet: &StyleSheet, rule: &Rule, block: Span) {
        self.out.object();
        self.out.key("type").string("Block");
        self.span(block);
        self.out.key("children").array();
        // Declarations and nested rules, in the order they are written.
        let mut declarations = rule.declarations.iter().peekable();
        let mut children = rule.children.iter().peekable();
        loop {
            let next_declaration = declarations.peek().map(|d| d.span.start_offset);
            let next_rule = children.peek().map(|r| r.span.start_offset);
            match (next_declaration, next_rule) {
                (Some(d), Some(r)) if d < r => {
                    let declaration = declarations.next().expect("peeked");
                    self.out.element();
                    self.declaration(sheet, declaration);
                }
                (Some(_), None) => {
                    let declaration = declarations.next().expect("peeked");
                    self.out.element();
                    self.declaration(sheet, declaration);
                }
                (_, Some(_)) => {
                    let child = children.next().expect("peeked");
                    self.out.element();
                    self.rule(sheet, child);
                }
                (None, None) => break,
            }
        }
        self.out.end_array();
        self.out.end();
    }

    fn declaration(&mut self, sheet: &StyleSheet, declaration: &Declaration) {
        self.out.object();
        self.out.key("type").string("Declaration");
        // svelte ends a declaration where its `;` or the block's `}` is.
        let mut end = declaration
            .span
            .end_offset
            .max(declaration.value.end_offset);
        loop {
            let next = |spans: &[Span]| {
                spans
                    .binary_search_by_key(&end, |span| span.start_offset)
                    .ok()
                    .map(|at| spans[at].end_offset)
            };
            match next(&sheet.whitespace).or_else(|| next(&sheet.comments)) {
                Some(after) => end = after,
                None => break,
            }
        }
        self.span(Span::new(declaration.span.start_offset, end));
        self.out
            .key("property")
            .string(declaration.property.text(self.source));
        self.out
            .key("value")
            .string(&value(declaration.value.text(self.source)));
        self.out.end();
    }

    fn selector_list(&mut self, sheet: &StyleSheet, selectors: &[ComplexSelector]) {
        self.out.object();
        self.out.key("type").string("SelectorList");
        let span = selectors
            .first()
            .zip(selectors.last())
            .map_or(Span::new(0, 0), |(first, last)| {
                Span::new(first.span.start_offset, last.span.end_offset)
            });
        self.span(span);
        self.out.key("children").array();
        for selector in selectors {
            self.out.element();
            self.complex(sheet, selector);
        }
        self.out.end_array();
        self.out.end();
    }

    fn complex(&mut self, sheet: &StyleSheet, selector: &ComplexSelector) {
        self.out.object();
        self.out.key("type").string("ComplexSelector");
        self.span(selector.span);
        self.out.key("children").array();
        for part in &selector.parts {
            self.out.element();
            self.relative(sheet, part);
        }
        self.out.end_array();
        self.out.end();
    }

    fn relative(&mut self, sheet: &StyleSheet, part: &RelativeSelector) {
        self.out.object();
        self.out.key("type").string("RelativeSelector");
        self.out.key("combinator");
        let first = part.simple.first().span().start_offset;
        match part.combinator {
            None => self.out.null(),
            Some(combinator) => {
                let name = match combinator {
                    Combinator::Descendant => " ",
                    Combinator::Child => ">",
                    Combinator::NextSibling => "+",
                    Combinator::SubsequentSibling => "~",
                    Combinator::Column => "||",
                };
                let span = if name == " " {
                    Span::new(part.span.start_offset, first)
                } else {
                    let at = part.span.start_offset
                        + self.source[part.span.start_offset as usize..first as usize]
                            .find(name)
                            .map_or(0, |at| at as u32);
                    Span::new(at, at + name.len() as u32)
                };
                self.out.object();
                self.out.key("type").string("Combinator");
                self.out.key("name").string(name);
                self.span(span);
                self.out.end();
            }
        }
        self.out.key("selectors").array();
        for simple in &part.simple {
            self.out.element();
            self.simple(sheet, simple);
        }
        self.out.end_array();
        self.span(part.span);
        self.out.end();
    }

    fn simple(&mut self, sheet: &StyleSheet, simple: &Simple) {
        let source = self.source;
        self.out.object();
        match simple {
            Simple::Type(span) | Simple::Universal(span) => {
                self.out.key("type").string("TypeSelector");
                self.out.key("name").string(sheet.text(*span, source));
            }
            Simple::NamespacedType { span, name } => {
                self.out.key("type").string("TypeSelector");
                self.out.key("name").string(sheet.text(*name, source));
                let namespace = &source[span.start_offset as usize..name.start_offset as usize];
                self.out
                    .key("namespace")
                    .string(namespace.trim_end_matches('|'));
            }
            Simple::Nesting(_) => {
                self.out.key("type").string("NestingSelector");
                self.out.key("name").string("&");
            }
            Simple::Nth(span) => {
                self.out.key("type").string("Nth");
                self.out.key("value").string(span.text(source).trim_end());
            }
            Simple::Class { name, .. } => {
                self.out.key("type").string("ClassSelector");
                self.out.key("name").string(sheet.text(*name, source));
            }
            Simple::Identifier { name, .. } => {
                self.out.key("type").string("IdSelector");
                self.out.key("name").string(sheet.text(*name, source));
            }
            Simple::Attribute {
                name,
                matcher,
                insensitive,
                ..
            } => {
                self.out.key("type").string("AttributeSelector");
                self.out.key("name").string(sheet.text(*name, source));
                if let Some((operator, value)) = matcher {
                    let operator = match operator {
                        AttributeOperator::Equal => "=",
                        AttributeOperator::Includes => "~=",
                        AttributeOperator::Dash => "|=",
                        AttributeOperator::Prefix => "^=",
                        AttributeOperator::Suffix => "$=",
                        AttributeOperator::Substring => "*=",
                    };
                    self.out.key("matcher").string(operator);
                    let text = value.text(source);
                    let unquoted = text
                        .strip_prefix('"')
                        .and_then(|t| t.strip_suffix('"'))
                        .or_else(|| text.strip_prefix('\'').and_then(|t| t.strip_suffix('\'')))
                        .unwrap_or(text);
                    self.out.key("value").string(unquoted.trim());
                } else {
                    self.out.key("matcher").null();
                    self.out.key("value").null();
                }
                self.out.key("flags");
                match insensitive {
                    Some(true) => self.out.string("i"),
                    Some(false) => self.out.string("s"),
                    None => self.out.null(),
                }
            }
            Simple::PseudoClass {
                name,
                selectors,
                arguments,
                ..
            } => {
                self.out.key("type").string("PseudoClassSelector");
                self.out.key("name").string(sheet.text(*name, source));
                self.out.key("args");
                if arguments.is_some() {
                    self.selector_list(sheet, selectors);
                } else {
                    self.out.null();
                }
            }
            Simple::PseudoElement {
                name, selectors, ..
            } => {
                self.out.key("type").string("PseudoElementSelector");
                self.out.key("name").string(sheet.text(*name, source));
                if !selectors.is_empty() {
                    self.out.key("args");
                    self.selector_list(sheet, selectors);
                }
            }
        }
        self.span(simple.span());
        self.out.end();
    }

    pub(super) fn stylesheet(&mut self, style: &rsvelte_svelte_syntax::syntax_tree::Style) {
        self.out.object();
        self.out.key("type").string("StyleSheet");
        self.span(style.span);
        self.out.key("attributes");
        self.tag_attributes(&style.attributes);
        self.out.key("children");
        match &style.sheet {
            Ok(sheet) => self.rules(sheet, &sheet.rules),
            Err(_) => self.out.raw("[]"),
        }
        self.out.key("comments").array();
        if let Ok(sheet) = &style.sheet {
            for &comment in &sheet.comments {
                self.out.element().object();
                self.out.key("type").string("CSSComment");
                let text = comment.text(self.source);
                let inner = text.strip_prefix("/*").unwrap_or(text);
                let inner = inner.strip_suffix("*/").unwrap_or(inner);
                self.out.key("value").string(inner);
                self.span(comment);
                self.out.end();
            }
        }
        self.out.end_array();
        self.out.key("content").object();
        self.span(style.content);
        self.out
            .key("styles")
            .string(style.content.text(self.source));
        self.out.key("comment");
        match self.comment_before(style.span.start_offset) {
            Some((span, data)) => {
                self.out.object();
                self.out.key("type").string("Comment");
                self.span(span);
                self.out.key("data").string(data.text(self.source));
                self.out.end();
            }
            None => self.out.null(),
        }
        self.out.end();
        self.out.end();
    }

    /// A keyframe's selectors, such as `from, 50%`, which the official parser reads as selectors.
    fn keyframe_selectors(&mut self, prelude: Span) {
        let text = prelude.text(self.source);
        self.out.object();
        self.out.key("type").string("SelectorList");
        // From the first selector to the last, without the space before the block.
        let leading = (text.len() - text.trim_start().len()) as u32;
        let trailing = (text.len() - text.trim_end().len()) as u32;
        self.span(Span::new(
            prelude.start_offset + leading,
            prelude.end_offset - trailing,
        ));
        self.out.key("children").array();
        let mut at = prelude.start_offset;
        for item in text.split(',') {
            let leading = (item.len() - item.trim_start().len()) as u32;
            let trimmed = item.trim();
            let span = Span::new(at + leading, at + leading + trimmed.len() as u32);
            at += item.len() as u32 + 1;
            self.out.element().object();
            self.out.key("type").string("ComplexSelector");
            self.span(span);
            self.out.key("children").array().element().object();
            self.out.key("type").string("RelativeSelector");
            self.out.key("combinator").null();
            self.out.key("selectors").array().element().object();
            if trimmed.ends_with('%') {
                self.out.key("type").string("Percentage");
                self.out.key("value").string(trimmed);
            } else {
                self.out.key("type").string("TypeSelector");
                self.out.key("name").string(trimmed);
            }
            self.span(span);
            self.out.end().end_array();
            self.span(span);
            self.out.end().end_array();
            self.out.end();
        }
        self.out.end_array();
        self.out.end();
    }
}

/// A value as the official parser keeps it: trimmed, without its comments.
fn value(text: &str) -> String {
    let mut out = String::with_capacity(text.len());
    let mut rest = text;
    while let Some(at) = rest.find("/*") {
        out.push_str(&rest[..at]);
        rest = rest[at..]
            .find("*/")
            .map_or("", |end| &rest[at + end + 2..]);
    }
    out.push_str(rest);
    out.trim().to_owned()
}
