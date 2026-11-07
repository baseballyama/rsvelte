import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<nav><!></nav>`);

export default function Breadcrumb($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var nav = root();

	$.attribute_effect(nav, () => ({
		'data-slot': 'breadcrumb',
		class: $$props.class,
		'aria-label': 'breadcrumb',
		...restProps
	}));

	var node = $.child(nav);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(nav);
	$.bind_this(nav, ($$value) => ref($$value), () => ref());
	$.append($$anchor, nav);
	$.pop();
}