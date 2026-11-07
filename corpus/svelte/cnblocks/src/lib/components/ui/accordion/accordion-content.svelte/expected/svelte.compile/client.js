import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion as AccordionPrimitive } from "bits-ui";
import { cn } from "$lib/utils.js";

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'children'
]);

var root = $.from_html(`<div class="pt-0 pb-4"><!></div>`);

export default function Accordion_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	{
		let $0 = $.derived(() => cn("overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down", $$props.class));

		$.component(node, () => AccordionPrimitive.Content, ($$anchor, AccordionPrimitive_Content) => {
			AccordionPrimitive_Content($$anchor, $.spread_props(
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

					children: ($$anchor, $$slotProps) => {
						var div = root();
						var node_1 = $.child(div);

						$.snippet(node_1, () => $$props.children ?? $.noop);
						$.reset(div);
						$.append($$anchor, div);
					},
					$$slots: { default: true }
				}
			));
		});
	}

	$.append($$anchor, fragment);
	$.pop();
}