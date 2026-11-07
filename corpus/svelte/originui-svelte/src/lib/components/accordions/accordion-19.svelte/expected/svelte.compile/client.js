import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from '$lib/components/ui/accordion/index.js';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '$lib/components/ui/collapsible';

const CollapsibleDemo = ($$anchor, $$arg0) => {
	let content = () => ($$arg0?.()).content;
	let open = () => ($$arg0?.()).open;
	let title = () => ($$arg0?.()).title;

	Collapsible($$anchor, {
		class: 'border-border bg-accent space-y-1 border-t px-4 py-3',
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

					var text = $.sibling(node_1);

					$.template_effect(() => $.set_text(text, ` ${title() ?? ''}`));
					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node, 2);

			CollapsibleContent(node_2, {
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

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-4"><h2 class="text-xl font-bold">Table w/ left plus-minus</h2> <!></div>`);

export default function Accordion_19($$anchor) {
	const items = [
		{
			collapsibles: [
				{
					content: 'We optimize every component for maximum performance and minimal bundle size.',
					title: 'What about performance?'
				},

				{
					content: 'Our documentation is comprehensive and includes live examples for every component.',
					title: 'How is the documentation?'
				}
			],
			id: '1',
			title: 'What makes Origin UI - Svelte different?'
		},

		{
			collapsibles: [
				{
					content: 'Yes, our theming system is fully customizable and supports both light and dark modes.',
					title: 'Can I use custom themes?'
				},

				{
					content: 'We have first-class support for Tailwind CSS with custom utility classes.',
					title: 'What about Tailwind support?'
				}
			],
			id: '2',
			title: 'How can I customize the components?'
		},

		{
			collapsibles: [
				{
					content: 'Our components are tree-shakeable and typically add minimal overhead to your bundle.',
					open: true,
					title: "What's the bundle size impact?"
				},

				{
					content: 'We support automatic code splitting for optimal loading performance.',
					title: 'How is code splitting handled?'
				}
			],
			id: '3',
			title: 'Is Origin UI - Svelte optimized for performance?'
		},

		{
			collapsibles: [
				{
					content: 'We test with NVDA, VoiceOver, and JAWS to ensure broad compatibility.',
					title: 'Which screen readers are supported?'
				},

				{
					content: 'Full keyboard navigation support is implemented following WAI-ARIA best practices.',
					title: 'What about keyboard navigation?'
				}
			],
			id: '4',
			title: 'How accessible are the components?'
		}
	];

	var div = root_2();
	var node_3 = $.sibling($.child(div), 2);

	$.component(node_3, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			class: 'w-full -space-y-px',
			value: '3',
			children: ($$anchor, $$slotProps) => {
				var fragment_4 = $.comment();
				var node_4 = $.first_child(fragment_4);

				$.each(node_4, 17, () => items, (item) => item.id, ($$anchor, item) => {
					var fragment_5 = $.comment();
					var node_5 = $.first_child(fragment_5);

					$.component(node_5, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return $.get(item).id;
							},
							class: 'bg-background overflow-hidden border first:rounded-t-lg last:rounded-b-lg',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = root_1();
								var node_6 = $.first_child(fragment_6);

								$.component(node_6, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
									Accordion_Trigger($$anchor, {
										class: 'px-4 py-3 text-[15px] leading-6 hover:no-underline',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_2 = $.text();

											$.template_effect(() => $.set_text(text_2, $.get(item).title));
											$.append($$anchor, text_2);
										},
										$$slots: { default: true }
									});
								});

								var node_7 = $.sibling(node_6, 2);

								$.component(node_7, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										class: 'p-0',
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = $.comment();
											var node_8 = $.first_child(fragment_8);

											$.each(node_8, 17, () => $.get(item).collapsibles, (collapsible) => collapsible.title, ($$anchor, collapsible) => {
												CollapsibleDemo($$anchor, () => ({
													content: $.get(collapsible).content,
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