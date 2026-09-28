import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<li><!></li>`);

export default function Li($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var li = root();

	$.attribute_effect(li, ($0) => ({ class: $0, ...restProps }), [() => cn("mt-2", $$props.class)]);

	var node = $.child(li);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(li);
	$.append($$anchor, li);
	$.pop();
}