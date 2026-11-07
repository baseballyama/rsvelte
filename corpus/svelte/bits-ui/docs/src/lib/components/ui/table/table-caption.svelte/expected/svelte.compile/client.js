import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'class', 'children']);
var root = $.from_html(`<caption><!></caption>`);

export default function Table_caption($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	var caption = root();

	$.attribute_effect(caption, ($0) => ({ class: $0, ...restProps }), [
		() => cn("text-muted-foreground mt-4 text-sm", $$props.class)
	]);

	var node = $.child(caption);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(caption);
	$.append($$anchor, caption);
	$.pop();
}