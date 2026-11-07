import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { buttonVariants } from "./index.js";
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'variant',
	'size',
	'children'
]);

var root = $.from_html(`<button><!></button>`);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let variant = $.prop($$props, 'variant', 3, "default"),
		size = $.prop($$props, 'size', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var button = root();

	$.attribute_effect(button, ($0) => ({ class: $0, ...restProps }), [
		() => cn(buttonVariants({ variant: variant(), size: size() }), $$props.class)
	]);

	var node = $.child(button);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(button);
	$.append($$anchor, button);
	$.pop();
}