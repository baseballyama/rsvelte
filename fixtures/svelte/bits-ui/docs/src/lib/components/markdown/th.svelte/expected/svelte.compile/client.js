import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<th><!></th>`);

export default function Th($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var th = root();

	$.attribute_effect(th, ($0) => ({ class: $0, ...restProps }), [
		() => cn("border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right", $$props.class)
	]);

	var node = $.child(th);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(th);
	$.append($$anchor, th);
	$.pop();
}