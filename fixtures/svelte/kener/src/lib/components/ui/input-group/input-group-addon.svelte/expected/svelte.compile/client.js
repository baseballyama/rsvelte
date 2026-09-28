import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";

export const inputGroupAddonVariants = tv({
	base: "text-muted-foreground flex h-auto cursor-text items-center justify-center gap-2 py-1.5 text-sm font-medium select-none group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4",
	variants: {
		align: {
			"inline-start": "order-first ps-3 has-[>button]:ms-[-0.45rem] has-[>kbd]:ms-[-0.35rem]",
			"inline-end": "order-last pe-3 has-[>button]:me-[-0.45rem] has-[>kbd]:me-[-0.35rem]",
			"block-start": "order-first w-full justify-start px-3 pt-3 group-has-[>input]/input-group:pt-2.5 [.border-b]:pb-3",
			"block-end": "order-last w-full justify-start px-3 pb-3 group-has-[>input]/input-group:pb-2.5 [.border-t]:pt-3"
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