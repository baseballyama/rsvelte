import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';

export const inputGroupAddonVariants = tv({
	base: "text-muted-foreground h-auto gap-2 py-1.5 text-sm font-medium group-data-[disabled=true]/input-group:opacity-50 [&>kbd]:rounded-[calc(var(--radius)-5px)] [&>svg:not([class*='size-'])]:size-4 flex cursor-text items-center justify-center select-none",
	variants: {
		align: {
			'inline-start': 'pl-2 has-[>button]:ml-[-0.3rem] has-[>kbd]:ml-[-0.15rem] order-first',
			'inline-end': 'pr-2 has-[>button]:mr-[-0.3rem] has-[>kbd]:mr-[-0.15rem] order-last',
			'block-start': 'px-2.5 pt-2 group-has-[>input]/input-group:pt-2 [.border-b]:pb-2 order-first w-full justify-start',
			'block-end': 'px-2.5 pb-2 group-has-[>input]/input-group:pb-2 [.border-t]:pt-2 order-last w-full justify-start'
		}
	},
	defaultVariants: { align: 'inline-start' }
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
		align = $.prop($$props, 'align', 3, 'inline-start'),
		restProps = $.rest_props($$props, rest_excludes);

	var div = root();

	var event_handler = (e) => {
		if (e.target.closest('button')) {
			return;
		}

		e.currentTarget.parentElement?.querySelector('input')?.focus();
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