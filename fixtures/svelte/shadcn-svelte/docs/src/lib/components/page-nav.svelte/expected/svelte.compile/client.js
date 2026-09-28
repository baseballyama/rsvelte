import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<div><div class="container flex items-center justify-between gap-4 py-4"><!></div></div>`);

export default function Page_nav($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps }), [() => cn("container-wrapper scroll-mt-24", $$props.class)]);

	var div_1 = $.child(div);
	var node = $.child(div_1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}