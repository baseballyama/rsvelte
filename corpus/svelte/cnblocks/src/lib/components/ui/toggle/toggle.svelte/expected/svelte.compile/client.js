import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { Toggle as TogglePrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export const toggleVariants = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "bg-transparent",
			outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground"
		},
		size: {
			default: "h-9 min-w-9 px-3",
			sm: "h-8 min-w-8 px-2",
			lg: "h-10 min-w-10 px-3"
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