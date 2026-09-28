import 'svelte/internal/disclose-version';
import { buttonVariants } from '$lib/components/ui/button.svelte';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'isActive',
	'ref',
	'size'
]);

var root = $.from_html(`<a><!></a>`);

export default function Pagination_link($$anchor, $$props) {
	$.push($$props, true);

	let isActive = $.prop($$props, 'isActive', 3, false),
		ref = $.prop($$props, 'ref', 11, null),
		size = $.prop($$props, 'size', 3, 'icon'),
		restProps = $.rest_props($$props, rest_excludes);

	var a = root();

	$.attribute_effect(
		a,
		($0) => ({
			'aria-current': isActive() ? 'page' : undefined,
			class: $0,
			...restProps
		}),
		[
			() => cn(buttonVariants({ size: size(), variant: isActive() ? 'outline' : 'ghost' }), $$props.class)
		]
	);

	var node = $.child(a);

	$.snippet(node, () => $$props.children);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}