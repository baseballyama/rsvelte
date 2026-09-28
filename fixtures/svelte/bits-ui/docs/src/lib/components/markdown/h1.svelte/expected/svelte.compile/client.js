import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h1><!></h1>`);

export default function H1($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h1 = root();

	$.attribute_effect(h1, ($0) => ({ class: $0, ...restProps }), [
		() => cn("mt-2 scroll-m-20 text-4xl font-bold", $$props.class)
	]);

	var node = $.child(h1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h1);
	$.append($$anchor, h1);
	$.pop();
}