mod each_block;
mod if_block;

use super::{
    Kind, NodeIdentifier, ServerCompilationContext, SourceLocation, sanitize_template_string,
};

impl ServerCompilationContext<'_> {
    /// Upstream `prepend_block_marker`: folds the marker into a leading static push.
    fn prepend_block_marker(
        &mut self,
        mut body: Vec<NodeIdentifier>,
        marker: &str,
    ) -> NodeIdentifier {
        let folded = body.first().and_then(|&first| {
            let Kind::ExpressionStatement(call) = self.out.kind(first) else {
                return None;
            };
            let Kind::Call {
                callee,
                arguments: [arg],
                ..
            } = self.out.kind(call)
            else {
                return None;
            };
            let is_push = matches!(self.out.kind(callee), Kind::Member { object, property, .. }
                if self.out.name(object) == "$$renderer" && self.out.name(property) == "push");
            let Kind::Template {
                quasis,
                expressions,
            } = self.out.kind(*arg)
            else {
                return None;
            };
            if !is_push {
                return None;
            }
            let (quasis, expressions) = (quasis.to_vec(), expressions.to_vec());
            let n = quasis.len();
            let mut new_quasis = Vec::with_capacity(n);
            for (i, &q) in quasis.iter().enumerate() {
                let raw = self.out.str_value(q, self.source_text).to_owned();
                let raw = if i == 0 {
                    format!("{}{raw}", sanitize_template_string(marker))
                } else {
                    raw
                };
                new_quasis.push(self.out.template_element(&raw, i + 1 == n));
            }
            let t = self
                .out
                .template(&new_quasis, &expressions, SourceLocation::SYNTHETIC);
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let call = self
                .out
                .call(callee, &[t], false, SourceLocation::SYNTHETIC);
            Some(self.out.expression_statement(call))
        });
        if let Some(s) = folded {
            body[0] = s;
        } else {
            let r = self.out.identifier("$$renderer");
            let callee = self.out.dot(r, "push");
            let m = self.out.write_string(marker);
            let call = self
                .out
                .call(callee, &[m], false, SourceLocation::SYNTHETIC);
            body.insert(0, self.out.expression_statement(call));
        }
        self.out.block(&body, SourceLocation::SYNTHETIC)
    }
}
