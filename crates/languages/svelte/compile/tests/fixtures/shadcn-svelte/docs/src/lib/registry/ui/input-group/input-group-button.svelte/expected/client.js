import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { Button } from "$lib/registry/ui/button/index.js";
import { cn } from "$lib/utils.js";

const inputGroupButtonVariants = tv({
	base: "cn-input-group-button flex items-center shadow-none",
	variants: {
		size: {
			xs: "cn-input-group-button-size-xs",
			sm: "cn-input-group-button-size-sm",
			"icon-xs": "cn-input-group-button-size-icon-xs",
			"icon-sm": "cn-input-group-button-size-icon-sm"
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