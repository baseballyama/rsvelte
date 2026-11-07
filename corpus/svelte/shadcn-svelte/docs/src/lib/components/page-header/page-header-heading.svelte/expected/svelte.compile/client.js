import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<h1><!></h1>`);

export default function Page_header_heading($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var h1 = root();

	$.attribute_effect(h1, ($0) => ({ class: $0, ...restProps }), [
		() => cn("leading-tighter max-w-2xl text-4xl font-semibold tracking-tight text-balance text-primary lg:leading-[1.1] lg:font-semibold xl:text-5xl xl:tracking-tighter", $$props.class)
	]);

	var node = $.child(h1);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(h1);
	$.append($$anchor, h1);
	$.pop();
}