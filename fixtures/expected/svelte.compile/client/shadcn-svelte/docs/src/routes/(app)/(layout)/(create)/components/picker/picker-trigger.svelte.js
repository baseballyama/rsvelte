import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DropdownMenu as DropdownMenuPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'submenu',
	'children'
]);

export default function Picker_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		submenu = $.prop($$props, 'submenu', 3, false),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		var consequent = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_1 = $.first_child(fragment_1);

			{
				let $0 = $.derived(() => cn("flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-hidden select-none focus:bg-accent/95 focus:text-accent-foreground focus:ring-1 focus:ring-foreground/20 not-data-[variant=destructive]:focus:**:text-accent-foreground data-inset:pl-8 data-[state=open]:bg-accent/95 data-[state=open]:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", $$props.class));
				let $1 = $.derived(() => $$props.disabled ?? false);

				$.component(node_1, () => DropdownMenuPrimitive.SubTrigger, ($$anchor, DropdownMenuPrimitive_SubTrigger) => {
					DropdownMenuPrimitive_SubTrigger($$anchor, {
						'data-slot': 'dropdown-menu-sub-trigger',
						get class() {
							return $.get($0);
						},

						get disabled() {
							return $.get($1);
						},

						get ref() {
							return ref();
						},

						set ref($$value) {
							ref($$value);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_2 = $.comment();
							var node_2 = $.first_child(fragment_2);

							$.snippet(node_2, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_2);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_1);
		};

		var alternate = ($$anchor) => {
			var fragment_3 = $.comment();
			var node_3 = $.first_child(fragment_3);

			{
				let $0 = $.derived(() => cn("relative w-40 shrink-0 touch-manipulation rounded-xl p-3 ring-1 ring-foreground/10 select-none hover:bg-muted focus-visible:ring-foreground/50 focus-visible:outline-none disabled:opacity-50 data-[state=open]:bg-muted md:w-full md:rounded-lg md:px-2.5 md:py-2", $$props.class));

				$.component(node_3, () => DropdownMenuPrimitive.Trigger, ($$anchor, DropdownMenuPrimitive_Trigger) => {
					DropdownMenuPrimitive_Trigger($$anchor, {
						'data-slot': 'dropdown-menu-trigger',
						get class() {
							return $.get($0);
						},

						get disabled() {
							return $$props.disabled;
						},

						get ref() {
							return ref();
						},

						set ref($$value) {
							ref($$value);
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_4 = $.comment();
							var node_4 = $.first_child(fragment_4);

							$.snippet(node_4, () => $$props.children ?? $.noop);
							$.append($$anchor, fragment_4);
						},
						$$slots: { default: true }
					});
				});
			}

			$.append($$anchor, fragment_3);
		};

		$.if(node, ($$render) => {
			if (submenu()) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}