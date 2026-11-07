import 'svelte/internal/disclose-version';
import { tv } from 'tailwind-variants';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Toggle as TogglePrimitive } from 'bits-ui';

export const toggleVariants = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-[color,box-shadow] hover:bg-muted hover:text-muted-foreground disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-accent data-[state=on]:text-accent-foreground [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 [&_svg]:shrink-0 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
	defaultVariants: { size: 'default', variant: 'default' },
	variants: {
		size: { default: 'h-9 px-3', lg: 'h-10 px-3', sm: 'h-8 px-2' },
		variant: {
			default: 'bg-transparent',
			outline: 'border border-input bg-transparent shadow-xs hover:bg-accent hover:text-accent-foreground'
		}
	}
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'pressed',
	'ref',
	'size',
	'variant'
]);

export default function Toggle($$anchor, $$props) {
	$.push($$props, true);

	let pressed = $.prop($$props, 'pressed', 15, false),
		ref = $.prop($$props, 'ref', 15, null),
		size = $.prop($$props, 'size', 3, 'default'),
		variant = $.prop($$props, 'variant', 3, 'default'),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn(toggleVariants({ className: $$props.class, size: size(), variant: variant() })));

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