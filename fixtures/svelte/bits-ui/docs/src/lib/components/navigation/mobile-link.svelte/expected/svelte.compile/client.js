import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils/styles.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'onClose',
	'href',
	'children',
	'class'
]);

var root = $.from_html(`<a><!></a>`);

export default function Mobile_link($$anchor, $$props) {
	$.push($$props, true);

	let href = $.prop($$props, 'href', 3, "#"),
		restProps = $.rest_props($$props, rest_excludes);

	var a = root();

	$.attribute_effect(
		a,
		($0) => ({
			href: href(),
			onclick: $$props.onClose,
			class: $0,
			...restProps
		}),
		[() => cn($$props.class)]
	);

	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}