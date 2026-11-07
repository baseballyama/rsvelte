import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Popover as PopoverPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Popover_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("", $$props.class));

		$.component(node, () => PopoverPrimitive.Trigger, ($$anchor, PopoverPrimitive_Trigger) => {
			PopoverPrimitive_Trigger($$anchor, $.spread_props(
				{
					'data-slot': 'popover-trigger',
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