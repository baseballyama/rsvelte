import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const inputGroupAddonVariants = tv({
	base: "cn-input-group-addon flex cursor-text items-center justify-center select-none",
	variants: {
		align: {
			"inline-start": "cn-input-group-addon-align-inline-start order-first",
			"inline-end": "cn-input-group-addon-align-inline-end order-last",
			"block-start": "cn-input-group-addon-align-block-start order-first w-full justify-start",
			"block-end": "cn-input-group-addon-align-block-end order-last w-full justify-start"
		}
	},
	defaultVariants: { align: "inline-start" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'align'
]);

var root = $.from_html(`<div><!></div>`);

export default function Input_group_addon($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		align = $.prop($$props, 'align', 3, "inline-start"),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	var event_handler = (e) => {
		if (e.target.closest("button")) {
			return;
		}

		e.currentTarget.parentElement?.querySelector("input")?.focus();
	};

	$.attribute_effect(
		div,
		($0) => ({
			role: 'group',
			'data-slot': 'input-group-addon',
			'data-align': align(),
			class: $0,
			onclick: event_handler,
			...restProps
		}),
		[
			() => cn(inputGroupAddonVariants({ align: align() }), $$props.class)
		]
	);

	var node = $.child(div);

	$.snippet(node, () => $$props.children ?? $.noop);
	$.reset(div);
	$.bind_this(div, ($$value) => ref($$value), () => ref());
	$.append($$anchor, div);
	$.pop();
}