import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { autoPlacement } from '@floating-ui/dom';
import { Button } from '$lib/components/ui/button/index.js';
import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
import { Braces, Sparkles, TextAlignCenter } from '@lucide/svelte';
import Clipboard from '@lucide/svelte/icons/clipboard';
import Duplicate from '@lucide/svelte/icons/copy';
import GripVertical from '@lucide/svelte/icons/grip-vertical';
import Palette from '@lucide/svelte/icons/palette';
import Plus from '@lucide/svelte/icons/plus';
import RemoveFormatting from '@lucide/svelte/icons/remove-formatting';
import Repeat2 from '@lucide/svelte/icons/repeat-2';
import Delete from '@lucide/svelte/icons/trash-2';
import { DragHandlePlugin } from '@tiptap/extension-drag-handle';
import { NodeSelection } from '@tiptap/pm/state';
import { onMount } from 'svelte';
import { commands } from '../commands/index.ts';
import { quickcolors } from '../utils.ts';
import { getEditor, useEditorTransaction } from '../tiptap/index.ts';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<span>Drag Handle</span>`);
var root_1 = $.from_html(`<!> <span class="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text font-bold text-transparent">Edit With AI</span>`, 1);
var root_2 = $.from_html(`<!> Turn Into`, 1);
var root_3 = $.from_html(`<!> <span> </span> <!>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);
var root_5 = $.from_html(`<!> <!>`, 1);
var root_6 = $.from_html(`<!> Colors`, 1);
var root_7 = $.from_html(`<span>A</span> <span class="capitalize"> </span>`, 1);
var root_8 = $.from_html(`<span class="size-4 rounded-full border"></span> <span class="capitalize"> </span>`, 1);
var root_9 = $.from_html(`<!> AlignMent`, 1);
var root_10 = $.from_html(`<!> Insert Next`, 1);
var root_11 = $.from_html(`<!> Remove Formatting`, 1);
var root_12 = $.from_html(`<!> Duplicate`, 1);
var root_13 = $.from_html(`<!> Copy to Clipboard`, 1);
var root_14 = $.from_html(`<!> Copy Content`, 1);
var root_15 = $.from_svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.491 4.046a.75.75 0 0 1 .83.218L7 8.592l3.678-4.328A.75.75 0 0 1 12 4.75v9.5a.75.75 0 0 1-1.5 0V6.79l-2.929 3.446a.75.75 0 0 1-1.142 0L3.5 6.79v7.46a.75.75 0 0 1-1.5 0v-9.5a.75.75 0 0 1 .491-.704M13.22 11.72a.75.75 0 0 1 1.06 0l.72.72V4.75a.75.75 0 0 1 1.5 0v7.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 0-1.06"></path></svg> Copy as Markdown`, 1);
var root_16 = $.from_html(`<!> Copy as JSON`, 1);
var root_17 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_18 = $.from_html(`<!> Delete`, 1);
var root_19 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_20 = $.from_html(`<div style="visibility: hidden;"><!> <!></div>`);

