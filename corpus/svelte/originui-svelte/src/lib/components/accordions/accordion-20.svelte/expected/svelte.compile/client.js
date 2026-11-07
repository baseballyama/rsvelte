import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from '$lib/components/ui/accordion/index.js';
import AtSign from '@lucide/svelte/icons/at-sign';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import CircleDashed from '@lucide/svelte/icons/circle-dashed';
import Command from '@lucide/svelte/icons/command';
import Eclipse from '@lucide/svelte/icons/eclipse';
import Gauge from '@lucide/svelte/icons/gauge';
import Plus from '@lucide/svelte/icons/plus';
import Zap from '@lucide/svelte/icons/zap';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';
import { Accordion as AccordionPrimitive } from 'bits-ui';

const CollapsibleDemo = ($$anchor, $$arg0) => {
	let content = () => ($$arg0?.()).content;
	let Icon = () => ($$arg0?.()).Icon;
	let open = () => ($$arg0?.()).open;
	let title = () => ($$arg0?.()).title;

	Collapsible($$anchor, {
		class: 'border-border space-y-1 border-t py-3 ps-6 pe-4',
		get open() {
			return open();
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			CollapsibleTrigger(node, {
				class: 'flex gap-2 text-[15px] leading-6 font-semibold [&[data-state=open]>svg]:rotate-180',
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					ChevronDown(node_1, {
						size: 16,
						class: 'mt-1 shrink-0 opacity-60 transition-transform duration-200',
						'aria-hidden': 'true'
					});

					var span = $.sibling(node_1, 2);
					var node_2 = $.child(span);

					$.component(node_2, Icon, ($$anchor, Icon_1) => {
						Icon_1($$anchor, {
							size: 16,
							className: 'shrink-0 opacity-60',
							'aria-hidden': 'true'
						});
					});

					var span_1 = $.sibling(node_2, 2);
					var text = $.only_child(span_1, true);

					$.reset(span);
					$.template_effect(() => $.set_text(text, title()));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node, 2);

			CollapsibleContent(node_3, {
				class: 'text-muted-foreground data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden ps-6 text-sm transition-all',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text();

					$.template_effect(() => $.set_text(text_1, content()));
					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

var root = $.from_html(`<!> <span class="flex items-center gap-3"><!> <span> </span></span>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(` <!>`, 1);
var root_3 = $.from_html(`<div class="space-y-4"><h2 class="text-xl font-bold">Table w/ left plus-minus</h2> <!></div>`);

export default function Accordion_20($$anchor) {
	const items = [
		{
			collapsibles: [
				{
					content: 'We optimize every component for maximum performance and minimal bundle size.',
					icon: Gauge,
					title: 'What about performance?'
				},

				{
					content: 'Our documentation is comprehensive and includes live examples for every component.',
					icon: CircleDashed,
					title: 'How is the documentation?'
				}
			],
			icon: Command,
			id: '1',
			title: 'What makes Origin UI - Svelte different?'
		},

		{
			collapsibles: [
				{
					content: 'Yes, our theming system is fully customizable and supports both light and dark modes.',
					icon: Gauge,
					title: 'Can I use custom themes?'
				},

				{
					content: 'We have first-class support for Tailwind CSS with custom utility classes.',
					icon: CircleDashed,
					title: 'What about Tailwind support?'
				}
			],
			icon: Eclipse,
			id: '2',
			title: 'How can I customize the components?'
		},

		{
			collapsibles: [
				{
					content: 'Our components are tree-shakeable and typically add minimal overhead to your bundle.',
					icon: Gauge,
					open: true,
					title: "What's the bundle size impact?"
				},

				{
					content: 'We support automatic code splitting for optimal loading performance.',
					icon: CircleDashed,
					title: 'How is code splitting handled?'
				}
			],
			icon: Zap,
			id: '3',
			title: 'Is Origin UI - Svelte optimized for performance?'
		},

		{
			collapsibles: [
				{
					content: 'We test with NVDA, VoiceOver, and JAWS to ensure broad compatibility.',
					icon: Gauge,
					title: 'Which screen readers are supported?'
				},

				{
					content: 'Full keyboard navigation support is implemented following WAI-ARIA best practices.',
					icon: CircleDashed,
					title: 'What about keyboard navigation?'
				}
			],
			icon: AtSign,
			id: '4',
			title: 'How accessible are the components?'
		}
	];

	var div = root_3();
	var node_4 = $.sibling($.child(div), 2);

	$.component(node_4, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			class: 'w-full -space-y-px',
			value: '3',
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_5 = $.first_child(fragment_4);

				$.each(node_5, 17, () => items, (item) => item.id, ($$anchor, item) => {
					var fragment_5 = $.comment();
					var node_6 = $.first_child(fragment_5);

					$.component(node_6, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return $.get(item).id;
							},
							class: 'bg-background border px-4 py-1 first:rounded-t-lg last:rounded-b-lg',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_7 = $.first_child(fragment_6);

								$.component(node_7, () => AccordionPrimitive.Trigger, ($$anchor, AccordionPrimitive_Trigger) => {
									AccordionPrimitive_Trigger($$anchor, {
										class: 'flex flex-1 items-center gap-3 py-2 text-left text-[15px] leading-6 font-semibold transition-all [&>svg]:-order-1 [&>svg>path:last-child]:origin-center [&>svg>path:last-child]:transition-all [&>svg>path:last-child]:duration-200 [&[data-state=open]>svg]:rotate-180 [&[data-state=open]>svg>path:last-child]:rotate-90 [&[data-state=open]>svg>path:last-child]:opacity-0',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var fragment_7 = root_2();
											var text_2 = $.first_child(fragment_7);
											var node_8 = $.sibling(text_2);

											Plus(node_8, {
												size: 16,
												class: 'shrink-0 opacity-60 transition-transform duration-200',
												'aria-hidden': 'true'
											});

											$.template_effect(() => $.set_text(text_2, `${$.get(item).title ?? ''} `));
											$.append($$anchor, fragment_7);
										},
										$$slots: { default: true }
									});
								});

								var node_9 = $.sibling(node_7, 2);

								$.component(node_9, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										class: 'p-0',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_10 = $.first_child(fragment_8);

											$.each(node_10, 17, () => $.get(item).collapsibles, (collapsible) => collapsible.title, ($$anchor, collapsible) => {
												CollapsibleDemo($$anchor, () => ({
													content: $.get(collapsible).content,
													Icon: $.get(collapsible).icon,
													open: $.get(collapsible).open ?? false,
													title: $.get(collapsible).title
												}));
											});

											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_5);
				});

				$.append($$anchor, fragment_4);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}