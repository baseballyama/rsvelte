use rsvelte_kernel::source::positions::SourceLocation;

use super::{NodeIdentifier, Rewrite, SyntaxTree, copy, copy_all, copy_opt};
use crate::syntax_tree::Control;

pub(super) fn copy_control<R: Rewrite + ?Sized>(
    from: &SyntaxTree,
    to: &mut SyntaxTree,
    rw: &mut R,
    value: Control<'_>,
    span: SourceLocation,
) -> NodeIdentifier {
    let control = match value {
        Control::Throw(n) => Control::Throw(copy(from, to, rw, n)),
        Control::Try {
            block,
            handler,
            finalizer,
        } => Control::Try {
            block: copy(from, to, rw, block),
            handler: copy_opt(from, to, rw, handler),
            finalizer: copy_opt(from, to, rw, finalizer),
        },
        Control::Catch { parameter, body } => Control::Catch {
            parameter: copy_opt(from, to, rw, parameter),
            body: copy(from, to, rw, body),
        },
        Control::While { test, body, is_do } => Control::While {
            test: copy(from, to, rw, test),
            body: copy(from, to, rw, body),
            is_do,
        },
        Control::ForEach {
            left,
            right,
            body,
            is_of,
            is_await,
        } => Control::ForEach {
            left: copy(from, to, rw, left),
            right: copy(from, to, rw, right),
            body: copy(from, to, rw, body),
            is_of,
            is_await,
        },
        Control::Switch {
            discriminant,
            cases,
        } => {
            let d = copy(from, to, rw, discriminant);
            let c = copy_all(from, to, rw, cases);
            return to.control(
                Control::Switch {
                    discriminant: d,
                    cases: &c,
                },
                span,
            );
        }
        Control::Case { test, consequent } => {
            let t = copy_opt(from, to, rw, test);
            let c = copy_all(from, to, rw, consequent);
            return to.control(
                Control::Case {
                    test: t,
                    consequent: &c,
                },
                span,
            );
        }
        Control::Jump { label, is_continue } => Control::Jump {
            label: copy_opt(from, to, rw, label),
            is_continue,
        },
        Control::Labeled { label, body } => Control::Labeled {
            label: copy(from, to, rw, label),
            body: copy(from, to, rw, body),
        },
        Control::Debugger => Control::Debugger,
        Control::ExportList { specifiers, source } => {
            let specs = copy_all(from, to, rw, specifiers);
            let source = copy_opt(from, to, rw, source);
            return to.control(
                Control::ExportList {
                    specifiers: &specs,
                    source,
                },
                span,
            );
        }
        Control::ExportSpecifier { local, exported } => Control::ExportSpecifier {
            local: copy(from, to, rw, local),
            exported: copy(from, to, rw, exported),
        },
        Control::ExportAll { source, exported } => Control::ExportAll {
            source: copy(from, to, rw, source),
            exported: copy_opt(from, to, rw, exported),
        },
    };
    to.control(control, span)
}
