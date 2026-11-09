//! How many groups Prettier's `printMemberChain` makes of a call chain.

use super::{Formatter, Kind, LayoutInstructionIdentifier, NodeIdentifier, R, Unsupported};

/// One of `printMemberChain`'s `printedNodes`.
#[derive(Clone, Copy)]
enum Link {
    Base(NodeIdentifier),
    /// A member access; `literal` when it is computed with a literal key (`a[0]`).
    Member {
        node: NodeIdentifier,
        computed: bool,
        literal: bool,
    },
    Call(NodeIdentifier),
}

impl Formatter<'_> {
    /// Whether the chain ending in `call` has at most the cutoff's number of groups, so that it
    /// prints as `group(oneLine)`; otherwise it chooses between that and the expanded chain.
    ///
    /// # Errors
    ///
    /// When Prettier prints the expanded chain whatever fits, which is not built.
    pub(super) fn member_chain_is_one_line(
        &self,
        call: NodeIdentifier,
        printed_callee: LayoutInstructionIdentifier,
    ) -> R<bool> {
        let links = self.links(call);
        let memberish = |l: &Link| matches!(l, Link::Member { .. });
        // `groups[0]`: the base, the calls and literal lookups right after it, then lookups
        // while another lookup follows.
        let mut i = 1;
        while i < links.len()
            && match links[i] {
                Link::Call(_) => true,
                Link::Member {
                    computed, literal, ..
                } => computed && literal,
                Link::Base(_) => false,
            }
        {
            i += 1;
        }
        let call_base = matches!(links[0], Link::Base(b) if matches!(
            self.syntax_tree.kind(b),
            Kind::Call { .. } | Kind::ImportExpression { .. }
        ));
        while !call_base && i + 1 < links.len() && memberish(&links[i]) && memberish(&links[i + 1])
        {
            i += 1;
        }
        let head = &links[..i];
        let mut groups: Vec<&[Link]> = vec![head];
        let mut start = i;
        let mut seen_call = false;
        for (j, link) in links.iter().enumerate().skip(i) {
            if seen_call
                && let Link::Member {
                    computed, literal, ..
                } = *link
            {
                if computed && !literal {
                    continue;
                }
                groups.push(&links[start..j]);
                start = j;
                seen_call = false;
            }
            if matches!(link, Link::Call(_)) {
                seen_call = true;
            }
        }
        if start < links.len() {
            groups.push(&links[start..]);
        }
        // `shouldMerge` without `isShort`, which only merges more: a smaller cutoff refuses more.
        let merge = groups.len() >= 2 && !groups[1].is_empty() && self.should_not_wrap(&groups);
        let cutoff = if merge { 3 } else { 2 };
        if groups.len() <= cutoff {
            return Ok(true);
        }
        let calls: Vec<NodeIdentifier> = links
            .iter()
            .filter_map(|l| match *l {
                Link::Call(c) => Some(c),
                _ => None,
            })
            .collect();
        let mut complex = false;
        if calls.len() > 2 {
            for &c in &calls {
                let (Kind::Call { arguments, .. } | Kind::New { arguments, .. }) =
                    self.syntax_tree.kind(c)
                else {
                    continue;
                };
                for &a in arguments {
                    complex |= !self.is_simple_call_argument(a, 2)?;
                }
            }
        }
        if complex || self.docs.will_break(printed_callee) {
            return Err(Unsupported::at(
                "a member chain printed expanded",
                self.syntax_tree.source_location(call),
            ));
        }
        Ok(false)
    }

    /// `printedNodes`, from the base out to `call`.
    fn links(&self, call: NodeIdentifier) -> Vec<Link> {
        let mut links = Vec::new();
        let mut node = call;
        loop {
            match self.syntax_tree.kind(node) {
                // `foo(x)` with a plain callee is one node, the chain's base.
                Kind::Call { callee, .. }
                    if matches!(
                        self.syntax_tree.kind(callee),
                        Kind::Member { .. } | Kind::Call { .. }
                    ) =>
                {
                    links.push(Link::Call(node));
                    node = callee;
                }
                Kind::Member {
                    object,
                    property,
                    computed,
                    ..
                } => {
                    let literal = computed
                        && matches!(
                            self.syntax_tree.kind(property),
                            Kind::Number(_) | Kind::String
                        );
                    links.push(Link::Member {
                        node,
                        computed,
                        literal,
                    });
                    node = object;
                }
                _ => {
                    links.push(Link::Base(node));
                    break;
                }
            }
        }
        links.reverse();
        links
    }

    /// `shouldNotWrap`, leaving out its `isShort` test for expression statements.
    fn should_not_wrap(&self, groups: &[&[Link]]) -> bool {
        let has_computed = matches!(
            groups[1].first(),
            Some(Link::Member {
                computed: true,
                literal: true,
                ..
            })
        );
        let is_factory = |name: &str| {
            name.starts_with(|c: char| c.is_ascii_uppercase())
                || (!name.is_empty() && name.bytes().all(|b| b == b'$' || b == b'_'))
        };
        if let [Link::Base(base)] = groups[0] {
            return match self.syntax_tree.kind(*base) {
                Kind::This => true,
                Kind::Identifier(_) => is_factory(self.syntax_tree.name(*base)) || has_computed,
                _ => false,
            };
        }
        match groups[0].last() {
            Some(&Link::Member {
                node,
                computed: false,
                ..
            }) => {
                let Kind::Member { property, .. } = self.syntax_tree.kind(node) else {
                    return false;
                };
                is_factory(self.syntax_tree.name(property)) || has_computed
            }
            _ => false,
        }
    }
}
