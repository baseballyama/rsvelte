---
'@rsvelte/compiler': patch
---

Keep a comment left behind when TypeScript erasure removes a type annotation. The
re-emission was gated on a conjunction whose two terms each silenced a host on
their own — an inline annotation, and a single-line removed region. It is
replaced by the rule upstream's printer follows: an annotation on a declarator
with an initializer keeps the comment, and one on a declarator without an
initializer does not, because there the comment belongs to whatever follows the
declaration rather than to the declaration.
