import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion as AccordionPrimitive } from 'bits-ui';
import { cn } from '$lib/utils.js';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import ChevronUpIcon from '@lucide/svelte/icons/chevron-up';

var rest_excludes = new Set([
	'$$slots',
	'$$events',
	'$$legacy',
	'ref',
	'class',
	'level',
	'children'
]);

var root = $.from_html(`<!> <!> <!>`, 1);

export default function Accordion_trigger($$anchor, $$props) {
	$.push($$props, true);

	let ref = $.prop($$props, 'ref', 15, null),
		level = $.prop($$props, 'level', 3, 3),
		restProps = $.rest_props($$props, rest_excludes);

	var fragment = $.comment();
	var node = $.first_child(fragment);

	$.component(node, () => AccordionPrimitive.Header, ($$anchor, AccordionPrimitive_Header) => {
		AccordionPrimitive_Header($$anchor, {
			get level() {
				return level();
			},
			class: 'flex',
			children: ($$anchor, $$slotProps) => {
				var fragment_1 = $.comment();
				var node_1 = $.first_child(fragment_1);

				{
					let $0 = $.derived(() => cn('focus-visible:ring-ring/50 focus-visible:border-ring focus-visible:after:border-ring **:data-[slot=accordion-trigger-icon]:text-muted-foreground group/accordion-trigger relative flex flex-1 items-start justify-between rounded-md border border-transparent py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-3 disabled:pointer-events-none disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4', $$props.class));

					$.component(node_1, () => AccordionPrimitive.Trigger, ($$anchor, AccordionPrimitive_Trigger) => {
						AccordionPrimitive_Trigger($$anchor, $.spread_props(
							{
								'data-slot': 'accordion-trigger',
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
									var fragment_2 = root();
									var node_2 = $.first_child(fragment_2);

									$.snippet(node_2, () => $$props.children ?? $.noop);

									var node_3 = $.sibling(node_2, 2);

									ChevronDownIcon(node_3, {
										'data-slot': 'accordion-trigger-icon',
										class: 'cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden'
									});

									var node_4 = $.sibling(node_3, 2);

									ChevronUpIcon(node_4, {
										'data-slot': 'accordion-trigger-icon',
										class: 'cn-accordion-trigger-icon pointer-events-none hidden shrink-0 group-aria-expanded/accordion-trigger:inline'
									});

									$.append($$anchor, fragment_2);
								},
								$$slots: { default: true }
							}
						));
					});
				}

				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	});

	$.append($$anchor, fragment);
	$.pop();
}