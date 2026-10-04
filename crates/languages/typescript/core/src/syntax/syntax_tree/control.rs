use super::{NodeIdentifier, SourceLocation, SyntaxTree, Tag};

#[derive(Clone, Copy, Debug)]
pub enum Control<'a> {
    Throw(NodeIdentifier),
    Try {
        block: NodeIdentifier,
        handler: Option<NodeIdentifier>,
        finalizer: Option<NodeIdentifier>,
    },
    Catch {
        parameter: Option<NodeIdentifier>,
        body: NodeIdentifier,
    },
    While {
        test: NodeIdentifier,
        body: NodeIdentifier,
        is_do: bool,
    },
    ForEach {
        left: NodeIdentifier,
        right: NodeIdentifier,
        body: NodeIdentifier,
        is_of: bool,
        is_await: bool,
    },
    Switch {
        discriminant: NodeIdentifier,
        cases: &'a [NodeIdentifier],
    },
    Case {
        test: Option<NodeIdentifier>,
        consequent: &'a [NodeIdentifier],
    },
    Jump {
        label: Option<NodeIdentifier>,
        is_continue: bool,
    },
    Labeled {
        label: NodeIdentifier,
        body: NodeIdentifier,
    },
    Debugger,
    ExportList {
        specifiers: &'a [NodeIdentifier],
        source: Option<NodeIdentifier>,
    },
    ExportSpecifier {
        local: NodeIdentifier,
        exported: NodeIdentifier,
    },
    ExportAll {
        source: NodeIdentifier,
        exported: Option<NodeIdentifier>,
    },
}

#[derive(Clone, Copy)]
#[repr(u8)]
enum ControlTag {
    Throw,
    Try,
    Catch,
    While,
    DoWhile,
    ForIn,
    ForOf,
    ForAwaitOf,
    Switch,
    Case,
    Break,
    Continue,
    Labeled,
    Debugger,
    ExportList,
    ExportSpecifier,
    ExportAll,
}

impl SyntaxTree {
    pub fn control(
        &mut self,
        control: Control<'_>,
        location: impl Into<SourceLocation>,
    ) -> NodeIdentifier {
        let none = NodeIdentifier::NONE;
        let (tag, data) = match control {
            Control::Throw(value) => (ControlTag::Throw, [value.0, 0]),
            Control::Try {
                block,
                handler,
                finalizer,
            } => (
                ControlTag::Try,
                [
                    self.record(&[block, handler.unwrap_or(none), finalizer.unwrap_or(none)]),
                    0,
                ],
            ),
            Control::Catch { parameter, body } => {
                (ControlTag::Catch, [parameter.unwrap_or(none).0, body.0])
            }
            Control::While { test, body, is_do } => (
                if is_do {
                    ControlTag::DoWhile
                } else {
                    ControlTag::While
                },
                [test.0, body.0],
            ),
            Control::ForEach {
                left,
                right,
                body,
                is_of,
                is_await,
            } => (
                if is_await {
                    ControlTag::ForAwaitOf
                } else if is_of {
                    ControlTag::ForOf
                } else {
                    ControlTag::ForIn
                },
                [self.record(&[left, right, body]), 0],
            ),
            Control::Switch {
                discriminant,
                cases,
            } => (ControlTag::Switch, [discriminant.0, self.list(cases)]),
            Control::Case { test, consequent } => (
                ControlTag::Case,
                [test.unwrap_or(none).0, self.list(consequent)],
            ),
            Control::Jump { label, is_continue } => (
                if is_continue {
                    ControlTag::Continue
                } else {
                    ControlTag::Break
                },
                [label.unwrap_or(none).0, 0],
            ),
            Control::Labeled { label, body } => (ControlTag::Labeled, [label.0, body.0]),
            Control::Debugger => (ControlTag::Debugger, [0, 0]),
            Control::ExportList { specifiers, source } => (
                ControlTag::ExportList,
                [self.list(specifiers), source.unwrap_or(none).0],
            ),
            Control::ExportSpecifier { local, exported } => {
                (ControlTag::ExportSpecifier, [local.0, exported.0])
            }
            Control::ExportAll { source, exported } => (
                ControlTag::ExportAll,
                [source.0, exported.unwrap_or(none).0],
            ),
        };
        self.push(Tag::Control, tag as u8, data, location)
    }

