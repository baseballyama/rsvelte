//! Prettier's `isTestCall`, whose layout (`it("x", function () {…}, 1000)` kept hugged) is not
//! built.

use super::{Formatter, Kind, NodeIdentifier, R, Unsupported};

const TEST_CALLEES: [&str; 10] = [
    "it",
    "describe",
    "test",
    "skip",
    "xit",
    "xdescribe",
    "xtest",
    "fit",
    "fdescribe",
    "ftest",
];
const ANGULAR_WRAPPERS: [&str; 4] = ["async", "inject", "fakeAsync", "waitForAsync"];
const SETUP_CALLEES: [&str; 4] = ["beforeEach", "beforeAll", "afterEach", "afterAll"];

impl Formatter<'_> {
    /// Refuses a call Prettier may print as a test call. It reads more calls as tests than
    /// Prettier does (any member path under a test name), which only refuses more.
    pub(super) fn refuse_test_call(
        &self,
        call: NodeIdentifier,
        arguments: &[NodeIdentifier],
    ) -> R<()> {
        let Kind::Call {
            callee,
            optional: false,
            ..
        } = self.syntax_tree.kind(call)
        else {
            return Ok(());
        };
        let root = self.root_name(callee);
        let test = match arguments {
            [first, ..] if (2..=3).contains(&arguments.len()) => {
                matches!(
                    self.syntax_tree.kind(*first),
                    Kind::String | Kind::Template { .. }
                ) && root.is_some_and(|n| TEST_CALLEES.contains(&n))
            }
            [only] => {
                root.is_some_and(|n| SETUP_CALLEES.contains(&n)) && self.is_angular_wrapper(*only)
            }
            _ => false,
        };
        if test {
            return Err(Unsupported::at(
                "a call Prettier prints as a test call",
                self.syntax_tree.source_location(call),
            ));
        }
        Ok(())
    }

    fn is_angular_wrapper(&self, node: NodeIdentifier) -> bool {
        matches!(self.syntax_tree.kind(node), Kind::Call { callee, .. }
            if self.root_name(callee).is_some_and(|n| ANGULAR_WRAPPERS.contains(&n)))
    }

    /// The name a callee's member path starts from (`test` in `test.describe.only`).
    fn root_name(&self, mut node: NodeIdentifier) -> Option<&str> {
        loop {
            match self.syntax_tree.kind(node) {
                Kind::Identifier(_) => return Some(self.syntax_tree.name(node)),
                Kind::Member { object, .. } => node = object,
                _ => return None,
            }
        }
    }
}
