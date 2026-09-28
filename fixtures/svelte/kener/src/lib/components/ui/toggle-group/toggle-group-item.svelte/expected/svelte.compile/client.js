import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
import { getToggleGroupCtx } from "./toggle-group.svelte";
import { cn } from "$lib/utils.js";
import { toggleVariants } from "$lib/components/ui/toggle/index.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'value',
	'class',
	'size',
	'variant'
]);

export default function Toggle_group_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	const ctx = getToggleGroupCtx();
	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => ctx.variant || $$props.variant);
		let $1 = $.derived(() => ctx.size || $$props.size);

		let $2 = $.derived(() => cn(
			toggleVariants({
				variant: ctx.variant || $$props.variant,
				size: ctx.size || $$props.size
			}),
			"w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10 data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
			$$props.class
		));

		$.component(node, () => ToggleGroupPrimitive.Item, ($$anchor, ToggleGroupPrimitive_Item) => {
			ToggleGroupPrimitive_Item($$anchor, $.spread_props(
				{
					'data-slot': 'toggle-group-item',
					get 'data-variant'() {
						return $.get($0);
					},

					get 'data-size'() {
						return $.get($1);
					},

					get 'data-spacing'() {
						return ctx.spacing;
					},

					get class() {
						return $.get($2);
					},

					get value() {
						return $$props.value;
					}
				},
				() => restProps,
				{
					get ref() {
						return ref();
					},

					set ref($$value) {
						ref($$value);
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}