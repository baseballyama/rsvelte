import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'variant',
	'children'
]);

var root = $.from_html(`<legend><!></legend>`);

export default function Field_legend($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "legend"),
		restProps = $.rest_props($$props, rest_excludes);

	var legend = root();

	$.attribute_effect(
		legend,
		($0) => ({
			'data-slot': 'field-legend',
			'data-variant': variant(),
			class: $0,
			...restProps
		}),
		[() => cn("cn-field-legend", $$props.class)]
	);

	var node = $.child(legend);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(legend);
	$.bind_this(legend, ($$value) => ref($$value), () => ref());
	$.append($$anchor, legend);
	$.pop();
}