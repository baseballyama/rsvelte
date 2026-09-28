import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<p><!></p>`);

export default function Page_header_description($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var p = root();

	$.attribute_effect(p, ($0) => ({ class: $0, ...restProps }), [
		() => cn("max-w-3xl text-base text-balance text-foreground sm:text-lg", $$props.class)
	]);

	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.append($$anchor, p);
	$.pop();
}