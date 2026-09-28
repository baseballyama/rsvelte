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
		let $0 = $.derived(() => cn(
			toggleVariants({
				variant: ctx.variant || $$props.variant,
				size: ctx.size || $$props.size
			}),
			$$props.class
		));

		$.component(node, () => ToggleGroupPrimitive.Item, ($$anchor, ToggleGroupPrimitive_Item) => {
			ToggleGroupPrimitive_Item($$anchor, $.spread_props(
				{
					get class() {
						return $.get($0);
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