    pub(super) fn control_kind(&self, node: NodeIdentifier) -> Control<'_> {
        let [a, b] = self.d(node);
        let tag = self.flags(node);
        match tag {
            x if x == ControlTag::Throw as u8 => Control::Throw(NodeIdentifier(a)),
            x if x == ControlTag::Try as u8 => Control::Try {
                block: self.rec(a, 0),
                handler: self.rec(a, 1).opt(),
                finalizer: self.rec(a, 2).opt(),
            },
            x if x == ControlTag::Catch as u8 => Control::Catch {
                parameter: NodeIdentifier(a).opt(),
                body: NodeIdentifier(b),
            },
            x if x == ControlTag::While as u8 || x == ControlTag::DoWhile as u8 => Control::While {
                test: NodeIdentifier(a),
                body: NodeIdentifier(b),
                is_do: x == ControlTag::DoWhile as u8,
            },
            x if x == ControlTag::ForIn as u8
                || x == ControlTag::ForOf as u8
                || x == ControlTag::ForAwaitOf as u8 =>
            {
                Control::ForEach {
                    left: self.rec(a, 0),
                    right: self.rec(a, 1),
                    body: self.rec(a, 2),
                    is_of: x != ControlTag::ForIn as u8,
                    is_await: x == ControlTag::ForAwaitOf as u8,
                }
            }
            x if x == ControlTag::Switch as u8 => Control::Switch {
                discriminant: NodeIdentifier(a),
                cases: self.list_at(b),
            },
            x if x == ControlTag::Case as u8 => Control::Case {
                test: NodeIdentifier(a).opt(),
                consequent: self.list_at(b),
            },
            x if x == ControlTag::Break as u8 || x == ControlTag::Continue as u8 => Control::Jump {
                label: NodeIdentifier(a).opt(),
                is_continue: x == ControlTag::Continue as u8,
            },
            x if x == ControlTag::Labeled as u8 => Control::Labeled {
                label: NodeIdentifier(a),
                body: NodeIdentifier(b),
            },
            x if x == ControlTag::Debugger as u8 => Control::Debugger,
            x if x == ControlTag::ExportList as u8 => Control::ExportList {
                specifiers: self.list_at(a),
                source: NodeIdentifier(b).opt(),
            },
            x if x == ControlTag::ExportSpecifier as u8 => Control::ExportSpecifier {
                local: NodeIdentifier(a),
                exported: NodeIdentifier(b),
            },
            x if x == ControlTag::ExportAll as u8 => Control::ExportAll {
                source: NodeIdentifier(a),
                exported: NodeIdentifier(b).opt(),
            },
            _ => unreachable!("a control tag is set by its constructor"),
        }
    }
}

impl Control<'_> {
    pub(super) fn for_each_child(self, f: &mut impl FnMut(NodeIdentifier)) {
        match self {
            Self::Throw(value) => f(value),
            Self::Try {
                block,
                handler,
                finalizer,
            } => {
                f(block);
                if let Some(n) = handler {
                    f(n);
                }
                if let Some(n) = finalizer {
                    f(n);
                }
            }
            Self::Catch { parameter, body } => {
                if let Some(n) = parameter {
                    f(n);
                }
                f(body);
            }
            Self::While { test, body, is_do } => {
                if is_do {
                    f(body);
                    f(test);
                } else {
                    f(test);
                    f(body);
                }
            }
            Self::ForEach {
                left, right, body, ..
            } => {
                f(left);
                f(right);
                f(body);
            }
            Self::Switch {
                discriminant,
                cases,
            } => {
                f(discriminant);
                for &n in cases {
                    f(n);
                }
            }
            Self::Case { test, consequent } => {
                if let Some(n) = test {
                    f(n);
                }
                for &n in consequent {
                    f(n);
                }
            }
            Self::Labeled { body, .. } => f(body),
            Self::ExportList { specifiers, source } => {
                for &n in specifiers {
                    f(n);
                }
                if let Some(n) = source {
                    f(n);
                }
            }
            Self::ExportSpecifier { local, .. } => f(local),
            Self::ExportAll { source, .. } => f(source),
            Self::Jump { .. } | Self::Debugger => {}
        }
    }
}
