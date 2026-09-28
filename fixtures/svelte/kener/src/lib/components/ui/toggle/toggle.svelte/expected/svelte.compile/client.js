import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { Toggle as TogglePrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

export const toggleVariants = tv({
	base: "hover:bg-muted hover:text-muted-foreground data-[state=on]:bg-accent data-[state=on]:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
	variants: {
		variant: {
			default: "bg-transparent",
			outline: "border-input hover:bg-accent hover:text-accent-foreground border bg-transparent shadow-xs"
		},
		size: {
			default: "h-9 min-w-9 px-2",
			sm: "h-8 min-w-8 px-1.5",
			lg: "h-10 min-w-10 px-2.5"
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