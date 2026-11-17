//! The scripts the plugin prints as they are, because its parser for them throws.

use oxc_ast::ast::{
    AccessorProperty, ArrowFunctionExpression, Class, ClassElement, Function, PrivateIdentifier,
    Program, PropertyDefinition, StaticBlock, Super, WithClause, WithClauseKeyword,
};
use oxc_ast_visit::{Visit, walk};
use oxc_span::GetSpan;
use oxc_syntax::scope::ScopeFlags;
use rsvelte_svelte_syntax::syntax_tree::{Component, TokenType};
use rsvelte_typescript_tree::{Reader, Recorded, SyntaxError};

use super::{R, Span, Unsupported, in_typescript, script_errors};

/// The bodies of the scripts the plugin keeps as they are, as its parser throws on them;
/// `rejected` is the first error a module rejects.
pub(super) fn unparsed_scripts(
    c: &Component,
    source_text: &str,
    rejected: Option<&SyntaxError>,
) -> R<Vec<Span>> {
    let mut unparsed_scripts = thrown_scripts(c, source_text)?;
    let rejected = rejected.filter(|rejected| !read_in_template(c, rejected));
    let unparsed = |span: Span| {
        (unparsed_scripts.iter()).any(|body| {
            body.start_offset <= span.start_offset && span.end_offset <= body.end_offset
        })
    };
    match rejected {
        Some(rejected) if unparsed(rejected.diagnostic.span) => {}
        Some(rejected) => unparsed_scripts.extend(unparsed_script(c, source_text, rejected)?),
        None => unparsed_scripts
            .extend(overriding_script(c, source_text).or_else(|| assertion_script(c, source_text))),
    }
    Ok(unparsed_scripts)
}

/// The bodies of the scripts whose TypeScript errors the plugin's parser for them throws on.
fn thrown_scripts(c: &Component, source_text: &str) -> R<Vec<Span>> {
    let mut thrown = Vec::new();
    for script in c.module.iter().chain(&c.instance) {
        let body = script.content;
        let errors: Vec<&SyntaxError> = script_errors(c, body).collect();
        let Some(first) = errors.first() else {
            continue;
        };
        let reader = if in_typescript(script, source_text) {
            Reader::TypescriptEstree
        } else {
            Reader::BabelTypescript
        };
        // oxc recovered no program from an error that stopped it, and neither parser reads on.
        let recovered = !c.javascript.get_program(script.program).span.is_empty();
        let tokens: Vec<Recorded> = (c.tokens.iter())
            .filter(|token| {
                body.start_offset <= token.span.start_offset
                    && token.span.end_offset <= body.end_offset
            })
            .filter_map(|token| match token.kind {
                TokenType::JavaScript(kind) => Some(Recorded {
                    kind: Some(kind),
                    span: token.span,
                }),
                _ => None,
            })
            .collect();
        let rejects = !recovered
            || reader
                .throws(&c.javascript, script.program, &errors, &tokens)
                .ok_or_else(|| {
                    Unsupported::at(
                        "a TypeScript error the plugin's parser may throw on",
                        first.diagnostic.span,
                    )
                })?;
        if rejects {
            thrown.push(body);
        }
    }
    Ok(thrown)
}

/// Whether `rejected` declares a name again in the template where Svelte's parser reads it. That
/// parser reads each part of the template apart, and checks the names of a function and of a
/// snippet's parameters, but not those of a pattern.
fn read_in_template(c: &Component, rejected: &SyntaxError) -> bool {
    // A name declared twice.
    const DUPLICATE_IDENTIFIER: u32 = 2300;
    struct Find {
        names: oxc_span::Span,
        found: bool,
    }
    impl Find {
        const fn holds(&self, span: oxc_span::Span) -> bool {
            span.start <= self.names.start && self.names.end <= span.end
        }
    }
    impl<'a> Visit<'a> for Find {
        fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
            self.found |= self.holds(it.span);
            walk::walk_function(self, it, flags);
        }

        fn visit_arrow_function_expression(&mut self, it: &ArrowFunctionExpression<'a>) {
            self.found |= self.holds(it.span);
            walk::walk_arrow_function_expression(self, it);
        }
    }
    if rejected.typescript_code != Some(DUPLICATE_IDENTIFIER) {
        return false;
    }
    // oxc labels the first declaration, and acorn reports the second.
    let (first, second) = (rejected.diagnostic.span.start_offset, rejected.acorn_at());
    let in_script = (c.module.iter().chain(&c.instance))
        .any(|script| script.content.start_offset <= second && second <= script.content.end_offset);
    if in_script {
        return false;
    }
    let mut find = Find {
        names: oxc_span::Span::new(first.min(second), first.max(second)),
        found: false,
    };
    let tree = &c.javascript;
    if tree
        .parameters()
        .any(|(_, parameters)| find.holds(parameters.span))
    {
        return false;
    }
    for (_, expression) in tree.expressions() {
        if find.holds(expression.span()) {
            find.visit_expression(expression);
        }
    }
    for (_, declaration) in tree.declarations() {
        if find.holds(declaration.span) {
            find.visit_variable_declaration(declaration);
        }
    }
    for (_, pattern) in tree.patterns() {
        if find.holds(pattern.span) {
            find.visit_formal_parameter(pattern);
        }
    }
    !find.found
}

