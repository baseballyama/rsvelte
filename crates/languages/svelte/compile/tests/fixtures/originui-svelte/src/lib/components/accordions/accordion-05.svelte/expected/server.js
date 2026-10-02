import * as $ from 'svelte/internal/server';
import * as Accordion from '$lib/components/ui/accordion/index.js';
import AtSign from '@lucide/svelte/icons/at-sign';
import Command from '@lucide/svelte/icons/command';
import Eclipse from '@lucide/svelte/icons/eclipse';
import Zap from '@lucide/svelte/icons/zap';

export default function Accordion_05($$renderer) {
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

	$$renderer.push(`<div class="space-y-4"><h2 class="text-xl font-bold">W/ icon and chevron</h2> `);

	if (Accordion.Root) {
		$$renderer.push('<!--[-->');

		Accordion.Root($$renderer, {
			type: 'single',
			class: 'w-full',
			value: '3',
			children: ($$renderer) => {
				$$renderer.push(`<!--[-->`);

				const each_array = $.ensure_array_like(items);

				for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
					let item = each_array[$$index];

					if (Accordion.Item) {
						$$renderer.push('<!--[-->');

						Accordion.Item($$renderer, {
							value: item.id,
							class: 'py-2',
							children: ($$renderer) => {
								if (Accordion.Trigger) {
									$$renderer.push('<!--[-->');

									Accordion.Trigger($$renderer, {
										class: 'py-2 text-[15px] leading-6 hover:no-underline',
										children: ($$renderer) => {
											$$renderer.push(`<span class="flex items-center gap-3">`);

											if (item.icon) {
												$$renderer.push('<!--[-->');

												item.icon($$renderer, {
													size: 16,
													class: 'shrink-0 opacity-60',
													'aria-hidden': 'true'
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` <span>${$.escape(item.title)}</span></span>`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Accordion.Content) {
									$$renderer.push('<!--[-->');

									Accordion.Content($$renderer, {
										class: 'text-muted-foreground ps-7 pb-2',
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(item.content)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							},
							$$slots: { default: true }
						});

						$$renderer.push('<!--]-->');
					} else {
						$$renderer.push('<!--[!-->');
						$$renderer.push('<!--]-->');
					}
				}

				$$renderer.push(`<!--]-->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push('<!--]-->');
	} else {
		$$renderer.push('<!--[!-->');
		$$renderer.push('<!--]-->');
	}

	$$renderer.push(`</div>`);
}