import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { fieldSetVariants } from '.';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'variant',
	'children',
	'class'
]);

var root = $.from_html(`<div><!></div>`);

export default function Field_set($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, 'default'),
		rest = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...rest }), [
		() => cn(fieldSetVariants({ variant: variant() }), $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}