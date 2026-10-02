import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h2><!></h2>`);

export default function H2($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h2 = root();

	$.attribute_effect(h2, ($0) => ({ class: $0, ...restProps }), [
		() => cn("mt-12 scroll-m-[70px] text-[27px] font-semibold tracking-[-0.01em] first:mt-0", $$props.class)
	]);

	var node = $.child(h2);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h2);
	$.append($$anchor, h2);
	$.pop();
}