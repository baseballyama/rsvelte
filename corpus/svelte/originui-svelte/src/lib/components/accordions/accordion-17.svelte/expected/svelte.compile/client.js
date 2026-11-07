import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import * as Accordion from '$lib/components/ui/accordion/index.js';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="space-y-4"><h2 class="text-xl font-bold">Table w/ left chevron</h2> <!></div>`);

export default function Accordion_17($$anchor) {
	const items = [
		{
			content: 'Origin UI focuses on developer experience and performance. Built with TypeScript, it offers excellent type safety, follows accessibility standards, and provides comprehensive documentation with regular updates.',
			id: '1',
			title: 'What makes Origin UI - Svelte different?'
		},

		{
			content: 'Use our CSS variables for global styling, or class and style props for component-specific changes. We support CSS modules, Tailwind, and dark mode out of the box.',
			id: '2',
			title: 'How can I customize the components?'
		},

		{
			content: 'Yes, with tree-shaking, code splitting, and minimal runtime overhead. Most components are under 5KB gzipped.',
			id: '3',
			title: 'Is Origin UI - Svelte optimized for performance?'
		},

		{
			content: 'All components follow WAI-ARIA standards, featuring proper ARIA attributes, keyboard navigation, and screen reader support. Regular testing ensures compatibility with NVDA, VoiceOver, and JAWS.',
			id: '4',
			title: 'How accessible are the components?'
		}
	];

	var div = root_1();
	var node = $.sibling($.child(div), 2);

	$.component(node, () => Accordion.Root, ($$anchor, Accordion_Root) => {
		Accordion_Root($$anchor, {
			type: 'single',
			class: 'w-full -space-y-px',
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
							class: 'bg-background border px-4 py-1 first:rounded-t-lg last:rounded-b-lg',
							children: ($$anchor, $$slotProps) => {
								var fragment_2 = root();
								var node_3 = $.first_child(fragment_2);

								$.component(node_3, () => Accordion.Trigger, ($$anchor, Accordion_Trigger) => {
									Accordion_Trigger($$anchor, {
										class: 'justify-start gap-3 py-2 text-[15px] leading-6 hover:no-underline [&>svg]:-order-1',
										children: ($$anchor, $$slotProps) => {
											$.next();

											var text = $.text();

											$.template_effect(() => $.set_text(text, $.get(item).title));
											$.append($$anchor, text);
										},
										$$slots: { default: true }
									});
								});

								var node_4 = $.sibling(node_3, 2);

								$.component(node_4, () => Accordion.Content, ($$anchor, Accordion_Content) => {
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