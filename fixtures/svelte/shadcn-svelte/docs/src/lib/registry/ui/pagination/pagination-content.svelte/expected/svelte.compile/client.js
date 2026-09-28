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

var root = $.from_html(`<ul><!></ul>`);

export default function Pagination_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var ul = root();

	$.attribute_effect(ul, ($0) => ({ 'data-slot': 'pagination-content', class: $0, ...restProps }), [
		() => cn("cn-pagination-content flex items-center", $$props.class)
	]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ul);
	$.bind_this(ul, ($$value) => ref($$value), () => ref());
	$.append($$anchor, ul);
	$.pop();
}