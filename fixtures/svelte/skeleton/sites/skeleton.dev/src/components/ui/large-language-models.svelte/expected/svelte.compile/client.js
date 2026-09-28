import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import chatgpt from '@/assets/logos/chatgpt.svg?raw';
import claude from '@/assets/logos/claude.svg?raw';
import markdown from '@/assets/logos/markdown.svg?raw';
import ChevronDownIcon from '@lucide/svelte/icons/chevron-down';
import FileTextIcon from '@lucide/svelte/icons/file-text';
import { Menu, Portal } from '@skeletonlabs/skeleton-svelte';

var root = $.from_html(`<!> <span>LLM</span> <!>`, 1);
var root_1 = $.from_html(`<a><!> <!></a>`);
var root_2 = $.from_html(`<!> <!>`, 1);

export default function Large_language_models($$anchor, $$props) {
	$.push($$props, true);

	const prompt = $.derived(() => `The following is a documentation page from Skeleton UI (a UI-toolkit build on top of Tailwind and provides framework agnostic components): ${$$props.url}.md. Be ready to help answer questions about this page.`);

	const links = $.derived(() => [
		{
			title: 'View Markdown',
			icon: markdown,
			attributes: { href: `${$$props.url}.md` }
		},

		{
			title: 'Open in ChatGPT',
			icon: chatgpt,
			attributes: {
				href: `https://chatgpt.com/?${new URLSearchParams({ prompt: $.get(prompt) })}`,
				target: '_blank',
				rel: 'noopener noreferrer'
			}
		},

		{
			title: 'Open in Claude',
			icon: claude,
			attributes: {
				href: `https://claude.ai/new?${new URLSearchParams({ q: $.get(prompt) })}`,
				target: '_blank',
				rel: 'noopener noreferrer'
			}
		}
	]);

	Menu($$anchor, {
		positioning: { placement: 'bottom-end' },
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var node = $.first_child(fragment_1);

			$.component(node, () => Menu.Trigger, ($$anchor, Menu_Trigger) => {
				Menu_Trigger($$anchor, {
					class: 'hidden lg:flex btn btn-sm preset-outlined-surface-200-800 data-[state=open]:brightness-75',
					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root();
						var node_1 = $.first_child(fragment_2);

						FileTextIcon(node_1, { class: 'size-4' });

						var node_2 = $.sibling(node_1, 4);

						ChevronDownIcon(node_2, { class: 'size-4 opacity-50' });
						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			var node_3 = $.sibling(node, 2);

			Portal(node_3, {
				children: ($$anchor, $$slotProps) => {
					var fragment_3 = $.comment();
					var node_4 = $.first_child(fragment_3);

					$.component(node_4, () => Menu.Positioner, ($$anchor, Menu_Positioner) => {
						Menu_Positioner($$anchor, {
							children: ($$anchor, $$slotProps) => {
								var fragment_4 = $.comment();
								var node_5 = $.first_child(fragment_4);

								$.component(node_5, () => Menu.Content, ($$anchor, Menu_Content) => {
									Menu_Content($$anchor, {
										class: 'z-50',
										children: ($$anchor, $$slotProps) => {
											var fragment_5 = $.comment();
											var node_6 = $.first_child(fragment_5);

											$.each(node_6, 16, () => $.get(links), (link) => link, ($$anchor, link) => {
												var fragment_6 = $.comment();
												var node_7 = $.first_child(fragment_6);

												{
													const element = ($$anchor, attributes = $.noop) => {
														var a = root_1();

														$.attribute_effect(a, () => ({ ...attributes(), ...link.attributes }));

														var node_8 = $.child(a);

														$.component(node_8, () => Menu.ItemText, ($$anchor, Menu_ItemText) => {
															Menu_ItemText($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	$.next();

																	var text = $.text();

																	$.template_effect(() => $.set_text(text, link.title));
																	$.append($$anchor, text);
																},
																$$slots: { default: true }
															});
														});

														var node_9 = $.sibling(node_8, 2);

														$.component(node_9, () => Menu.ItemIndicator, ($$anchor, Menu_ItemIndicator) => {
															Menu_ItemIndicator($$anchor, {
																children: ($$anchor, $$slotProps) => {
																	var fragment_8 = $.comment();
																	var node_10 = $.first_child(fragment_8);

																	$.html(node_10, () => link.icon);
																	$.append($$anchor, fragment_8);
																},
																$$slots: { default: true }
															});
														});

														$.reset(a);
														$.append($$anchor, a);
													};

													let $0 = $.derived(() => !!link.attributes.target);

													$.component(node_7, () => Menu.Item, ($$anchor, Menu_Item) => {
														Menu_Item($$anchor, {
															class: 'aria-[current=page]:preset-filled',
															get value() {
																return link.attributes.href;
															},

															get closeOnSelect() {
																return $.get($0);
															},
															element,
															$$slots: { element: true }
														});
													});
												}

												$.append($$anchor, fragment_6);
											});

											$.append($$anchor, fragment_5);
										},
										$$slots: { default: true }
									});
								});

								$.append($$anchor, fragment_4);
							},
							$$slots: { default: true }
						});
					});

					$.append($$anchor, fragment_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}