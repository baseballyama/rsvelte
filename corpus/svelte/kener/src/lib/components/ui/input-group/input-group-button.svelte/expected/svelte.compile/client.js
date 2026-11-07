import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import { Button } from "$lib/components/ui/button/index.js";

const inputGroupButtonVariants = tv({
	base: "flex items-center gap-2 text-sm shadow-none",
	variants: {
		size: {
			xs: "h-6 gap-1 rounded-[calc(var(--radius)-5px)] px-2 has-[>svg]:px-2 [&>svg:not([class*='size-'])]:size-3.5",
			sm: "h-8 gap-1.5 rounded-md px-2.5 has-[>svg]:px-2.5",
			"icon-xs": "size-6 rounded-[calc(var(--radius)-5px)] p-0 has-[>svg]:p-0",
			"icon-sm": "size-8 p-0 has-[>svg]:p-0"
		}
	},
	defaultVariants: { size: "xs" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children',
	'type',
	'variant',
	'size'
]);

export default function Input_group_button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		type = $.prop($$props, 'type', 3, "button"),
		variant = $.prop($$props, 'variant', 3, "ghost"),
		size = $.prop($$props, 'size', 3, "xs"),
		restProps = $.rest_props($$props, rest_excludes);

	{
		let $0 = $.derived(() => cn(inputGroupButtonVariants({ size: size() }), $$props.class));

		Button($$anchor, $.spread_props(
			{
				get type() {
					return type();
				},

				get 'data-size'() {
					return size();
				},

				get variant() {
					return variant();
				},

				get class() {
					return $.get($0);
				}
			},
			() => restProps,
			{
				get ref() {
					return ref();
				},

				set ref($$value) {
					ref($$value);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = $.comment();
					var node = $.first_child(fragment_1);

					$.snippet(node, () => $$props.children ?? $.noop);
					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			}
		));
	}

	$.pop();
}