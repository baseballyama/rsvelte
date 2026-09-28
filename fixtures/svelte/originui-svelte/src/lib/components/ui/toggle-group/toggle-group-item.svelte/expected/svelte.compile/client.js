import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { getToggleGroupCtx } from '$lib/components/ui/toggle-group/toggle-group.svelte';
import { toggleVariants } from '$lib/components/ui/toggle.svelte';
import { cn } from '$lib/utils.js';
import { ToggleGroup as ToggleGroupPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'class',
	'ref',
	'size',
	'value',
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
		let $0 = $.derived(() => cn(
			toggleVariants({
				size: ctx.size || $$props.size,
				variant: ctx.variant || $$props.variant
			}),
			'min-w-0 shrink-0 rounded-none shadow-none first:rounded-l-md last:rounded-r-md focus:z-10 focus-visible:z-10 data-[variant=outline]:border-l-0 data-[variant=outline]:first:border-l',
			$$props.class
		));

		$.component(node, () => ToggleGroupPrimitive.Item, ($$anchor, ToggleGroupPrimitive_Item) => {
			ToggleGroupPrimitive_Item($$anchor, $.spread_props(
				{
					get value() {
						return $$props.value;
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
					}
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}