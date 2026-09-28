import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<ul><!></ul>`);

export default function Ul($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var ul = root();

	$.attribute_effect(ul, ($0) => ({ class: $0, ...restProps }), [() => cn("my-6 ms-6 list-disc", $$props.class)]);

	var node = $.child(ul);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(ul);
	$.append($$anchor, ul);
	$.pop();
}