import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<strong><!></strong>`);

export default function Strong($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var strong = root();

	$.attribute_effect(strong, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("text-base font-medium text-foreground", className())
	]);

	var node = $.child(strong);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(strong);
	$.append($$anchor, strong);
	$.pop();
}