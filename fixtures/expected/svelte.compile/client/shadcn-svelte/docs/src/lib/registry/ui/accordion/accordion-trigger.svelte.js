import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Accordion as AccordionPrimitive } from "bits-ui";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { cn } from "$lib/utils.js";

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
					let $0 = $.derived(() => cn("cn-accordion-trigger group/accordion-trigger relative flex flex-1 items-start justify-between border border-transparent transition-all outline-none disabled:pointer-events-none disabled:opacity-50", $$props.class));

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

									IconPlaceholder(node_3, {
										lucide: 'ChevronDownIcon',
										tabler: 'IconChevronDown',
										'data-slot': 'accordion-trigger-icon',
										hugeicons: 'ArrowDown01Icon',
										phosphor: 'CaretDownIcon',
										remixicon: 'RiArrowDownSLine',
										class: 'cn-accordion-trigger-icon pointer-events-none shrink-0 group-aria-expanded/accordion-trigger:hidden'
									});

									var node_4 = $.sibling(node_3, 2);

									IconPlaceholder(node_4, {
										lucide: 'ChevronUpIcon',
										tabler: 'IconChevronUp',
										'data-slot': 'accordion-trigger-icon',
										hugeicons: 'ArrowUp01Icon',
										phosphor: 'CaretUpIcon',
										remixicon: 'RiArrowUpSLine',
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