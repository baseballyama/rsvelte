import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<strong><!></strong>`);

export default function Strong($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var strong = root();

	$.attribute_effect(strong, ($0) => ({ class: $0, ...restProps }), [() => cn("font-semibold", $$props.class)]);

	var node = $.child(strong);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(strong);
	$.append($$anchor, strong);
	$.pop();
}