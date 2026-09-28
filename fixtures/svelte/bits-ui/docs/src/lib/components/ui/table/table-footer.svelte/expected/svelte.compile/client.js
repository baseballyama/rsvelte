import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<tfoot><!></tfoot>`);

export default function Table_footer($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var tfoot = root();

	$.attribute_effect(tfoot, ($0) => ({ class: $0, ...restProps }), [
		() => cn("bg-primary text-primary-foreground font-medium", $$props.class)
	]);

	var node = $.child(tfoot);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(tfoot);
	$.append($$anchor, tfoot);
	$.pop();
}