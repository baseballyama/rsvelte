import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/core/utils';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'level',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Alert_title($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		level = $.prop($$props, 'level', 3, 5),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ 'aria-level': level(), class: $0, ...restProps }), [
		() => cn('mb-1 font-medium leading-none tracking-tight', $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}