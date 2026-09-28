import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<thead><!></thead>`);

export default function Table_header($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var thead = root();

	$.attribute_effect(thead, ($0) => ({ class: $0, ...restProps }), [() => cn("[&_tr]:border-b", $$props.class)]);

	var node = $.child(thead);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(thead);
	$.append($$anchor, thead);
	$.pop();
}