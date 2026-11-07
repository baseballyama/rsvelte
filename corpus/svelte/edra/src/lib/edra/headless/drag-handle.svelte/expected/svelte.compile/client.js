import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { autoPlacement } from '@floating-ui/dom';

import {
	Root,
	Trigger,
	Content,
	Label,
	Item,
	Shortcut,
	Separator,
	Sub,
	SubTrigger,
	SubContent
} from './primitives/dropdown/index.ts';

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
import { commands } from '../commands/index.js';
import { quickcolors } from '../utils.js';
import { getEditor, useEditorTransaction } from '../tiptap/index.ts';
import { cn } from '$lib/utils.js';

var root = $.from_html(`<!> <span class="text-ink font-bold svelte-1nuzr05">Edit With AI</span>`, 1);
var root_1 = $.from_html(`<!> <span>Turn Into</span>`, 1);
var root_2 = $.from_html(`<!> <span> </span> <!>`, 1);
var root_3 = $.from_html(`<!> <!> <!>`, 1);
var root_4 = $.from_html(`<!> <!>`, 1);
var root_5 = $.from_html(`<!> <span>Colors</span>`, 1);
var root_6 = $.from_html(`<span>A</span> <span class="capitalize-text svelte-1nuzr05"> </span>`, 1);
var root_7 = $.from_html(`<span class="color-circle svelte-1nuzr05"></span> <span class="capitalize-text svelte-1nuzr05"> </span>`, 1);
var root_8 = $.from_html(`<!> <!> <!> <!> <!>`, 1);
var root_9 = $.from_html(`<!> <span>AlignMent</span>`, 1);
var root_10 = $.from_html(`<!> <span>Insert Next</span>`, 1);
var root_11 = $.from_html(`<!> <span>Remove Formatting</span>`, 1);
var root_12 = $.from_html(`<!> <span>Duplicate</span>`, 1);
var root_13 = $.from_html(`<!> <span>Copy to Clipboard</span>`, 1);
var root_14 = $.from_html(`<!> <span>Copy Content</span>`, 1);
var root_15 = $.from_html(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 20 20" class="drag-icon"><path fill="currentColor" d="M2.491 4.046a.75.75 0 0 1 .83.218L7 8.592l3.678-4.328A.75.75 0 0 1 12 4.75v9.5a.75.75 0 0 1-1.5 0V6.79l-2.929 3.446a.75.75 0 0 1-1.142 0L3.5 6.79v7.46a.75.75 0 0 1-1.5 0v-9.5a.75.75 0 0 1 .491-.704M13.22 11.72a.75.75 0 0 1 1.06 0l.72.72V4.75a.75.75 0 0 1 1.5 0v7.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 0-1.06"></path></svg> <span>Copy as Markdown</span>`, 1);
var root_16 = $.from_html(`<!> <span>Copy as JSON</span>`, 1);
var root_17 = $.from_html(`<!> <!> <!> <!>`, 1);
var root_18 = $.from_html(`<!> <span>Delete</span>`, 1);
var root_19 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_20 = $.from_html(`<button class="trigger-btn"><!></button>`);
var root_21 = $.from_html(`<div style="visibility: hidden;"><!></div>`);

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

		editor.chain().setNodeSelection($.get(currentNodePos)).setAIHighlight({ color: 'var(--edra-canvas-soft-2)' }).run();
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

	var div = root_21();
	var node = $.child(div);

	{
		var consequent_3 = ($$anchor) => {
			Root($$anchor, {
				get open() {
					return $.get(open);
				},

				set open($$value) {
					$.set(open, $$value, true);
				},

				children: ($$anchor, $$slotProps) => {
					var fragment_1 = root_4();
					var node_1 = $.first_child(fragment_1);

					Trigger(node_1, {
						class: 'trigger-btn',
						children: ($$anchor, $$slotProps) => {
							GripVertical($$anchor, { class: 'drag-icon' });
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Content(node_2, {
						class: 'menu-content',
						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_19();
							var node_3 = $.first_child(fragment_3);

							Label(node_3, {
								class: 'label-text',
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text = $.text();

									$.template_effect(() => $.set_text(text, $.get(currentNode)?.type.name));
									$.append($$anchor, text);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							{
								var consequent = ($$anchor) => {
									Item($$anchor, {
										onclick: handleAIHighlight,
										children: ($$anchor, $$slotProps) => {
											var fragment_6 = root();
											var node_5 = $.first_child(fragment_6);

											Sparkles(node_5, { class: 'drag-icon' });
											$.next(2);
											$.append($$anchor, fragment_6);
										},
										$$slots: { default: true }
									});
								};

								var d = $.derived(() => useAI());

								$.if(node_4, ($$render) => {
									if ($.get(d)) $$render(consequent);
								});
							}

							var node_6 = $.sibling(node_4, 2);

							Sub(node_6, {
								children: ($$anchor, $$slotProps) => {
									var fragment_7 = root_4();
									var node_7 = $.first_child(fragment_7);

									SubTrigger(node_7, {
										children: ($$anchor, $$slotProps) => {
											var fragment_8 = root_1();
											var node_8 = $.first_child(fragment_8);

											Repeat2(node_8, { class: 'drag-icon' });
											$.next(2);
											$.append($$anchor, fragment_8);
										},
										$$slots: { default: true }
									});

									var node_9 = $.sibling(node_7, 2);

									SubContent(node_9, {
										class: 'sub-menu-scroll',
										children: ($$anchor, $$slotProps) => {
											var fragment_9 = $.comment();
											var node_10 = $.first_child(fragment_9);

											$.each(node_10, 17, () => Object.entries(turnIntos), ([key, turnIntoCommands]) => key, ($$anchor, $$item) => {
												var $$array = $.derived(() => $.to_array($.get($$item), 2));
												let key = () => $.get($$array)[0];
												let turnIntoCommands = () => $.get($$array)[1];
												var fragment_10 = root_3();
												var node_11 = $.first_child(fragment_10);

												Label(node_11, {
													class: 'capitalize-text',
													children: ($$anchor, $$slotProps) => {
														$.next();

														var text_1 = $.text();

														$.template_effect(() => $.set_text(text_1, key()));
														$.append($$anchor, text_1);
													},
													$$slots: { default: true }
												});

												var node_12 = $.sibling(node_11, 2);

												$.each(node_12, 16, turnIntoCommands, (command) => command, ($$anchor, command) => {
													const Icon = $.derived(() => command.icon);

													Item($$anchor, {
														onclick: () => {
															if ($.get(currentNode) && $.get(currentNodePos) && editor) command.turnInto?.(editor, $.get(currentNode), $.get(currentNodePos));
														},

														children: ($$anchor, $$slotProps) => {
															var fragment_13 = root_2();
															var node_13 = $.first_child(fragment_13);

															$.component(node_13, () => $.get(Icon), ($$anchor, Icon_1) => {
																Icon_1($$anchor, { class: 'drag-icon' });
															});

															var span = $.sibling(node_13, 2);
															var text_2 = $.only_child(span, true);
															var node_14 = $.sibling(span, 2);

															{
																var consequent_1 = ($$anchor) => {
																	Shortcut($$anchor, {
																		children: ($$anchor, $$slotProps) => {
																			$.next();

																			var text_3 = $.text();

																			$.template_effect(() => $.set_text(text_3, command.shortCut));
																			$.append($$anchor, text_3);
																		},
																		$$slots: { default: true }
																	});
																};

																$.if(node_14, ($$render) => {
																	if (command.shortCut) $$render(consequent_1);
																});
															}

															$.template_effect(() => $.set_text(text_2, command.tooltip));
															$.append($$anchor, fragment_13);
														},
														$$slots: { default: true }
													});
												});

												var node_15 = $.sibling(node_12, 2);

												{
													var consequent_2 = ($$anchor) => {
														Separator($$anchor, {});
													};

													var d_1 = $.derived(() => key() !== Object.keys(turnIntos).at(-1));

													$.if(node_15, ($$render) => {
														if ($.get(d_1)) $$render(consequent_2);
													});
												}

												$.append($$anchor, fragment_10);
											});

											$.append($$anchor, fragment_9);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_7);
								},
								$$slots: { default: true }
							});

							var node_16 = $.sibling(node_6, 2);

							Sub(node_16, {
								children: ($$anchor, $$slotProps) => {
									var fragment_17 = root_4();
									var node_17 = $.first_child(fragment_17);

									SubTrigger(node_17, {
										children: ($$anchor, $$slotProps) => {
											var fragment_18 = root_5();
											var node_18 = $.first_child(fragment_18);

											Palette(node_18, { class: 'drag-icon' });
											$.next(2);
											$.append($$anchor, fragment_18);
										},
										$$slots: { default: true }
									});

									var node_19 = $.sibling(node_17, 2);

									SubContent(node_19, {
										class: 'sub-menu-scroll',
										children: ($$anchor, $$slotProps) => {
											var fragment_19 = root_8();
											var node_20 = $.first_child(fragment_19);

											Label(node_20, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_4 = $.text('Texts');

													$.append($$anchor, text_4);
												},
												$$slots: { default: true }
											});

											var node_21 = $.sibling(node_20, 2);

											$.each(node_21, 17, () => quickcolors, (color) => color.label, ($$anchor, color) => {
												Item($$anchor, {
													onclick: () => {
														if ($.get(color).value === '' || $.get(color).label === 'Default') editor?.chain().setNodeSelection($.get(currentNodePos)).unsetColor().run(); else editor?.chain().setNodeSelection($.get(currentNodePos)).setColor($.get(color).value).run();
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_21 = root_6();
														var span_1 = $.first_child(fragment_21);
														var span_2 = $.sibling(span_1, 2);
														var text_5 = $.only_child(span_2, true);

														$.template_effect(() => {
															$.set_style(span_1, `color: ${$.get(color).value}; font-weight: bold;`);
															$.set_text(text_5, $.get(color).label);
														});

														$.append($$anchor, fragment_21);
													},
													$$slots: { default: true }
												});
											});

											var node_22 = $.sibling(node_21, 2);

											Separator(node_22, {});

											var node_23 = $.sibling(node_22, 2);

											Label(node_23, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_6 = $.text('Background');

													$.append($$anchor, text_6);
												},
												$$slots: { default: true }
											});

											var node_24 = $.sibling(node_23, 2);

											$.each(node_24, 17, () => quickcolors, (color) => color.label, ($$anchor, color) => {
												Item($$anchor, {
													onclick: () => {
														if ($.get(color).value === '' || $.get(color).label === 'Default') editor?.chain().setNodeSelection($.get(currentNodePos)).unsetHighlight().run(); else editor?.chain().setNodeSelection($.get(currentNodePos)).setHighlight({ color: `${$.get(color).value}50` }).run();
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_23 = root_7();
														var span_3 = $.first_child(fragment_23);
														var span_4 = $.sibling(span_3, 2);
														var text_7 = $.only_child(span_4, true);

														$.template_effect(() => {
															$.set_style(span_3, `background-color: ${`${$.get(color).value}50`};`);
															$.set_text(text_7, $.get(color).label);
														});

														$.append($$anchor, fragment_23);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_19);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_17);
								},
								$$slots: { default: true }
							});

							var node_25 = $.sibling(node_16, 2);

							Sub(node_25, {
								children: ($$anchor, $$slotProps) => {
									var fragment_24 = root_4();
									var node_26 = $.first_child(fragment_24);

									SubTrigger(node_26, {
										children: ($$anchor, $$slotProps) => {
											var fragment_25 = root_9();
											var node_27 = $.first_child(fragment_25);

											TextAlignCenter(node_27, { class: 'drag-icon' });
											$.next(2);
											$.append($$anchor, fragment_25);
										},
										$$slots: { default: true }
									});

									var node_28 = $.sibling(node_26, 2);

									SubContent(node_28, {
										children: ($$anchor, $$slotProps) => {
											var fragment_26 = root_4();
											var node_29 = $.first_child(fragment_26);

											Label(node_29, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_8 = $.text('Alignments');

													$.append($$anchor, text_8);
												},
												$$slots: { default: true }
											});

											var node_30 = $.sibling(node_29, 2);

											$.each(node_30, 16, () => alignments, (alignment) => alignment, ($$anchor, alignment) => {
												const Icon = $.derived(() => alignment.icon);

												Item($$anchor, {
													onclick: () => {
														if ($.get(currentNode) && $.get(currentNodePos) && editor) alignment.turnInto?.(editor, $.get(currentNode), $.get(currentNodePos));
													},

													children: ($$anchor, $$slotProps) => {
														var fragment_28 = root_2();
														var node_31 = $.first_child(fragment_28);

														$.component(node_31, () => $.get(Icon), ($$anchor, Icon_2) => {
															Icon_2($$anchor, { class: 'drag-icon' });
														});

														var span_5 = $.sibling(node_31, 2);
														var text_9 = $.only_child(span_5, true);
														var node_32 = $.sibling(span_5, 2);

														Shortcut(node_32, {
															children: ($$anchor, $$slotProps) => {
																$.next();

																var text_10 = $.text();

																$.template_effect(() => $.set_text(text_10, alignment.shortCut));
																$.append($$anchor, text_10);
															},
															$$slots: { default: true }
														});

														$.template_effect(() => $.set_text(text_9, alignment.tooltip));
														$.append($$anchor, fragment_28);
													},
													$$slots: { default: true }
												});
											});

											$.append($$anchor, fragment_26);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_24);
								},
								$$slots: { default: true }
							});

							var node_33 = $.sibling(node_25, 2);

							Separator(node_33, {});

							var node_34 = $.sibling(node_33, 2);

							Item(node_34, {
								onclick: insertNode,
								children: ($$anchor, $$slotProps) => {
									var fragment_30 = root_10();
									var node_35 = $.first_child(fragment_30);

									Plus(node_35, { class: 'drag-icon' });
									$.next(2);
									$.append($$anchor, fragment_30);
								},
								$$slots: { default: true }
							});

							var node_36 = $.sibling(node_34, 2);

							Item(node_36, {
								onclick: handleRemoveFormatting,
								children: ($$anchor, $$slotProps) => {
									var fragment_31 = root_11();
									var node_37 = $.first_child(fragment_31);

									RemoveFormatting(node_37, { class: 'drag-icon' });
									$.next(2);
									$.append($$anchor, fragment_31);
								},
								$$slots: { default: true }
							});

							var node_38 = $.sibling(node_36, 2);

							Separator(node_38, {});

							var node_39 = $.sibling(node_38, 2);

							Item(node_39, {
								onclick: handleDuplicate,
								children: ($$anchor, $$slotProps) => {
									var fragment_32 = root_12();
									var node_40 = $.first_child(fragment_32);

									Duplicate(node_40, { class: 'drag-icon' });
									$.next(2);
									$.append($$anchor, fragment_32);
								},
								$$slots: { default: true }
							});

							var node_41 = $.sibling(node_39, 2);

							Sub(node_41, {
								children: ($$anchor, $$slotProps) => {
									var fragment_33 = root_4();
									var node_42 = $.first_child(fragment_33);

									SubTrigger(node_42, {
										children: ($$anchor, $$slotProps) => {
											var fragment_34 = root_13();
											var node_43 = $.first_child(fragment_34);

											Clipboard(node_43, { class: 'drag-icon' });
											$.next(2);
											$.append($$anchor, fragment_34);
										},
										$$slots: { default: true }
									});

									var node_44 = $.sibling(node_42, 2);

									SubContent(node_44, {
										children: ($$anchor, $$slotProps) => {
											var fragment_35 = root_17();
											var node_45 = $.first_child(fragment_35);

											Label(node_45, {
												children: ($$anchor, $$slotProps) => {
													$.next();

													var text_11 = $.text('Copy as');

													$.append($$anchor, text_11);
												},
												$$slots: { default: true }
											});

											var node_46 = $.sibling(node_45, 2);

											Item(node_46, {
												onclick: handleCopyToClipboard,
												children: ($$anchor, $$slotProps) => {
													var fragment_36 = root_14();
													var node_47 = $.first_child(fragment_36);

													Clipboard(node_47, { class: 'drag-icon' });
													$.next(2);
													$.append($$anchor, fragment_36);
												},
												$$slots: { default: true }
											});

											var node_48 = $.sibling(node_46, 2);

											Item(node_48, {
												onclick: () => handleCopyContentAs('markdown'),
												children: ($$anchor, $$slotProps) => {
													var fragment_37 = root_15();

													$.next(2);
													$.append($$anchor, fragment_37);
												},
												$$slots: { default: true }
											});

											var node_49 = $.sibling(node_48, 2);

											Item(node_49, {
												onclick: () => handleCopyContentAs('json'),
												children: ($$anchor, $$slotProps) => {
													var fragment_38 = root_16();
													var node_50 = $.first_child(fragment_38);

													Braces(node_50, { class: 'drag-icon' });
													$.next(2);
													$.append($$anchor, fragment_38);
												},
												$$slots: { default: true }
											});

											$.append($$anchor, fragment_35);
										},
										$$slots: { default: true }
									});

									$.append($$anchor, fragment_33);
								},
								$$slots: { default: true }
							});

							var node_51 = $.sibling(node_41, 2);

							Separator(node_51, {});

							var node_52 = $.sibling(node_51, 2);

							Item(node_52, {
								onclick: handleDelete,
								class: 'delete-item',
								children: ($$anchor, $$slotProps) => {
									var fragment_39 = root_18();
									var node_53 = $.first_child(fragment_39);

									Delete(node_53, { class: 'drag-icon' });
									$.next(2);
									$.append($$anchor, fragment_39);
								},
								$$slots: { default: true }
							});

							$.append($$anchor, fragment_3);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_1);
				},
				$$slots: { default: true }
			});
		};

		var alternate = ($$anchor) => {
			var button = root_20();
			var node_54 = $.child(button);

			GripVertical(node_54, { class: 'drag-icon' });
			$.reset(button);
			$.append($$anchor, button);
		};

		$.if(node, ($$render) => {
			if (type() === 'extended') $$render(consequent_3); else $$render(alternate, -1);
		});
	}

	$.reset(div);
	$.bind_this(div, ($$value) => $.set(element, $$value), () => $.get(element));
	$.template_effect(($0) => $.set_class(div, 1, $0, 'svelte-1nuzr05'), [() => $.clsx(cn('drag-handle-container', $$props.class))]);
	$.append($$anchor, div);
	$.pop();
}