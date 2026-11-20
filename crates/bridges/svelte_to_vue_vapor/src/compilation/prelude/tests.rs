use oxc_ast::ast::{Expression, Statement};
use rsvelte_typescript_compile::build::Builder;

use super::{expand, expanded, marker, parsed, remark, text};
use crate::compilation::helpers::Helper::*;
use crate::compilation::helpers::{self, Helper};

const SCRIPT: [&str; 9] = [
    include_str!("../script/props.js"),
    include_str!("../script/rest.js"),
    include_str!("../script/patterns.js"),
    include_str!("../script/state.js"),
    include_str!("../script/derived.js"),
    include_str!("../script/runes.js"),
    include_str!("../script/lifecycle.js"),
    include_str!("../script/attachments.js"),
    include_str!("../script/async_derived.js"),
];

const EMITTER: [&str; 5] = [
    include_str!("../vapor/server.js"),
    include_str!("../vapor/styles.js"),
    include_str!("../vapor/custom_element.js"),
    include_str!("../vapor/async_server.js"),
    include_str!("../vapor/async_setup.js"),
];

/// Every helper.
const ALL: [Helper; 39] = [
    Each,
    EachServer,
    Attribute,
    AttributeServer,
    BooleanServer,
    SpecialAttribute,
    CustomElementData,
    Stringify,
    NodeValue,
    Clsx,
    Class,
    ToClass,
    SetClass,
    Attributes,
    Spread,
    Fail,
    Value,
    Once,
    Select,
    Option,
    ScopedClass,
    Style,
    RawMarkup,
    Lifecycle,
    Await,
    NumberBinding,
    Group,
    PropertyBinding,
    MediaBinding,
    ResizeBinding,
    WindowScroll,
    FormReset,
    ClassSpread,
    ComponentProps,
    Transition,
    Animate,
    Boundary,
    Async,
    Pending,
];

#[test]
fn every_helper_is_listed() {
    for h in ALL {
        // Exhaustive, so a new helper does not compile until it is listed in `ALL` too.
        match h {
            Each | EachServer | Attribute | AttributeServer | BooleanServer | SpecialAttribute
            | CustomElementData | Stringify | NodeValue | Clsx | Class | ToClass | SetClass
            | Attributes | Spread | Fail | Value | Once | Select | Option | ScopedClass | Style
            | RawMarkup | Lifecycle | Await | NumberBinding | Group | PropertyBinding
            | MediaBinding | ResizeBinding | WindowScroll | FormReset | ClassSpread
            | ComponentProps | Transition | Animate | Boundary | Async | Pending => {}
        }
    }
    let distinct: std::collections::BTreeSet<_> = ALL.into_iter().collect();
    assert_eq!(distinct.len(), ALL.len());
}

/// The template adds what a helper requires one level deep, so what that requires must already
/// be listed.
#[test]
fn what_a_helper_requires_is_closed() {
    for h in ALL {
        let direct = helpers::requires(h);
        for &r in direct {
            for indirect in helpers::requires(r) {
                assert!(
                    direct.contains(indirect),
                    "{h:?} needs {indirect:?} through {r:?}"
                );
            }
        }
    }
}

#[test]
fn a_prelude_is_parsed_once_per_thread() {
    let source = SCRIPT[0];
    assert!(std::ptr::eq(parsed(source), parsed(source)));
}

#[test]
fn a_marker_prints_as_its_prelude_printed_once_per_thread() {
    let allocator = oxc_allocator::Allocator::default();
    let b = Builder::new(&allocator);
    let marked = [marker(&b, SCRIPT[3]), marker(&b, SCRIPT[3])];
    let [first, second] = marked.each_ref().map(|m| text(m).expect("a marker"));
    assert!(std::ptr::eq(first, second));
    assert!(
        first.starts_with("const $$") && first.ends_with(";\n"),
        "{first}"
    );
}

#[test]
fn a_marker_expands_to_its_prelude_in_place() {
    let allocator = oxc_allocator::Allocator::default();
    let b = Builder::new(&allocator);
    let source = SCRIPT[1];
    let body = [b.const_("$$before", b.number(1.0)), marker(&b, source)];
    assert!(expand(&body[0]).is_none());
    let names: Vec<_> = expanded(&body).map(declared).collect();
    let prelude: Vec<_> = parsed(source).iter().map(declared).collect();
    assert_eq!(names[0], "$$before");
    assert_eq!(names[1..], prelude[..]);
}

#[test]
fn a_marker_copied_into_another_arena_marks_the_same_prelude() {
    let (first, second) = (
        oxc_allocator::Allocator::default(),
        oxc_allocator::Allocator::default(),
    );
    let marked = marker(&Builder::new(&first), SCRIPT[3]);
    let copied = remark(&Builder::new(&second), &marked).expect("a marker");
    assert!(std::ptr::eq(
        expand(&copied).expect("a marker"),
        parsed(SCRIPT[3])
    ));
}

#[test]
fn a_string_the_script_wrote_is_not_a_marker() {
    let allocator = oxc_allocator::Allocator::default();
    let b = Builder::new(&allocator);
    let written = b.statement(b.string(SCRIPT[2]));
    assert!(expand(&written).is_none());
}

/// The document's scope analysis no longer sees the preludes, so a reference to a name one
/// declares no longer resolves. The emitter leaves such a reference as written either way when
/// the name is a `$$` constant that no rune cell or ref initializes, which this checks.
#[test]
fn no_prelude_name_is_a_cell_or_a_ref() {
    let allocator = oxc_allocator::Allocator::default();
    let b = Builder::new(&allocator);
    let markers = helpers::declarations(&ALL, &b);
    let sources = SCRIPT
        .iter()
        .chain(&EMITTER)
        .map(|&source| parsed(source))
        .chain(markers.iter().filter_map(expand));
    // The names a prelude's top level calls, none of which makes a cell or a ref.
    let calls = ["Symbol", "$$v_defineVaporComponent", "$$lifecycle_owner"];
    for statement in sources.flatten() {
        let declarators = match statement {
            Statement::VariableDeclaration(d) => &d.declarations,
            Statement::FunctionDeclaration(_) => {
                assert!(declared(statement).starts_with("$$"));
                continue;
            }
            Statement::ExpressionStatement(_) => continue,
            other => panic!("a prelude declares only constants: {other:?}"),
        };
        for d in declarators {
            let name = d.id.get_binding_identifier().expect("a plain name");
            assert!(name.name.starts_with("$$"), "{}", name.name);
            // A ref is made by a call to a name; a member call never makes one.
            if let Some(Expression::CallExpression(call)) = &d.init
                && let Expression::Identifier(callee) = &call.callee
            {
                assert!(calls.contains(&callee.name.as_str()), "{}", callee.name);
            }
        }
    }
}

fn declared<'a>(statement: &'a Statement<'_>) -> &'a str {
    match statement {
        Statement::VariableDeclaration(d) => d.declarations[0]
            .id
            .get_binding_identifier()
            .map_or("", |id| id.name.as_str()),
        Statement::FunctionDeclaration(f) => f.id.as_ref().map_or("", |id| id.name.as_str()),
        _ => "",
    }
}
