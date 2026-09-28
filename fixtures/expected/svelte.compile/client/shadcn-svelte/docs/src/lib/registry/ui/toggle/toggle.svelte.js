import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { Toggle as TogglePrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export const toggleVariants = tv({
	base: "cn-toggle group/toggle inline-flex items-center justify-center whitespace-nowrap outline-none hover:bg-muted focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "cn-toggle-variant-default",
			outline: "cn-toggle-variant-outline"
		},
		size: {
			default: "cn-toggle-size-default",
			sm: "cn-toggle-size-sm",
			lg: "cn-toggle-size-lg"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'pressed',
	'class',
	'size',
	'variant'
]);

export default function Toggle($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		pressed = $.prop($$props, 'pressed', 15, false),
		size = $.prop($$props, 'size', 3, "default"),
		variant = $.prop($$props, 'variant', 3, "default"),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(toggleVariants({ variant: variant(), size: size() }), $$props.class));

		$.component(node, () => TogglePrimitive.Root, ($$anchor, TogglePrimitive_Root) => {
			TogglePrimitive_Root($$anchor, $.spread_props(
				{
					'data-slot': 'toggle',
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

					get pressed() {
						return pressed();
					},

					set pressed($$value) {
						pressed($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}