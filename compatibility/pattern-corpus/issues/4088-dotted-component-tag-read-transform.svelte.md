# `4088-dotted-component-tag-read-transform.svelte`

**Issue:** [#4088](https://github.com/baseballyama/rsvelte/issues/4088)

A dotted component tag name (`<rest.Sub />`) whose root is a rest-prop binding. Upstream lowers a tag name with `context.visit(b.member_id(name))` — it visits the WHOLE member expression — and the rest-prop read rule lives in `Identifier.js` keyed on the parent, so a root transformed on its own never meets it and the tag kept `rest.Sub` where official emits `$$props.Sub`. `{rest.Sub}` in the same file was already correct, because the template path walks a member expression it parsed: one upstream rule, two ports, and only one of them had a parent. `<rest.keep />` is the control that separates the rule from a blanket rewrite — `keep` is destructured out, so it sits in `exclude_props` and must stay `rest.keep`. A `$state` object, a nested one and a plain `const` reach the same builder and do not move; the server never applies the rule.
