import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from '$lib/components/ui/accordion/index.js';
import AtSign from '@lucide/svelte/icons/at-sign';
import Command from '@lucide/svelte/icons/command';
import Eclipse from '@lucide/svelte/icons/eclipse';
import Zap from '@lucide/svelte/icons/zap';

var root = $.from_html(`<span class="flex items-center gap-3"><!> <span> </span></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<div class="space-y-4"><h2 class="text-xl font-bold">W/ icon and chevron</h2> <!></div>`);

export default function Accordion_05($$anchor) {
	const items = [
		{
			content: 'Origin UI focuses on developer experience and performance. Built with TypeScript, it offers excellent type safety, follows accessibility standards, and provides comprehensive documentation with regular updates.',
			icon: Command,
			id: '1',
			title: 'What makes Origin UI - Svelte different?'
		},

		{
			content: 'Use our CSS variables for global styling, or class and style props for component-specific changes. We support CSS modules, Tailwind, and dark mode out of the box.',
			icon: Eclipse,
			id: '2',
			title: 'How can I customize the components?'
		},

		{
			content: 'Yes, with tree-shaking, code splitting, and minimal runtime overhead. Most components are under 5KB gzipped.',
			icon: Zap,
			id: '3',
			title: 'Is Origin UI - Svelte optimized for performance?'
		},

		{
			content: 'All components follow WAI-ARIA standards, featuring proper ARIA attributes, keyboard navigation, and screen reader support. Regular testing ensures compatibility with NVDA, VoiceOver, and JAWS.',
			icon: AtSign,
			id: '4',
			title: 'How accessible are the components?'
		}
	];

	var div = root_2();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			class: 'w-full',
			value: '3',
			children: ($$anchor, $$slotProps) => {
				var fragment = $.comment();
				var node_1 = $.first_child(fragment);

				$.each(node_1, 17, () => items, (item) => item.id, ($$anchor, item) => {
					var fragment_1 = $.comment();
					var node_2 = $.first_child(fragment_1);

					$.component(node_2, () => Accordion.Item, ($$anchor, Accordion_Item) => {
						Accordion_Item($$anchor, {
							get value() {
								return $.get(item).id;
							},
							class: 'py-2',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root_1();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
									Accordion_Trigger($$anchor, {
										class: 'py-2 text-[15px] leading-6 hover:no-underline',
										children: ($$anchor, $$slotProps) => {
											var span = root();
											var node_4 = $.child(span);

											$.component(node_4, () => $.get(item).icon, ($$anchor, item_icon) => {
												item_icon($$anchor, {
													size: 16,
													class: 'shrink-0 opacity-60',
													'aria-hidden': 'true'
												});
											});

											var span_1 = $.sibling(node_4, 2);
											var text = $.only_child(span_1, true);

											$.reset(span);
											$.template_effect(() => $.set_text(text, $.get(item).title));
											$.append($$anchor, span);
										},
										$$slots: { default: true }
									});
								});

								var node_5 = $.sibling(node_3, 2);

								$.component(node_5, () => Accordion.Content, ($$anchor, Accordion_Content) => {
									Accordion_Content($$anchor, {
										class: 'text-muted-foreground ps-7 pb-2',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text_1 = $.text();

											$.template_effect(() => $.set_text(text_1, $.get(item).content));
											$.append($$anchor, text_1);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_2);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_1);
				});

				$.append($$anchor, fragment);
			},
			$$slots: { default: true }
		});
	});

	$.reset(div);
	$.append($$anchor, div);
}