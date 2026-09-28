import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'children',
	'href'
]);

var root = $.from_html(`<a><!></a>`);

export default function A($$anchor, $$props) {
	$.push($$props, true);

	let restProps = $.rest_props($$props, rest_excludes);
	const internal = $.derived(() => $$props.href?.startsWith("/") || $$props.href?.startsWith("#"));
	const rel = $.derived(() => !$.get(internal) ? "noopener noreferrer" : undefined);
	const target = $.derived(() => !$.get(internal) ? "_blank" : undefined);
	var a = root();

	$.attribute_effect(
		a,
		($0) => ({
			href: $$props.href,
			target: $.get(target),
			rel: $.get(rel),
			class: $0,
			...restProps
		}),
		[
			() => cn("font-medium underline underline-offset-4", $$props.class)
		]
	);

	var node = $.child(a);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(a);
	$.append($$anchor, a);
	$.pop();
}