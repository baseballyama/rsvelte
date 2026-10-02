import 'svelte/internal/disclose-version';
import { tv } from "tailwind-variants";
import * as $ from 'svelte/internal/client';
import { cn } from "$lib/utils.js";
import LoaderCircleIcon from "@lucide/svelte/icons/loader-circle";

export const buttonVariants = tv({
	base: "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
	variants: {
		variant: {
			default: "border border-primary bg-radial-[at_52%_-52%] from-primary/70 to-primary/95 text-sm text-primary-foreground shadow-md ring-0 inset-shadow-2xs shadow-zinc-950/30 inset-shadow-white/25 transition-[filter] duration-200 **:[text-shadow:0_1px_0_var(--color-primary)] active:brightness-95 dark:border-0 dark:from-primary dark:to-primary/70 dark:inset-shadow-white dark:hover:to-primary",
			destructive: "text-destructive-foreground bg-destructive shadow-xs hover:bg-destructive/90",
			outline: "border border-zinc-300 bg-linear-to-t from-muted to-background shadow-xs shadow-zinc-950/10 duration-200 hover:to-muted dark:border-border dark:from-muted/50 dark:hover:to-muted/50",
			secondary: "bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			link: "text-primary underline-offset-4 hover:underline",
			neutral: "bg-foreground text-background hover:brightness-95",
			mdefault: "bg-primary text-primary-foreground hover:brightness-95"
		},
		size: {
			default: "h-9 px-4 py-2",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-10 rounded-md px-8",
			extralg: "h-10 rounded-md px-8 md:h-12",
			icon: "h-9 w-9"
		}
	},
	defaultVariants: { variant: "default", size: "default" }
});

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'variant',
	'size',
	'href',
	'type',
	'loading',
	'disabled',
	'tabindex',
	'onclick',
	'onClickPromise',
	'class',
	'data-slot',
	'children'
]);

var root = $.from_html(`<div class="flex animate-spin place-items-center justify-center"><!></div> <span class="sr-only">Loading</span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Button($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		variant = $.prop($$props, 'variant', 3, "default"),
		size = $.prop($$props, 'size', 3, "default"),
		href = $.prop($$props, 'href', 3, undefined),
		type = $.prop($$props, 'type', 3, "button"),
		loading = $.prop($$props, 'loading', 7, false),
		disabled = $.prop($$props, 'disabled', 3, false),
		tabindex = $.prop($$props, 'tabindex', 3, 0),
		dataSlot = $.prop($$props, 'data-slot', 3, "button"),
		rest = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.element(node, () => href() ? "a" : "button", false, ($$element, $$anchor) => {
		$.bind_this($$element, ($$value) => ref($$value), () => ref());

		var event_handler = async (e) => {
			$$props.onclick?.(e);

			if (type() === undefined) return;

			if ($$props.onClickPromise) {
				loading(true);
				await $$props.onClickPromise(e);
				loading(false);
			}
		};

		$.attribute_effect(
			$$element,
			($0) => ({
				...rest,
				'data-slot': dataSlot(),
				type: href() ? undefined : type(),
				href: href() && !disabled() ? href() : undefined,
				disabled: href() ? undefined : disabled() || loading(),
				'aria-disabled': href() ? disabled() : undefined,
				role: href() && disabled() ? "link" : undefined,
				tabindex: href() && disabled() ? -1 : tabindex(),
				class: $0,
				onclick: event_handler
			}),
			[
				() => cn(buttonVariants({ variant: variant(), size: size() }), $$props.class)
			]
		);

		var fragment_1 = root_1();
		var node_1 = $.first_child(fragment_1);

		{
			var consequent = ($$anchor) => {
				var fragment_2 = root();
				var div = $.first_child(fragment_2);
				var node_2 = $.child(div);

				LoaderCircleIcon(node_2, { class: 'size-4' });
				$.reset(div);
				$.next(2);
				$.append($$anchor, fragment_2);
			};

			$.if(node_1, ($$render) => {
				if (type() !== undefined && loading()) $$render(consequent);
			});
		}

		var node_3 = $.sibling(node_1, 2);

		$.snippet(node_3, () => $$props.children ?? $.noop);
		$.append($$anchor, fragment_1);
	});

	$.append($$anchor, fragment);
	$.pop();
}