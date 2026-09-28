import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h4><!></h4>`);

export default function H4($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h4 = root();

	$.attribute_effect(h4, ($0) => ({ class: $0, ...restProps }), [
		() => cn("-mb-2 mt-8 scroll-m-20 text-lg font-bold tracking-tight", $$props.class)
	]);

	var node = $.child(h4);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h4);
	$.append($$anchor, h4);
	$.pop();
}