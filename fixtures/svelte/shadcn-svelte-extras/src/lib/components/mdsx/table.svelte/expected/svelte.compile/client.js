import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<div class="no-scrollbar my-6 w-full overflow-y-auto"><table><!></table></div>`);

export default function Table($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var div = root();
	var table = $.child(div);

	$.attribute_effect(table, ($0) => ({ class: $0, ...restProps }), [() => cn('w-full', $$props.class)]);

	var node = $.child(table);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(table);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}