import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<p><!></p>`);

export default function P($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var p = root();

	$.attribute_effect(p, ($0) => ({ class: $0, ...restProps }), [() => cn("not-first:mt-6 leading-7", $$props.class)]);

	var node = $.child(p);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(p);
	$.append($$anchor, p);
	$.pop();
}