import * as $ from 'svelte/internal/server';
import { Button, buttonVariants } from '$lib/components/ui/button/index.js';
import { NodeViewContent, NodeViewWrapper } from '../../tiptap/index.js';
import * as Popover from '$lib/components/ui/popover/index.js';
import Check from '@lucide/svelte/icons/check';
import Copy from '@lucide/svelte/icons/copy';
import * as Command from '$lib/components/ui/command/index.js';
import { cn } from '$lib/utils.js';
import strings from '../../strings.js';
import { Sparkle } from '@lucide/svelte';
import Tooltip from './Tooltip.svelte';

export default function CodeBlock($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { editor, node, updateAttributes, extension, getPos } = $$props;
		let preRef = void 0;
		let isCopying = false;
		const languages = $.derived(() => extension.options.lowlight.listLanguages().sort());
		let defaultLanguage = $.derived(() => node.attrs.language ?? 'plaintext');

		const changeLanguage = (language) => {
			updateAttributes({ language });
			defaultLanguage(language);
		};

		function copyCode() {
			if (!preRef) return;

			isCopying = true;
			navigator.clipboard.writeText(preRef.innerText);

			setTimeout(
				() => {
					isCopying = false;
				},
				1000
			);
		}

		function convertToMermaid() {
			const code = node.textContent;
			const pos = getPos();

			if (typeof pos !== 'number') return;

			editor.chain().focus().deleteRange({ from: pos, to: pos + node.nodeSize }).insertContentAt(pos, {
				type: 'mermaid',
				content: [{ type: 'text', text: code || '' }]
			}).run();
		}

		NodeViewWrapper($$renderer, {
			class: 'my-4 rounded-lg bg-muted pb-4 dark:bg-muted/20',
			children: ($$renderer) => {
				$$renderer.push(`<div class="mx-2 flex items-center justify-end gap-2 print:justify-start" contenteditable="false">`);

				if (defaultLanguage().toLowerCase() === 'mermaid') {
					$$renderer.push('<!--[0-->');

					Tooltip($$renderer, {
						tooltip: 'Convert to Mermaid Diagram',
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'ghost',
								size: 'icon-xs',
								class: 'print:hidden',
								onclick: convertToMermaid,
								children: ($$renderer) => {
									Sparkle($$renderer, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> `);

				if (Popover.Root) {
					$$renderer.push('<!--[-->');

					Popover.Root($$renderer, {
						children: ($$renderer) => {
							Tooltip($$renderer, {
								tooltip: 'Change Language',
								children: ($$renderer) => {
									if (Popover.Trigger) {
										$$renderer.push('<!--[-->');

										Popover.Trigger($$renderer, {
											contenteditable: 'false',
											disabled: !editor.isEditable,
											class: buttonVariants({
												variant: 'ghost',
												size: 'sm',
												class: 'text-muted-foreground capitalize'
											}),

											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(defaultLanguage())}`);
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

							$$renderer.push(`<!----> `);

							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									class: 'max-h-96 w-42 p-0! text-primary!',
									portalProps: { disabled: true, to: undefined },
									onCloseAutoFocus: (e) => {
										e.preventDefault();
										e.stopPropagation();
									},

									onEscapeKeydown: (e) => {
										e.preventDefault();
										e.stopPropagation();
									},

									children: ($$renderer) => {
										if (Command.Root) {
											$$renderer.push('<!--[-->');

											Command.Root($$renderer, {
												class: 'p-0!',
												children: ($$renderer) => {
													if (Command.Input) {
														$$renderer.push('<!--[-->');

														Command.Input($$renderer, {
															placeholder: strings.extension.code.searchLanguagePlaceholder
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.List) {
														$$renderer.push('<!--[-->');

														Command.List($$renderer, {
															children: ($$renderer) => {
																if (Command.Empty) {
																	$$renderer.push('<!--[-->');

																	Command.Empty($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->${$.escape(strings.extension.code.searchLanguageEmpty)}`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		value: 'languages',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array = $.ensure_array_like(languages());

																			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																				let language = each_array[$$index];

																				if (Command.Item) {
																					$$renderer.push('<!--[-->');

																					Command.Item($$renderer, {
																						value: language,
																						onSelect: () => changeLanguage(language),
																						onclick: () => changeLanguage(language),
																						class: 'text-primary capitalize',
																						children: ($$renderer) => {
																							Check($$renderer, { class: cn(language !== defaultLanguage() && 'invisible') });
																							$$renderer.push(`<!----> ${$.escape(language)}`);
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

				$$renderer.push(` `);

				Button($$renderer, {
					variant: 'ghost',
					size: 'icon-xs',
					class: 'text-muted-foreground print:hidden',
					onclick: copyCode,
					children: ($$renderer) => {
						if (isCopying) {
							$$renderer.push('<!--[0-->');
							Check($$renderer, { class: ' text-green-500' });
						} else {
							$$renderer.push('<!--[-1-->');
							Copy($$renderer, {});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----></div> <pre${$.attr('draggable', false)} spellcheck="false">
		`);

				NodeViewContent($$renderer, $.spread_props([
					{ as: 'code', class: `language-${defaultLanguage()}` },
					node.attrs
				]));

				$$renderer.push(`<!---->
	</pre>`);
			},
			$$slots: { default: true }
		});
	});
}