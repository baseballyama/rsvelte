use super::{escape_markup, is_void};

/// The HTML of one fragment, built while its nodes are visited (upstream `Template`).
#[derive(Default)]
pub(super) struct Template {
    arena: Vec<TplNode>,
    roots: Vec<usize>,
    stack: Vec<usize>,
    pub(super) needs_import_node: bool,
}

enum TplNode {
    Element {
        name: String,
        attributes: Vec<(String, Option<String>)>,
        children: Vec<usize>,
    },
    Text(String),
    Comment(Option<String>),
}

impl Template {
    fn add(&mut self, n: TplNode) -> usize {
        self.arena.push(n);
        let i = self.arena.len() - 1;
        match self.stack.last() {
            Some(&p) => match &mut self.arena[p] {
                TplNode::Element { children, .. } => children.push(i),
                _ => unreachable!("only elements are pushed on the stack"),
            },
            None => self.roots.push(i),
        }
        i
    }

    pub(super) fn push_element(&mut self, name: &str) {
        let i = self.add(TplNode::Element {
            name: name.to_owned(),
            attributes: Vec::new(),
            children: Vec::new(),
        });
        self.stack.push(i);
    }

    pub(super) fn pop_element(&mut self) {
        self.stack.pop();
    }

    pub(super) fn push_text(&mut self, raw: String) {
        self.add(TplNode::Text(raw));
    }

    pub(super) fn push_comment(&mut self) {
        self.add(TplNode::Comment(None));
    }

    /// Like a JS object: setting an existing key keeps its position.
    pub(super) fn set_prop(&mut self, key: &str, value: Option<String>) {
        let top = *self
            .stack
            .last()
            .expect("attributes are set on an open element");
        let TplNode::Element { attributes, .. } = &mut self.arena[top] else {
            unreachable!("stack holds elements")
        };
        match attributes.iter_mut().find(|(k, _)| k == key) {
            Some(slot) => slot.1 = value,
            None => attributes.push((key.to_owned(), value)),
        }
    }

    pub(super) fn is_lone_comment(&self) -> bool {
        self.roots.len() == 1 && matches!(self.arena[self.roots[0]], TplNode::Comment(_))
    }

    pub(super) fn markup(&self) -> String {
        let mut out = String::new();
        for &r in &self.roots {
            self.stringify(r, &mut out);
        }
        out
    }

    fn stringify(&self, i: usize, out: &mut String) {
        match &self.arena[i] {
            TplNode::Text(raw) => out.push_str(raw),
            TplNode::Comment(Some(d)) => {
                out.push_str("<!--");
                out.push_str(d);
                out.push_str("-->");
            }
            TplNode::Comment(None) => out.push_str("<!>"),
            TplNode::Element {
                name,
                attributes,
                children,
            } => {
                out.push('<');
                out.push_str(name);
                for (k, v) in attributes {
                    out.push(' ');
                    out.push_str(&k.to_ascii_lowercase());
                    if let Some(v) = v {
                        out.push_str("=\"");
                        out.push_str(&escape_markup(v, true));
                        out.push('"');
                    }
                }
                if is_void(name) {
                    out.push_str("/>");
                } else {
                    out.push('>');
                    for &c in children {
                        self.stringify(c, out);
                    }
                    out.push_str("</");
                    out.push_str(name);
                    out.push('>');
                }
            }
        }
    }
}
