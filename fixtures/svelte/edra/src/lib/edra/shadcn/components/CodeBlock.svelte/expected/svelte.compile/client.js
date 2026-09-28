import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<!> `, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

var root_2 = $.from_html(
	`<div class="mx-2 flex items-center justify-end gap-2 print:justify-start" contenteditable="false"><!> <!> <!></div> <pre spellcheck="false">
		<!>
	</pre>`,
	1
);

export default function CodeBlock($$anchor, $$props) {
	$.push($$props, true);

	let preRef = $.state(void 0);
	let isCopying = $.state(false);
	const languages = $.derived(() => $$props.extension.options.lowlight.listLanguages().sort());
	let defaultLanguage = $.derived(() => $$props.node.attrs.language ?? 'plaintext');

	const changeLanguage = (language) => {
		$$props.updateAttributes({ language });
		$.set(defaultLanguage, language);
	};

	function copyCode() {
		if (!$.get(preRef)) return;

		$.set(isCopying, true);
		navigator.clipboard.writeText($.get(preRef).innerText);

		setTimeout(
			() => {
				$.set(isCopying, false);
			},
			1000
		);
	}

	function convertToMermaid() {
		const code = $$props.node.textContent;
		const pos = $$props.getPos();

		if (typeof pos !== 'number') return;

		$$props.editor.chain().focus().deleteRange({ from: pos, to: pos + $$props.node.nodeSize }).insertContentAt(pos, {
			type: 'mermaid',
			content: [{ type: 'text', text: code || '' }]
		}).run();
	}

	NodeViewWrapper($$anchor, {
		class: 'my-4 rounded-lg bg-muted pb-4 dark:bg-muted/20',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
			var div = $.first_child(fragment_1);
			var node_1 = $.child(div);

			{
				var consequent = ($$anchor) => {
					Tooltip($$anchor, {
						tooltip: 'Convert to Mermaid Diagram',
						children: ($$anchor, $$slotProps) => {
							Button($$anchor, {
								variant: 'ghost',
								size: 'icon-xs',
								class: 'print:hidden',
								onclick: convertToMermaid,
								children: ($$anchor, $$slotProps) => {
									Sparkle($$anchor, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				};

				var d = $.derived(() => $.get(defaultLanguage).toLowerCase() === 'mermaid');

				$.if(node_1, ($$render) => {
					if ($.get(d)) $$render(consequent);
				});
			}

			var node_2 = $.sibling(node_1, 2);

			$.component(node_2, () => Popover.Root, ($$anchor, Popover_Root) => {
				Popover_Root($$anchor, {
					children: ($$anchor, $$slotProps) => {
						var fragment_5 = root_1();
						var node_3 = $.first_child(fragment_5);

						Tooltip(node_3, {
							tooltip: 'Change Language',
							children: ($$anchor, $$slotProps) => {
								var fragment_6 = $.comment();
								var node_4 = $.first_child(fragment_6);

								{
									let $0 = $.derived(() => !$$props.editor.isEditable);

									let $1 = $.derived(() => buttonVariants({
										variant: 'ghost',
										size: 'sm',
										class: 'text-muted-foreground capitalize'
									}));

									$.component(node_4, () => Popover.Trigger, ($$anchor, Popover_Trigger) => {
										Popover_Trigger($$anchor, {
											contenteditable: 'false',
											get disabled() {
												return $.get($0);
											},

											get class() {
												return $.get($1);
											},

											children: ($$anchor, $$slotProps) => {
												$.next();

												var text = $.text();

												$.template_effect(() => $.set_text(text, $.get(defaultLanguage)));
												$.append($$anchor, text);
											},
											$$slots: { default: true }
										});
									});
								}

								$.append($$anchor, fragment_6);
							},
							$$slots: { default: true }
						});

						var node_5 = $.sibling(node_3, 2);

						$.component(node_5, () => Popover.Content, ($$anchor, Popover_Content) => {
							Popover_Content($$anchor, {
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

								children: ($$anchor, $$slotProps) => {
									var fragment_8 = $.comment();
									var node_6 = $.first_child(fragment_8);

									$.component(node_6, () => Command.Root, ($$anchor, Command_Root) => {
										Command_Root($$anchor, {
											class: 'p-0!',
											children: ($$anchor, $$slotProps) => {
												var fragment_9 = root_1();
												var node_7 = $.first_child(fragment_9);

												$.component(node_7, () => Command.Input, ($$anchor, Command_Input) => {
													Command_Input($$anchor, {
														get placeholder() {
															return strings.extension.code.searchLanguagePlaceholder;
														}
													});
												});

												var node_8 = $.sibling(node_7, 2);

												$.component(node_8, () => Command.List, ($$anchor, Command_List) => {
													Command_List($$anchor, {
														children: ($$anchor, $$slotProps) => {
															var fragment_10 = root_1();
															var node_9 = $.first_child(fragment_10);

															$.component(node_9, () => Command.Empty, ($$anchor, Command_Empty) => {
																Command_Empty($$anchor, {
																	children: ($$anchor, $$slotProps) => {
																		$.next();

																		var text_1 = $.text();

																		$.template_effect(() => $.set_text(text_1, strings.extension.code.searchLanguageEmpty));
																		$.append($$anchor, text_1);
																	},
																	$$slots: { default: true }
																});
															});

															var node_10 = $.sibling(node_9, 2);

															$.component(node_10, () => Command.Group, ($$anchor, Command_Group) => {
																Command_Group($$anchor, {
																	value: 'languages',
																	children: ($$anchor, $$slotProps) => {
																		var fragment_12 = $.comment();
																		var node_11 = $.first_child(fragment_12);

																		$.each(node_11, 16, () => $.get(languages), (language) => language, ($$anchor, language) => {
																			var fragment_13 = $.comment();
																			var node_12 = $.first_child(fragment_13);

																			$.component(node_12, () => Command.Item, ($$anchor, Command_Item) => {
																				Command_Item($$anchor, {
																					get value() {
																						return language;
																					},
																					onSelect: () => changeLanguage(language),
																					onclick: () => changeLanguage(language),
																					class: 'text-primary capitalize',
																					children: ($$anchor, $$slotProps) => {
																						var fragment_14 = root();
																						var node_13 = $.first_child(fragment_14);

																						{
																							let $0 = $.derived(() => cn(language !== $.get(defaultLanguage) && 'invisible'));

																							Check(node_13, {
																								get class() {
																									return $.get($0);
																								}
																							});
																						}

																						var text_2 = $.sibling(node_13);

																						$.template_effect(() => $.set_text(text_2, ` ${language ?? ''}`));
																						$.append($$anchor, fragment_14);
																					},
																					$$slots: { default: true }
																				});
																			});

																			$.append($$anchor, fragment_13);
																		});

																		$.append($$anchor, fragment_12);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_10);
														},
														$$slots: { default: true }
													});
												});

												$.append($$anchor, fragment_9);
											},
											$$slots: { default: true }
										});
									});

									$.append($$anchor, fragment_8);
								},
								$$slots: { default: true }
							});
						});

						$.append($$anchor, fragment_5);
					},
					$$slots: { default: true }
				});
			});

			var node_14 = $.sibling(node_2, 2);

			Button(node_14, {
				variant: 'ghost',
				size: 'icon-xs',
				class: 'text-muted-foreground print:hidden',
				onclick: copyCode,
				children: ($$anchor, $$slotProps) => {
					var fragment_15 = $.comment();
					var node_15 = $.first_child(fragment_15);

					{
						var consequent_1 = ($$anchor) => {
							Check($$anchor, { class: ' text-green-500' });
						};

						var alternate = ($$anchor) => {
							Copy($$anchor, {});
						};

						$.if(node_15, ($$render) => {
							if ($.get(isCopying)) $$render(consequent_1); else $$render(alternate, -1);
						});
					}

					$.append($$anchor, fragment_15);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var pre = $.sibling(div, 2);

			$.set_attribute(pre, 'draggable', false);

			var node_16 = $.sibling($.child(pre));

			{
				let $0 = $.derived(() => `language-${$.get(defaultLanguage)}`);

				NodeViewContent(node_16, $.spread_props(
					{
						as: 'code',
						get class() {
							return $.get($0);
						}
					},
					() => $$props.node.attrs
				));
			}

			$.next();
			$.reset(pre);
			$.bind_this(pre, ($$value) => $.set(preRef, $$value), () => $.get(preRef));
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}