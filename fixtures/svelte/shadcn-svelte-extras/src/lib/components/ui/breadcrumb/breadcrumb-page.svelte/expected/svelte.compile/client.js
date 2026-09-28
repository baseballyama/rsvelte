import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<span><!></span>`);

export default function Breadcrumb_page($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var span = root();

	$.attribute_effect(
		span,
		($0) => ({
			'data-slot': 'breadcrumb-page',
			role: 'link',
			'aria-disabled': 'true',
			'aria-current': 'page',
			class: $0,
			...restProps
		}),
		[() => cn('text-foreground font-normal', $$props.class)]
	);

	var node = $.child(span);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(span);
	$.bind_this(span, ($$value) => ref($$value), () => ref());
	$.append($$anchor, span);
	$.pop();
}