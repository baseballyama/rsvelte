import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h6><!></h6>`);

export default function H6($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h6 = root();

	$.attribute_effect(h6, ($0) => ({ class: $0, ...restProps }), [
		() => cn("mt-8 scroll-m-20 text-base font-semibold tracking-tight", $$props.class)
	]);

	var node = $.child(h6);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h6);
	$.append($$anchor, h6);
	$.pop();
}