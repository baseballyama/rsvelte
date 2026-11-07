import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<h3><!></h3>`);

export default function Timeline_title($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var h3 = root();

	$.attribute_effect(h3, ($0) => ({ 'data-slot': 'timeline-title', class: $0, ...restProps }), [() => cn('text-sm font-medium', $$props.class)]);

	var node = $.child(h3);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h3);
	$.bind_this(h3, ($$value) => ref($$value), () => ref());
	$.append($$anchor, h3);
	$.pop();
}