import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { cn } from '$lib/utils.js';
import { Accordion as AccordionPrimitive } from 'bits-ui';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'children',
	'class',
	'ref'
]);

var root = $.from_html(`<div><!></div>`);

export default function Accordion_content($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AccordionPrimitive.Content, ($$anchor, AccordionPrimitive_Content) => {
		AccordionPrimitive_Content($$anchor, $.spread_props(
			{
				'data-slot': 'accordion-content',
				class: 'data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm'
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
					$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn('pt-0 pb-4', $$props.class))]);
					$.append($$anchor, div);
				},
				$$slots: { default: true }
			}
		));
	});

	$.append($$anchor, fragment);
	$.pop();
}