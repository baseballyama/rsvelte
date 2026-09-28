import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion as AccordionPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy', 'ref', 'class']);

export default function Accordion_item($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("border-b last:border-b-0", $$props.class));

		$.component(node, () => AccordionPrimitive.Item, ($$anchor, AccordionPrimitive_Item) => {
			AccordionPrimitive_Item($$anchor, $.spread_props(
				{
					'data-slot': 'accordion-item',
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