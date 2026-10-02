use crate::lower::client::{
    AssignmentOperator, Attribute, AttributeValue, ClientCompilationContext,
    CompilerNodeIdentifier, Frag, Kind, Lists, NodeIdentifier, SourceLocation, escape_markup, flag,
    init_property, needs_clsx,
};

impl ClientCompilationContext<'_> {
    /// A `class` value written as one expression, through `$.clsx` when upstream's `needs_clsx`.
    fn class_expression(
        &mut self,
        expression: NodeIdentifier,
        unquoted: bool,
        frag: &mut Frag,
    ) -> (NodeIdentifier, bool) {
        let meta = self.an.meta(expression);
        let mut built = self.expression(expression);
        if unquoted && needs_clsx(self.javascript, expression) {
            built = self.call("clsx", vec![Some(built)]);
        }
        (self.memoize(frag, built, meta), meta.has_state)
    }

    /// Upstream `build_set_class`; `attribute` is `None` for the empty `class` upstream's analysis
    /// adds.
    pub(super) fn set_class(
        &mut self,
        identifier: CompilerNodeIdentifier,
        node: &str,
        attribute: Option<&Attribute>,
        directives: &[&Attribute],
        frag: &mut Frag,
        l: &mut Lists,
    ) {
        let (mut value, mut has_state) = match attribute.map(|a| &a.value) {
            None => (self.out.write_string(""), false),
            Some(&AttributeValue::Expression { expression, quoted }) => {
                self.class_expression(expression, !quoted, frag)
            }
            Some(&AttributeValue::Shorthand(expression)) => {
                self.class_expression(expression, true, frag)
            }
            Some(_) => self.attribute_value(attribute.expect("matched above"), frag),
        };
        let mut prev = None;
        let mut next = None;
        let mut previous_id = None;
        if !directives.is_empty() {
            let mut props = Vec::with_capacity(directives.len());
            for d in directives {
                let AttributeValue::Class(e) = d.value else {
                    unreachable!("class directives")
                };
                let meta = self.an.meta(e);
                let built = self.expression(e);
                let v = self.memoize(frag, built, meta);
                has_state |= meta.has_state;
                props.push(init_property(
                    &mut self.out,
                    d.name.text(self.source_text),
                    v,
                ));
            }
            next = Some(self.out.object(&props, SourceLocation::SYNTHETIC));
            if has_state {
                let name = self.names.generate("classes");
                let x = self.out.identifier(&name);
                l.initializer.push(self.out.let_(flag::LET, x, None));
                prev = Some(self.out.identifier(&name));
                previous_id = Some(name);
            } else {
                prev = Some(self.out.object(&[], SourceLocation::SYNTHETIC));
            }
        }
        let mut stylesheet_hash = None;
        if self.an.scoped[identifier]
            && let Some(hash) = self.identity.stylesheet_hash.clone()
        {
            let literal = match self.out.kind(value) {
                Kind::String => Some(self.out.str_value(value, self.source_text).to_owned()),
                Kind::Null => Some(String::new()),
                _ => None,
            };
            match literal {
                Some(v) if v.is_empty() => value = self.out.write_string(&hash),
                Some(v) => {
                    value = self
                        .out
                        .write_string(&format!("{} {hash}", escape_markup(&v, true)));
                }
                None => stylesheet_hash = Some(self.out.write_string(&hash)),
            }
        }
        if stylesheet_hash.is_none() && next.is_some() {
            stylesheet_hash = Some(self.out.null(SourceLocation::SYNTHETIC));
        }
        let x = self.out.identifier(node);
        let is_markup = self.write_number(1);
        let mut set_class = self.call(
            "set_class",
            vec![
                Some(x),
                Some(is_markup),
                Some(value),
                stylesheet_hash,
                prev,
                next,
            ],
        );
        if let Some(name) = previous_id {
            let target = self.out.identifier(&name);
            set_class = self.out.assign(
                AssignmentOperator::Assign,
                target,
                set_class,
                SourceLocation::SYNTHETIC,
            );
        }
        let s = self.statement(set_class);
        if has_state {
            l.update.push(s);
        } else {
            l.initializer.push(s);
        }
    }
}