export default function Drag_handle($$anchor, $$props) {
	$.push($$props, true);

	const type = $.prop($$props, 'type', 3, 'simple');
	const alignments = commands.alignment;

	const turnIntos = Object.entries(commands).reduce(
		(acc, [key, value]) => {
			if (key === 'alignment') return acc;

			const turnIntoCommands = value.filter((c) => c.turnInto);

			if (turnIntoCommands.length > 0) {
				acc[key] = turnIntoCommands;
			}

			return acc;
		},
		{}
	);

	let currentNode = $.state(null);
	let currentNodePos = $.state(-1);
	let open = $.state(false);
	const pluginKey = 'globalDragHandle';
	let element = $.state($.proxy(document.createElement('div')));
	const editor = getEditor();
	const transaction = useEditorTransaction(editor);

	function useAI() {
		void transaction.version;

		return editor.extensionManager.extensions.some((e) => e.name === 'ai-highlight' && e.options?.callAI != null);
	}

	onMount(() => {
		const plugin = DragHandlePlugin({
			element: $.get(element),
			pluginKey,
			editor,
			computePositionConfig: {
				strategy: 'absolute',
				middleware: [autoPlacement({ allowedPlacements: ['left', 'left-start'] })]
			},
			nestedOptions: {
				enabled: false,
				rules: [],
				defaultRules: true,
				allowedContainers: undefined,
				edgeDetection: { threshold: 1, edges: ['left', 'top'], strength: 1 }
			},
			onNodeChange
		});

		editor?.registerPlugin(plugin.plugin);

		return () => editor?.unregisterPlugin(pluginKey);
	});

	const onNodeChange = (data) => {
		if (data.node) $.set(currentNode, data.node, true);

		$.set(currentNodePos, data.pos, true);
	};

	const handleRemoveFormatting = () => {
		const chain = editor?.chain();

		chain?.setNodeSelection($.get(currentNodePos)).unsetAllMarks();
		chain?.setParagraph();
		chain?.run();
	};

	const handleDuplicate = () => {
		editor?.commands.setNodeSelection($.get(currentNodePos));

		const selectedNode = editor?.state.selection.$anchor.node(1) || (editor?.state.selection).node;

		editor?.chain().setMeta('hideDragHandle', true).insertContentAt($.get(currentNodePos) + ($.get(currentNode)?.nodeSize || 0), selectedNode.toJSON()).run();
	};

	const handleCopyToClipboard = () => {
		editor?.chain().setMeta('hideDragHandle', true).setNodeSelection($.get(currentNodePos)).run();

		/**
		 * !FIXME: document.execCommand is deprecated, use navigator.clipboard.writeText instead
		 */
		document.execCommand('copy');
	};

	const handleCopyContentAs = (as) => {
		let data = '';
		let nodeData = $.get(currentNode)?.toJSON();

		if (as === 'markdown') {
			data = editor?.markdown?.serialize(nodeData) || '';
		} else if (as === 'json') {
			data = JSON.stringify(nodeData, null, 2) || '';
		}

		if (data) {
			navigator.clipboard.writeText(data);
		}
	};

	const handleDelete = () => {
		editor?.chain().setMeta('hideDragHandle', true).setNodeSelection($.get(currentNodePos)).deleteSelection().run();
	};

	function handleAIHighlight() {
		if ($.get(currentNodePos) === -1) return;

		editor.chain().setNodeSelection($.get(currentNodePos)).setAIHighlight({ color: 'var(--color-muted)' }).run();
	}

	const insertNode = () => {
		if ($.get(currentNodePos) === -1) return;

		const currentNodeSize = $.get(currentNode)?.nodeSize || 0;
		const insertPos = $.get(currentNodePos) + currentNodeSize;
		const currentNodeIsEmptyParagraph = $.get(currentNode)?.type.name === 'paragraph' && $.get(currentNode)?.content?.size === 0;
		const focusPos = currentNodeIsEmptyParagraph ? $.get(currentNodePos) + 2 : insertPos + 2;

		editor?.chain().command(({ dispatch, tr, state }) => {
			if (dispatch) {
				if (currentNodeIsEmptyParagraph) {
					tr.insertText('/', $.get(currentNodePos), $.get(currentNodePos) + 1);
				} else {
					tr.insert(insertPos, state.schema.nodes.paragraph.create(null, [state.schema.text('/')]));
				}

				return dispatch(tr);
			}

			return true;
		}).focus(focusPos).run();
	};

	var div = root_20();
	var node = $.child(div);

	Button(node, {
		variant: 'ghost',
		class: 'z-0! size-7! rounded-sm opacity-60 hover:opacity-100 focus-visible:opacity-100 active:opacity-100',
		onclick: () => $.set(open, !$.get(open)),
		children: ($$anchor, $$slotProps) => {
			GripVertical($$anchor, {});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	{
		var consequent_3 = ($$anchor) => {
			var fragment_1 = $.comment();
			var node_2 = $.first_child(fragment_1);

			$.component(node_2, () => DropdownMenu.Root, ($$anchor, DropdownMenu_Root) => {
				DropdownMenu_Root($$anchor, {
					get open() {
						return $.get(open);
					},

					set open($$value) {
						$.set(open, $$value, true);
					},

					children: ($$anchor, $$slotProps) => {
						var fragment_2 = root_5();
						var node_3 = $.first_child(fragment_2);

						$.component(node_3, () => DropdownMenu.Trigger, ($$anchor, DropdownMenu_Trigger) => {
							DropdownMenu_Trigger($$anchor, {
								class: 'sr-only',
								children: ($$anchor, $$slotProps) => {
									var span = root();

									$.append($$anchor, span);
								},
								$$slots: { default: true }
							});
						});

						var node_4 = $.sibling(node_3, 2);

						{
							let $0 = $.derived(() => ({ to: $.get(element) }));

							$.component(node_4, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content) => {
								DropdownMenu_Content($$anchor, {
									class: 'w-fit',
									get portalProps() {
										return $.get($0);
									},

									children: ($$anchor, $$slotProps) => {
										var fragment_3 = root_19();
										var node_5 = $.first_child(fragment_3);

										$.component(node_5, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group) => {
											DropdownMenu_Group($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_4 = root_4();
													var node_6 = $.first_child(fragment_4);

													$.component(node_6, () => DropdownMenu.GroupHeading, ($$anchor, DropdownMenu_GroupHeading) => {
														DropdownMenu_GroupHeading($$anchor, {
															class: 'text-muted-foreground capitalize',
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text = $.text();

																$.template_effect(() => $.set_text(text, $.get(currentNode)?.type.name));
																$.append($$anchor, text);
															},
															$$slots: { default: true }
														});
													});

													var node_7 = $.sibling(node_6, 2);

													{
														var consequent = ($$anchor) => {
															var fragment_6 = $.comment();
															var node_8 = $.first_child(fragment_6);

															$.component(node_8, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item) => {
																DropdownMenu_Item($$anchor, {
																	onmousedown: (e) => e.preventDefault(),
																	onclick: handleAIHighlight,
																	children: ($$anchor, $$slotProps) => {
																		var fragment_7 = root_1();
																		var node_9 = $.first_child(fragment_7);

																		Sparkles(node_9, {});
																		$.next(2);
																		$.append($$anchor, fragment_7);
																	},
																	$$slots: { default: true }
																});
															});

															$.append($$anchor, fragment_6);
														};

														var d = $.derived(() => useAI());

														$.if(node_7, ($$render) => {
															if ($.get(d)) $$render(consequent);
														});
													}

													var node_10 = $.sibling(node_7, 2);

													$.component(node_10, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub) => {
														DropdownMenu_Sub($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_8 = root_5();
																var node_11 = $.first_child(fragment_8);

																$.component(node_11, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger) => {
																	DropdownMenu_SubTrigger($$anchor, {
																		openDelay: 300,
																		children: ($$anchor, $$slotProps) => {
																			var fragment_9 = root_2();
																			var node_12 = $.first_child(fragment_9);

																			Repeat2(node_12, {});
																			$.next();
																			$.append($$anchor, fragment_9);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_13 = $.sibling(node_11, 2);

																$.component(node_13, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent) => {
																	DropdownMenu_SubContent($$anchor, {
																		class: 'max-h-96 w-fit overflow-y-scroll rounded-lg duration-300',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_10 = $.comment();
																			var node_14 = $.first_child(fragment_10);

																			$.each(node_14, 17, () => Object.entries(turnIntos), ([key, turnIntoCommands]) => key, ($$anchor, $$item) => {
																				var $$array = $.derived(() => $.to_array($.get($$item), 2));
																				let key = () => $.get($$array)[0];
																				let turnIntoCommands = () => $.get($$array)[1];
																				var fragment_11 = $.comment();
																				var node_15 = $.first_child(fragment_11);

																				$.component(node_15, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_1) => {
																					DropdownMenu_Group_1($$anchor, {
																						children: ($$anchor, $$slotProps) => {
																							var fragment_12 = root_4();
																							var node_16 = $.first_child(fragment_12);

																							$.component(node_16, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label) => {
																								DropdownMenu_Label($$anchor, {
																									class: 'capitalize',
																									children: ($$anchor, $$slotProps) => {
																										$.next();

																										var text_1 = $.text();

																										$.template_effect(() => $.set_text(text_1, key()));
																										$.append($$anchor, text_1);
																									},
																									$$slots: { default: true }
																								});
																							});

																							var node_17 = $.sibling(node_16, 2);

																							$.each(node_17, 16, turnIntoCommands, (command) => command, ($$anchor, command) => {
																								const Icon = $.derived(() => command.icon);
																								var fragment_14 = $.comment();
																								var node_18 = $.first_child(fragment_14);

																								$.component(node_18, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_1) => {
																									DropdownMenu_Item_1($$anchor, {
																										onclick: () => {
																											if ($.get(currentNode) && $.get(currentNodePos) && editor) command.turnInto?.(editor, $.get(currentNode), $.get(currentNodePos));
																										},

																										children: ($$anchor, $$slotProps) => {
																											var fragment_15 = root_3();
																											var node_19 = $.first_child(fragment_15);

																											$.component(node_19, () => $.get(Icon), ($$anchor, Icon_1) => {
																												Icon_1($$anchor, {});
																											});

																											var span_1 = $.sibling(node_19, 2);
																											var text_2 = $.only_child(span_1, true);
																											var node_20 = $.sibling(span_1, 2);

																											{
																												var consequent_1 = ($$anchor) => {
																													var fragment_16 = $.comment();
																													var node_21 = $.first_child(fragment_16);

																													$.component(node_21, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut) => {
																														DropdownMenu_Shortcut($$anchor, {
																															class: 'rounded border bg-background p-0.5',
																															children: ($$anchor, $$slotProps) => {
																																$.next();

																																var text_3 = $.text();

																																$.template_effect(() => $.set_text(text_3, command.shortCut));
																																$.append($$anchor, text_3);
																															},
																															$$slots: { default: true }
																														});
																													});

																													$.append($$anchor, fragment_16);
																												};

																												$.if(node_20, ($$render) => {
																													if (command.shortCut) $$render(consequent_1);
																												});
																											}

																											$.template_effect(() => $.set_text(text_2, command.tooltip));
																											$.append($$anchor, fragment_15);
																										},
																										$$slots: { default: true }
																									});
																								});

																								$.append($$anchor, fragment_14);
																							});

																							var node_22 = $.sibling(node_17, 2);

																							{
																								var consequent_2 = ($$anchor) => {
																									var fragment_18 = $.comment();
																									var node_23 = $.first_child(fragment_18);

																									$.component(node_23, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator) => {
																										DropdownMenu_Separator($$anchor, {});
																									});

																									$.append($$anchor, fragment_18);
																								};

																								var d_1 = $.derived(() => key() !== Object.keys(turnIntos).at(-1));

																								$.if(node_22, ($$render) => {
																									if ($.get(d_1)) $$render(consequent_2);
																								});
																							}

																							$.append($$anchor, fragment_12);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_11);
																			});

																			$.append($$anchor, fragment_10);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_8);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_4);
												},
												$$slots: { default: true }
											});
										});

										var node_24 = $.sibling(node_5, 2);

										$.component(node_24, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_1) => {
											DropdownMenu_Sub_1($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_19 = root_5();
													var node_25 = $.first_child(fragment_19);

													$.component(node_25, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_1) => {
														DropdownMenu_SubTrigger_1($$anchor, {
															openDelay: 300,
															children: ($$anchor, $$slotProps) => {
																var fragment_20 = root_6();
																var node_26 = $.first_child(fragment_20);

																Palette(node_26, {});
																$.next();
																$.append($$anchor, fragment_20);
															},
															$$slots: { default: true }
														});
													});

													var node_27 = $.sibling(node_25, 2);

													$.component(node_27, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_1) => {
														DropdownMenu_Content_1($$anchor, {
															side: 'right',
															class: 'max-h-96 min-w-fit overflow-auto rounded-lg duration-300',
															children: ($$anchor, $$slotProps) => {
																var fragment_21 = root_4();
																var node_28 = $.first_child(fragment_21);

																$.component(node_28, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_2) => {
																	DropdownMenu_Group_2($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			var fragment_22 = root_5();
																			var node_29 = $.first_child(fragment_22);

																			$.component(node_29, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_1) => {
																				DropdownMenu_Label_1($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_4 = $.text('Texts');

																						$.append($$anchor, text_4);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_30 = $.sibling(node_29, 2);

																			$.each(node_30, 17, () => quickcolors, (color) => color.label, ($$anchor, color) => {
																				var fragment_23 = $.comment();
																				var node_31 = $.first_child(fragment_23);

																				$.component(node_31, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_2) => {
																					DropdownMenu_Item_2($$anchor, {
																						get title() {
																							return $.get(color).value;
																						},

																						onclick: () => {
																							if ($.get(color).value === '' || $.get(color).label === 'Default') editor?.chain().setNodeSelection($.get(currentNodePos)).unsetColor().run(); else editor?.chain().setNodeSelection($.get(currentNodePos)).setColor($.get(color).value).run();
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_24 = root_7();
																							var span_2 = $.first_child(fragment_24);
																							var span_3 = $.sibling(span_2, 2);
																							var text_5 = $.only_child(span_3, true);

																							$.template_effect(() => {
																								$.set_style(span_2, `color: ${$.get(color).value};`);
																								$.set_text(text_5, $.get(color).label);
																							});

																							$.append($$anchor, fragment_24);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_23);
																			});

																			$.append($$anchor, fragment_22);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_32 = $.sibling(node_28, 2);

																$.component(node_32, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_1) => {
																	DropdownMenu_Separator_1($$anchor, {});
																});

																var node_33 = $.sibling(node_32, 2);

																$.component(node_33, () => DropdownMenu.Group, ($$anchor, DropdownMenu_Group_3) => {
																	DropdownMenu_Group_3($$anchor, {
																		class: 'min-w-fit',
																		children: ($$anchor, $$slotProps) => {
																			var fragment_25 = root_5();
																			var node_34 = $.first_child(fragment_25);

																			$.component(node_34, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_2) => {
																				DropdownMenu_Label_2($$anchor, {
																					children: ($$anchor, $$slotProps) => {
																						$.next();

																						var text_6 = $.text('Background');

																						$.append($$anchor, text_6);
																					},
																					$$slots: { default: true }
																				});
																			});

																			var node_35 = $.sibling(node_34, 2);

																			$.each(node_35, 17, () => quickcolors, (color) => color.label, ($$anchor, color) => {
																				var fragment_26 = $.comment();
																				var node_36 = $.first_child(fragment_26);

																				$.component(node_36, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_3) => {
																					DropdownMenu_Item_3($$anchor, {
																						get title() {
																							return $.get(color).value;
																						},

																						onclick: () => {
																							if ($.get(color).value === '' || $.get(color).label === 'Default') editor?.chain().setNodeSelection($.get(currentNodePos)).unsetHighlight().run(); else editor?.chain().setNodeSelection($.get(currentNodePos)).setHighlight({ color: `${$.get(color).value}50` }).run();
																						},

																						children: ($$anchor, $$slotProps) => {
																							var fragment_27 = root_8();
																							var span_4 = $.first_child(fragment_27);
																							var span_5 = $.sibling(span_4, 2);
																							var text_7 = $.only_child(span_5, true);

																							$.template_effect(() => {
																								$.set_style(span_4, `background-color: ${`${$.get(color).value}50`};`);
																								$.set_text(text_7, $.get(color).label);
																							});

																							$.append($$anchor, fragment_27);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.append($$anchor, fragment_26);
																			});

																			$.append($$anchor, fragment_25);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_21);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_19);
												},
												$$slots: { default: true }
											});
										});

										var node_37 = $.sibling(node_24, 2);

										$.component(node_37, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_2) => {
											DropdownMenu_Sub_2($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_28 = root_5();
													var node_38 = $.first_child(fragment_28);

													$.component(node_38, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_2) => {
														DropdownMenu_SubTrigger_2($$anchor, {
															openDelay: 300,
															children: ($$anchor, $$slotProps) => {
																var fragment_29 = root_9();
																var node_39 = $.first_child(fragment_29);

																TextAlignCenter(node_39, {});
																$.next();
																$.append($$anchor, fragment_29);
															},
															$$slots: { default: true }
														});
													});

													var node_40 = $.sibling(node_38, 2);

													$.component(node_40, () => DropdownMenu.SubContent, ($$anchor, DropdownMenu_SubContent_1) => {
														DropdownMenu_SubContent_1($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_30 = root_5();
																var node_41 = $.first_child(fragment_30);

																$.component(node_41, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_3) => {
																	DropdownMenu_Label_3($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_8 = $.text('Alignments');

																			$.append($$anchor, text_8);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_42 = $.sibling(node_41, 2);

																$.each(node_42, 16, () => alignments, (alignment) => alignment, ($$anchor, alignment) => {
																	const Icon = $.derived(() => alignment.icon);
																	var fragment_31 = $.comment();
																	var node_43 = $.first_child(fragment_31);

																	$.component(node_43, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_4) => {
																		DropdownMenu_Item_4($$anchor, {
																			onclick: () => {
																				if ($.get(currentNode) && $.get(currentNodePos) && editor) alignment.turnInto?.(editor, $.get(currentNode), $.get(currentNodePos));
																			},

																			children: ($$anchor, $$slotProps) => {
																				var fragment_32 = root_5();
																				var node_44 = $.first_child(fragment_32);

																				$.component(node_44, () => $.get(Icon), ($$anchor, Icon_2) => {
																					Icon_2($$anchor, {});
																				});

																				var text_9 = $.sibling(node_44);
																				var node_45 = $.sibling(text_9);

																				$.component(node_45, () => DropdownMenu.Shortcut, ($$anchor, DropdownMenu_Shortcut_1) => {
																					DropdownMenu_Shortcut_1($$anchor, {
																						class: 'rounded border bg-background p-0.5',
																						children: ($$anchor, $$slotProps) => {
																							$.next();

																							var text_10 = $.text();

																							$.template_effect(() => $.set_text(text_10, alignment.shortCut));
																							$.append($$anchor, text_10);
																						},
																						$$slots: { default: true }
																					});
																				});

																				$.template_effect(() => $.set_text(text_9, ` ${alignment.tooltip ?? ''} `));
																				$.append($$anchor, fragment_32);
																			},
																			$$slots: { default: true }
																		});
																	});

																	$.append($$anchor, fragment_31);
																});

																$.append($$anchor, fragment_30);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_28);
												},
												$$slots: { default: true }
											});
										});

										var node_46 = $.sibling(node_37, 2);

										$.component(node_46, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_2) => {
											DropdownMenu_Separator_2($$anchor, {});
										});

										var node_47 = $.sibling(node_46, 2);

										$.component(node_47, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_5) => {
											DropdownMenu_Item_5($$anchor, {
												onclick: insertNode,
												children: ($$anchor, $$slotProps) => {
													var fragment_34 = root_10();
													var node_48 = $.first_child(fragment_34);

													Plus(node_48, {});
													$.next();
													$.append($$anchor, fragment_34);
												},
												$$slots: { default: true }
											});
										});

										var node_49 = $.sibling(node_47, 2);

										$.component(node_49, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_6) => {
											DropdownMenu_Item_6($$anchor, {
												onclick: handleRemoveFormatting,
												children: ($$anchor, $$slotProps) => {
													var fragment_35 = root_11();
													var node_50 = $.first_child(fragment_35);

													RemoveFormatting(node_50, {});
													$.next();
													$.append($$anchor, fragment_35);
												},
												$$slots: { default: true }
											});
										});

										var node_51 = $.sibling(node_49, 2);

										$.component(node_51, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_3) => {
											DropdownMenu_Separator_3($$anchor, {});
										});

										var node_52 = $.sibling(node_51, 2);

										$.component(node_52, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_7) => {
											DropdownMenu_Item_7($$anchor, {
												onclick: handleDuplicate,
												children: ($$anchor, $$slotProps) => {
													var fragment_36 = root_12();
													var node_53 = $.first_child(fragment_36);

													Duplicate(node_53, {});
													$.next();
													$.append($$anchor, fragment_36);
												},
												$$slots: { default: true }
											});
										});

										var node_54 = $.sibling(node_52, 2);

										$.component(node_54, () => DropdownMenu.Sub, ($$anchor, DropdownMenu_Sub_3) => {
											DropdownMenu_Sub_3($$anchor, {
												children: ($$anchor, $$slotProps) => {
													var fragment_37 = root_5();
													var node_55 = $.first_child(fragment_37);

													$.component(node_55, () => DropdownMenu.SubTrigger, ($$anchor, DropdownMenu_SubTrigger_3) => {
														DropdownMenu_SubTrigger_3($$anchor, {
															children: ($$anchor, $$slotProps) => {
																var fragment_38 = root_13();
																var node_56 = $.first_child(fragment_38);

																Clipboard(node_56, {});
																$.next();
																$.append($$anchor, fragment_38);
															},
															$$slots: { default: true }
														});
													});

													var node_57 = $.sibling(node_55, 2);

													$.component(node_57, () => DropdownMenu.Content, ($$anchor, DropdownMenu_Content_2) => {
														DropdownMenu_Content_2($$anchor, {
															side: 'right',
															children: ($$anchor, $$slotProps) => {
																var fragment_39 = root_17();
																var node_58 = $.first_child(fragment_39);

																$.component(node_58, () => DropdownMenu.Label, ($$anchor, DropdownMenu_Label_4) => {
																	DropdownMenu_Label_4($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_11 = $.text('Copy as');

																			$.append($$anchor, text_11);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_59 = $.sibling(node_58, 2);

																$.component(node_59, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_8) => {
																	DropdownMenu_Item_8($$anchor, {
																		onclick: handleCopyToClipboard,
																		children: ($$anchor, $$slotProps) => {
																			var fragment_40 = root_14();
																			var node_60 = $.first_child(fragment_40);

																			Clipboard(node_60, {});
																			$.next();
																			$.append($$anchor, fragment_40);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_61 = $.sibling(node_59, 2);

																$.component(node_61, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_9) => {
																	DropdownMenu_Item_9($$anchor, {
																		onclick: () => handleCopyContentAs('markdown'),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_41 = root_15();

																			$.next();
																			$.append($$anchor, fragment_41);
																		},
																		$$slots: { default: true }
																	});
																});

																var node_62 = $.sibling(node_61, 2);

																$.component(node_62, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_10) => {
																	DropdownMenu_Item_10($$anchor, {
																		onclick: () => handleCopyContentAs('json'),
																		children: ($$anchor, $$slotProps) => {
																			var fragment_42 = root_16();
																			var node_63 = $.first_child(fragment_42);

																			Braces(node_63, {});
																			$.next();
																			$.append($$anchor, fragment_42);
																		},
																		$$slots: { default: true }
																	});
																});

																$.append($$anchor, fragment_39);
															},
															$$slots: { default: true }
														});
													});

													$.append($$anchor, fragment_37);
												},
												$$slots: { default: true }
											});
										});

										var node_64 = $.sibling(node_54, 2);

										$.component(node_64, () => DropdownMenu.Separator, ($$anchor, DropdownMenu_Separator_4) => {
											DropdownMenu_Separator_4($$anchor, {});
										});

										var node_65 = $.sibling(node_64, 2);

										$.component(node_65, () => DropdownMenu.Item, ($$anchor, DropdownMenu_Item_11) => {
											DropdownMenu_Item_11($$anchor, {
												onclick: handleDelete,
												children: ($$anchor, $$slotProps) => {
													var fragment_43 = root_18();
													var node_66 = $.first_child(fragment_43);

													Delete(node_66, { class: 'text-destructive' });
													$.next();
													$.append($$anchor, fragment_43);
												},
												$$slots: { default: true }
											});
										});

										$.append($$anchor, fragment_3);
									},
									$$slots: { default: true }
								});
							});
						}

						$.append($$anchor, fragment_2);
					},
					$$slots: { default: true }
				});
			});

			$.append($$anchor, fragment_1);
		};

		$.if(node_1, ($$render) => {
			if (type() === 'extended') $$render(consequent_3);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));
	$.template_effect(($0) => $.set_class(div, 1, $0), [() => $.clsx(cn('z-0!', $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}