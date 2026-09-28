import * as $ from 'svelte/internal/server';
import chatgpt from '@/assets/logos/chatgpt.svg?raw';
import claude from '@/assets/logos/claude.svg?raw';
import markdown from '@/assets/logos/markdown.svg?raw';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import FileTextIcon from '@lucide/svelte/icons/file-text';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Large_language_models($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { url } = $$props;
		const prompt = $.derived(() => `The following is a documentation page from Skeleton UI (a UI-toolkit build on top of Tailwind and provides framework agnostic components): ${url}.md. Be ready to help answer questions about this page.`);

		const links = $.derived(() => [
			{
				title: 'View Markdown',
				icon: markdown,
				attributes: { href: `${url}.md` }
			},

			{
				title: 'Open in ChatGPT',
				icon: chatgpt,
				attributes: {
					href: `https://chatgpt.com/?${new URLSearchParams({ prompt: prompt() })}`,
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			},

			{
				title: 'Open in Claude',
				icon: claude,
				attributes: {
					href: `https://claude.ai/new?${new URLSearchParams({ q: prompt() })}`,
					target: '_blank',
					rel: 'noopener noreferrer'
				}
			}
		]);

		Menu($$renderer, {
			positioning: { placement: 'bottom-end' },
			children: ($$renderer) => {
				if (Menu.Trigger) {
					$$renderer.push('<!--[-->');

					Menu.Trigger($$renderer, {
						class: 'hidden lg:flex btn btn-sm preset-outlined-surface-200-800 data-[state=open]:brightness-75',
						children: ($$renderer) => {
							FileTextIcon($$renderer, { class: 'size-4' });
							$$renderer.push(`<!----> <span>LLM</span> `);
							ChevronDownIcon($$renderer, { class: 'size-4 opacity-50' });
							$$renderer.push(`<!---->`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				Portal($$renderer, {
					children: ($$renderer) => {
						if (Menu.Positioner) {
							$$renderer.push('<!--[-->');

							Menu.Positioner($$renderer, {
								children: ($$renderer) => {
									if (Menu.Content) {
										$$renderer.push('<!--[-->');

										Menu.Content($$renderer, {
											class: 'z-50',
											children: ($$renderer) => {
												$$renderer.push(`<!--[-->`);

												const each_array = $.ensure_array_like(links());

												for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
													let link = each_array[$$index];

													{
														function element($$renderer, attributes) {
															$$renderer.push(`<a${$.attributes({ ...attributes, ...link.attributes })}>`);

															if (Menu.ItemText) {
																$$renderer.push('<!--[-->');

																Menu.ItemText($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`<!---->${$.escape(link.title)}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(` `);

															if (Menu.ItemIndicator) {
																$$renderer.push('<!--[-->');

																Menu.ItemIndicator($$renderer, {
																	children: ($$renderer) => {
																		$$renderer.push(`${$.html(link.icon)}`);
																	},
																	$$slots: { default: true }
																});

																$$renderer.push('<!--]-->');
															} else {
																$$renderer.push('<!--[!-->');
																$$renderer.push('<!--]-->');
															}

															$$renderer.push(`</a>`);
														}

														if (Menu.Item) {
															$$renderer.push('<!--[-->');

															Menu.Item($$renderer, {
																class: 'aria-[current=page]:preset-filled',
																value: link.attributes.href,
																closeOnSelect: !!link.attributes.target,
																element,
																$$slots: { element: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
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

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}