/// The body of the JavaScript script whose tree holds an `assert { … }` import attribute clause,
/// which `babel-ts` throws on, so the plugin keeps that body as it is.
fn assertion_script(c: &Component, source_text: &str) -> Option<Span> {
    struct Find(bool);
    impl<'a> Visit<'a> for Find {
        fn visit_with_clause(&mut self, it: &WithClause<'a>) {
            self.0 |= it.keyword == WithClauseKeyword::Assert;
        }
    }
    let script = (c.module.iter().chain(&c.instance)).find(|script| {
        let mut find = Find(false);
        find.visit_program(c.javascript.get_program(script.program));
        find.0 && !in_typescript(script, source_text)
    })?;
    Some(script.content)
}

/// The body of the script holding `rejected` when the plugin's parser for it throws on that error,
/// so the plugin keeps the body as it is. Otherwise the parser reads on, and as the error is the
/// analysis's, the tree is the one oxc built.
fn unparsed_script(c: &Component, source_text: &str, rejected: &SyntaxError) -> R<Option<Span>> {
    // A name declared twice; Babel throws only on a private one.
    const DUPLICATE_IDENTIFIER: u32 = 2300;
    // `super` and `super()` where tsc does not allow them; Babel allows both outside every
    // function, as Prettier lets it.
    const SUPER: [u32; 2] = [2337, 2660];
    let span = rejected.diagnostic.span;
    let unknown = || Unsupported::at("code a module rejects", span);
    let script = (c.module.iter().chain(&c.instance))
        .find(|script| {
            script.content.start_offset <= span.start_offset
                && span.end_offset <= script.content.end_offset
        })
        .ok_or_else(unknown)?;
    let program = c.javascript.get_program(script.program);
    // tsc reports no error for a function declared as a statement's body, which a module does
    // not allow; Babel throws only on an async one.
    if let Some(is_async) = (rejected.typescript_code.is_none())
        .then(|| rsvelte_typescript_tree::function_as_body(program, span.start_offset))
        .flatten()
    {
        let throws = is_async && !in_typescript(script, source_text);
        return Ok(throws.then_some(script.content));
    }
    let code = rejected.typescript_code.ok_or_else(unknown)?;
    let throws = if in_typescript(script, source_text) {
        rsvelte_typescript_tree::typescript_estree_throws(code)
    } else if code == DUPLICATE_IDENTIFIER {
        private_name_at(program, span.start_offset)
    } else if SUPER.contains(&code) {
        super_in_function(program, span.start_offset)
    } else {
        rsvelte_typescript_tree::babel_typescript_throws(code).ok_or_else(unknown)?
    };
    Ok(throws.then_some(script.content))
}

/// The body of a script `babel-ts` reads that has an `override` member in a class that extends
/// none: Babel throws on it, so the plugin keeps that body as it is. Only TypeScript has the
/// modifier.
fn overriding_script(c: &Component, source_text: &str) -> Option<Span> {
    struct Find(bool);
    impl<'a> Visit<'a> for Find {
        fn visit_class(&mut self, it: &Class<'a>) {
            self.0 |= it.heritage.is_none()
                && it.body.body.iter().any(|element| match element {
                    ClassElement::MethodDefinition(member) => member.r#override,
                    ClassElement::PropertyDefinition(member) => member.r#override,
                    ClassElement::AccessorProperty(member) => member.r#override,
                    ClassElement::StaticBlock(_) | ClassElement::TSIndexSignature(_) => false,
                });
            walk::walk_class(self, it);
        }
    }
    let script = (c.module.iter().chain(&c.instance)).find(|script| {
        script.typescript && !in_typescript(script, source_text) && {
            let mut find = Find(false);
            find.visit_program(c.javascript.get_program(script.program));
            find.0
        }
    })?;
    Some(script.content)
}

/// Whether a `super` that starts at `offset` in `program` is inside a function or a class
/// member's initializer, where Babel's scope no longer allows it.
fn super_in_function(program: &Program<'_>, offset: u32) -> bool {
    struct Find {
        offset: u32,
        depth: u32,
        found: bool,
    }
    impl<'a> Visit<'a> for Find {
        fn visit_function(&mut self, it: &Function<'a>, flags: ScopeFlags) {
            self.depth += 1;
            walk::walk_function(self, it, flags);
            self.depth -= 1;
        }

        fn visit_property_definition(&mut self, it: &PropertyDefinition<'a>) {
            self.visit_property_key(&it.key);
            self.depth += 1;
            if let Some(value) = &it.value {
                self.visit_expression(value);
            }
            self.depth -= 1;
        }

        fn visit_accessor_property(&mut self, it: &AccessorProperty<'a>) {
            self.visit_property_key(&it.key);
            self.depth += 1;
            if let Some(value) = &it.value {
                self.visit_expression(value);
            }
            self.depth -= 1;
        }

        fn visit_static_block(&mut self, it: &StaticBlock<'a>) {
            self.depth += 1;
            walk::walk_static_block(self, it);
            self.depth -= 1;
        }

        fn visit_super(&mut self, it: &Super) {
            self.found |= it.span.start == self.offset && self.depth > 0;
        }
    }
    let mut find = Find {
        offset,
        depth: 0,
        found: false,
    };
    find.visit_program(program);
    find.found
}

/// Whether a private name starts at `offset` in `program`.
fn private_name_at(program: &Program<'_>, offset: u32) -> bool {
    struct Find(u32, bool);
    impl<'a> Visit<'a> for Find {
        fn visit_private_identifier(&mut self, it: &PrivateIdentifier<'a>) {
            self.1 |= it.span.start == self.0;
        }
    }
    let mut find = Find(offset, false);
    find.visit_program(program);
    find.1
}
