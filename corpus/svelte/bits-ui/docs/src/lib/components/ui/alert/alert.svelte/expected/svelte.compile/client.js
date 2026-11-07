import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { alertVariants } from "./index.js";
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'variant',
	'class',
	'children'
]);

var root = $.from_html(`<div><!></div>`);

export default function Alert($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, "note"),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	$.attribute_effect(div, ($0) => ({ class: $0, ...restProps, role: 'alert' }), [
		() => cn(alertVariants({ variant: variant() }), $$props.class)
	]);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}