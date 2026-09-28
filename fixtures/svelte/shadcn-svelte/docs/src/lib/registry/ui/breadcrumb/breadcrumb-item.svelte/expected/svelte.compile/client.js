import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<li><!></li>`);

export default function Breadcrumb_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var li = root();

	$.attribute_effect(li, ($0) => ({ 'data-slot': 'breadcrumb-item', class: $0, ...restProps }), [
		() => cn("cn-breadcrumb-item inline-flex items-center", $$props.class)
	]);

	var node = $.child(li);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(li);
	$.bind_this(li, ($$value) => ref($$value), () => ref());
	$.append($$anchor, li);
	$.pop();
}