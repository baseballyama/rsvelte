import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'children', 'class']);
var root = $.from_html(`<thead><!></thead>`);

export default function Thead($$anchor, $$props) {
	$.push($$props, true);

	const className = $.prop($$props, 'class', 3, ""),
		restProps = $.rest_props($$props, rest_excludes);

	var thead = root();

	$.attribute_effect(thead, ($0) => ({ ...restProps, class: $0 }), [
		() => cn("bg-card-muted/60 border-b border-border", className())
	]);

	var node = $.child(thead);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(thead);
	$.append($$anchor, thead);
	$.pop();
}