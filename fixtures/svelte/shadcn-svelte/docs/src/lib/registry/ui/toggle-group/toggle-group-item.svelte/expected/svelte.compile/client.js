import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ToggleGroup as ToggleGroupPrimitive } from "bits-ui";
import { toggleVariants } from "$lib/registry/ui/toggle/index.js";
import { cn } from "$lib/utils.js";
import { getToggleGroupCtx } from "./toggle-group.svelte";

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
			"cn-toggle-group-item shrink-0 focus:z-10 focus-visible:z-10 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:border-l-0 group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0 group-data-horizontal/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-l group-data-vertical/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
			toggleVariants({
				variant: ctx.variant || $$props.variant,
				size: ctx.size || $$props.size
			}),
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