import * as $ from 'svelte/internal/server';
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

export default function Drag_handle($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { type = 'simple', class: className } = $$props;
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

		let currentNode = null;
		let currentNodePos = -1;
		let open = false;
		const pluginKey = 'globalDragHandle';
		let element = document.createElement('div');
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		function useAI() {
			void transaction.version;

			return editor.extensionManager.extensions.some((e) => e.name === 'ai-highlight' && e.options?.callAI != null);
		}

		onMount(() => {
			const plugin = DragHandlePlugin({
				element,
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
			if (data.node) currentNode = data.node;

			currentNodePos = data.pos;
		};

		const handleRemoveFormatting = () => {
			const chain = editor?.chain();

			chain?.setNodeSelection(currentNodePos).unsetAllMarks();
			chain?.setParagraph();
			chain?.run();
		};

		const handleDuplicate = () => {
			editor?.commands.setNodeSelection(currentNodePos);

			const selectedNode = editor?.state.selection.$anchor.node(1) || (editor?.state.selection).node;

			editor?.chain().setMeta('hideDragHandle', true).insertContentAt(currentNodePos + (currentNode?.nodeSize || 0), selectedNode.toJSON()).run();
		};

		const handleCopyToClipboard = () => {
			editor?.chain().setMeta('hideDragHandle', true).setNodeSelection(currentNodePos).run();

			/**
			 * !FIXME: document.execCommand is deprecated, use navigator.clipboard.writeText instead
			 */
			document.execCommand('copy');
		};

		const handleCopyContentAs = (as) => {
			let data = '';
			let nodeData = currentNode?.toJSON();

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
			editor?.chain().setMeta('hideDragHandle', true).setNodeSelection(currentNodePos).deleteSelection().run();
		};

		function handleAIHighlight() {
			if (currentNodePos === -1) return;

			editor.chain().setNodeSelection(currentNodePos).setAIHighlight({ color: 'var(--color-muted)' }).run();
		}

		const insertNode = () => {
			if (currentNodePos === -1) return;

			const currentNodeSize = currentNode?.nodeSize || 0;
			const insertPos = currentNodePos + currentNodeSize;
			const currentNodeIsEmptyParagraph = currentNode?.type.name === 'paragraph' && currentNode?.content?.size === 0;
			const focusPos = currentNodeIsEmptyParagraph ? currentNodePos + 2 : insertPos + 2;

			editor?.chain().command(({ dispatch, tr, state }) => {
				if (dispatch) {
					if (currentNodeIsEmptyParagraph) {
						tr.insertText('/', currentNodePos, currentNodePos + 1);
					} else {
						tr.insert(insertPos, state.schema.nodes.paragraph.create(null, [state.schema.text('/')]));
					}

					return dispatch(tr);
				}

				return true;
			}).focus(focusPos).run();
		};

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div${$.attr_class($.clsx(cn('z-0!', className)))} style="visibility: hidden;">`);

			Button($$renderer, {
				variant: 'ghost',
				class: 'z-0! size-7! rounded-sm opacity-60 hover:opacity-100 focus-visible:opacity-100 active:opacity-100',
				onclick: () => open = !open,
				children: ($$renderer) => {
					GripVertical($$renderer, {});
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			if (type === 'extended') {
				$$renderer.push('<!--[0-->');

				if (DropdownMenu.Root) {
					$$renderer.push('<!--[-->');

					DropdownMenu.Root($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (DropdownMenu.Trigger) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Trigger($$renderer, {
									class: 'sr-only',
									children: ($$renderer) => {
										$$renderer.push(`<span>Drag Handle</span>`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (DropdownMenu.Content) {
								$$renderer.push('<!--[-->');

								DropdownMenu.Content($$renderer, {
									class: 'w-fit',
									portalProps: { to: element },
									children: ($$renderer) => {
										if (DropdownMenu.Group) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.GroupHeading) {
														$$renderer.push('<!--[-->');

														DropdownMenu.GroupHeading($$renderer, {
															class: 'text-muted-foreground capitalize',
															children: ($$renderer) => {
																$$renderer.push(`<!---->${$.escape(currentNode?.type.name)}`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (useAI()) {
														$$renderer.push('<!--[0-->');

														if (DropdownMenu.Item) {
															$$renderer.push('<!--[-->');

															DropdownMenu.Item($$renderer, {
																onmousedown: (e) => e.preventDefault(),
																onclick: handleAIHighlight,
																children: ($$renderer) => {
																	Sparkles($$renderer, {});
																	$$renderer.push(`<!----> <span class="bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text font-bold text-transparent">Edit With AI</span>`);
																},
																$$slots: { default: true }
															});

															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}
													} else {
														$$renderer.push('<!--[-1-->');
													}

													$$renderer.push(`<!--]--> `);

													if (DropdownMenu.Sub) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Sub($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.SubTrigger) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.SubTrigger($$renderer, {
																		openDelay: 300,
																		children: ($$renderer) => {
																			Repeat2($$renderer, {});
																			$$renderer.push(`<!----> Turn Into`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.SubContent) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.SubContent($$renderer, {
																		class: 'max-h-96 w-fit overflow-y-scroll rounded-lg duration-300',
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array = $.ensure_array_like(Object.entries(turnIntos));

																			for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
																				let [key, turnIntoCommands] = each_array[$$index_1];

																				if (DropdownMenu.Group) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Group($$renderer, {
																						children: ($$renderer) => {
																							if (DropdownMenu.Label) {
																								$$renderer.push('<!--[-->');

																								DropdownMenu.Label($$renderer, {
																									class: 'capitalize',
																									children: ($$renderer) => {
																										$$renderer.push(`<!---->${$.escape(key)}`);
																									},
																									$$slots: { default: true }
																								});

																								$$renderer.push('<!--]-->');
																							} else {
																								$$renderer.push('<!--[!-->');
																								$$renderer.push('<!--]-->');
																							}

																							$$renderer.push(` <!--[-->`);

																							const each_array_1 = $.ensure_array_like(turnIntoCommands);

																							for (let $$index = 0, $$length = each_array_1.length; $$index < $$length; $$index++) {
																								let command = each_array_1[$$index];
																								const Icon = command.icon;

																								if (DropdownMenu.Item) {
																									$$renderer.push('<!--[-->');

																									DropdownMenu.Item($$renderer, {
																										onclick: () => {
																											if (currentNode && currentNodePos && editor) command.turnInto?.(editor, currentNode, currentNodePos);
																										},

																										children: ($$renderer) => {
																											if (Icon) {
																												$$renderer.push('<!--[-->');
																												Icon($$renderer, {});
																												$$renderer.push('<!--]-->');
																											} else {
																												$$renderer.push('<!--[!-->');
																												$$renderer.push('<!--]-->');
																											}

																											$$renderer.push(` <span>${$.escape(command.tooltip)}</span> `);

																											if (command.shortCut) {
																												$$renderer.push('<!--[0-->');

																												if (DropdownMenu.Shortcut) {
																													$$renderer.push('<!--[-->');

																													DropdownMenu.Shortcut($$renderer, {
																														class: 'rounded border bg-background p-0.5',
																														children: ($$renderer) => {
																															$$renderer.push(`<!---->${$.escape(command.shortCut)}`);
																														},
																														$$slots: { default: true }
																													});

																													$$renderer.push('<!--]-->');
																												} else {
																													$$renderer.push('<!--[!-->');
																													$$renderer.push('<!--]-->');
																												}
																											} else {
																												$$renderer.push('<!--[-1-->');
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
																							}

																							$$renderer.push(`<!--]--> `);

																							if (key !== Object.keys(turnIntos).at(-1)) {
																								$$renderer.push('<!--[0-->');

																								if (DropdownMenu.Separator) {
																									$$renderer.push('<!--[-->');
																									DropdownMenu.Separator($$renderer, {});
																									$$renderer.push('<!--]-->');
																								} else {
																									$$renderer.push('<!--[!-->');
																									$$renderer.push('<!--]-->');
																								}
																							} else {
																								$$renderer.push('<!--[-1-->');
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

										$$renderer.push(` `);

										if (DropdownMenu.Sub) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Sub($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.SubTrigger) {
														$$renderer.push('<!--[-->');

														DropdownMenu.SubTrigger($$renderer, {
															openDelay: 300,
															children: ($$renderer) => {
																Palette($$renderer, {});
																$$renderer.push(`<!----> Colors`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Content) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Content($$renderer, {
															side: 'right',
															class: 'max-h-96 min-w-fit overflow-auto rounded-lg duration-300',
															children: ($$renderer) => {
																if (DropdownMenu.Group) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Group($$renderer, {
																		children: ($$renderer) => {
																			if (DropdownMenu.Label) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Label($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Texts`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` <!--[-->`);

																			const each_array_2 = $.ensure_array_like(quickcolors);

																			for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
																				let color = each_array_2[$$index_2];

																				if (DropdownMenu.Item) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Item($$renderer, {
																						title: color.value,
																						onclick: () => {
																							if (color.value === '' || color.label === 'Default') editor?.chain().setNodeSelection(currentNodePos).unsetColor().run(); else editor?.chain().setNodeSelection(currentNodePos).setColor(color.value).run();
																						},

																						children: ($$renderer) => {
																							$$renderer.push(`<span${$.attr_style(`color: ${color.value};`)}>A</span> <span class="capitalize">${$.escape(color.label)}</span>`);
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

																$$renderer.push(` `);

																if (DropdownMenu.Separator) {
																	$$renderer.push('<!--[-->');
																	DropdownMenu.Separator($$renderer, {});
																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Group) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Group($$renderer, {
																		class: 'min-w-fit',
																		children: ($$renderer) => {
																			if (DropdownMenu.Label) {
																				$$renderer.push('<!--[-->');

																				DropdownMenu.Label($$renderer, {
																					children: ($$renderer) => {
																						$$renderer.push(`<!---->Background`);
																					},
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}

																			$$renderer.push(` <!--[-->`);

																			const each_array_3 = $.ensure_array_like(quickcolors);

																			for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
																				let color = each_array_3[$$index_3];

																				if (DropdownMenu.Item) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Item($$renderer, {
																						title: color.value,
																						onclick: () => {
																							if (color.value === '' || color.label === 'Default') editor?.chain().setNodeSelection(currentNodePos).unsetHighlight().run(); else editor?.chain().setNodeSelection(currentNodePos).setHighlight({ color: `${color.value}50` }).run();
																						},

																						children: ($$renderer) => {
																							$$renderer.push(`<span class="size-4 rounded-full border"${$.attr_style(`background-color: ${`${color.value}50`};`)}></span> <span class="capitalize">${$.escape(color.label)}</span>`);
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

										$$renderer.push(` `);

										if (DropdownMenu.Sub) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Sub($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.SubTrigger) {
														$$renderer.push('<!--[-->');

														DropdownMenu.SubTrigger($$renderer, {
															openDelay: 300,
															children: ($$renderer) => {
																TextAlignCenter($$renderer, {});
																$$renderer.push(`<!----> AlignMent`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.SubContent) {
														$$renderer.push('<!--[-->');

														DropdownMenu.SubContent($$renderer, {
															children: ($$renderer) => {
																if (DropdownMenu.Label) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Label($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Alignments`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` <!--[-->`);

																const each_array_4 = $.ensure_array_like(alignments);

																for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
																	let alignment = each_array_4[$$index_4];
																	const Icon = alignment.icon;

																	if (DropdownMenu.Item) {
																		$$renderer.push('<!--[-->');

																		DropdownMenu.Item($$renderer, {
																			onclick: () => {
																				if (currentNode && currentNodePos && editor) alignment.turnInto?.(editor, currentNode, currentNodePos);
																			},

																			children: ($$renderer) => {
																				if (Icon) {
																					$$renderer.push('<!--[-->');
																					Icon($$renderer, {});
																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
																				}

																				$$renderer.push(` ${$.escape(alignment.tooltip)} `);

																				if (DropdownMenu.Shortcut) {
																					$$renderer.push('<!--[-->');

																					DropdownMenu.Shortcut($$renderer, {
																						class: 'rounded border bg-background p-0.5',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(alignment.shortCut)}`);
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
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Separator) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: insertNode,
												children: ($$renderer) => {
													Plus($$renderer, {});
													$$renderer.push(`<!----> Insert Next`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: handleRemoveFormatting,
												children: ($$renderer) => {
													RemoveFormatting($$renderer, {});
													$$renderer.push(`<!----> Remove Formatting`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Separator) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: handleDuplicate,
												children: ($$renderer) => {
													Duplicate($$renderer, {});
													$$renderer.push(`<!----> Duplicate`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Sub) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Sub($$renderer, {
												children: ($$renderer) => {
													if (DropdownMenu.SubTrigger) {
														$$renderer.push('<!--[-->');

														DropdownMenu.SubTrigger($$renderer, {
															children: ($$renderer) => {
																Clipboard($$renderer, {});
																$$renderer.push(`<!----> Copy to Clipboard`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (DropdownMenu.Content) {
														$$renderer.push('<!--[-->');

														DropdownMenu.Content($$renderer, {
															side: 'right',
															children: ($$renderer) => {
																if (DropdownMenu.Label) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Label($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Copy as`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: handleCopyToClipboard,
																		children: ($$renderer) => {
																			Clipboard($$renderer, {});
																			$$renderer.push(`<!----> Copy Content`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: () => handleCopyContentAs('markdown'),
																		children: ($$renderer) => {
																			$$renderer.push(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M2.491 4.046a.75.75 0 0 1 .83.218L7 8.592l3.678-4.328A.75.75 0 0 1 12 4.75v9.5a.75.75 0 0 1-1.5 0V6.79l-2.929 3.446a.75.75 0 0 1-1.142 0L3.5 6.79v7.46a.75.75 0 0 1-1.5 0v-9.5a.75.75 0 0 1 .491-.704M13.22 11.72a.75.75 0 0 1 1.06 0l.72.72V4.75a.75.75 0 0 1 1.5 0v7.69l.72-.72a.75.75 0 1 1 1.06 1.06l-2 2a.75.75 0 0 1-1.06 0l-2-2a.75.75 0 0 1 0-1.06"></path></svg> Copy as Markdown`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (DropdownMenu.Item) {
																	$$renderer.push('<!--[-->');

																	DropdownMenu.Item($$renderer, {
																		onclick: () => handleCopyContentAs('json'),
																		children: ($$renderer) => {
																			Braces($$renderer, {});
																			$$renderer.push(`<!----> Copy as JSON`);
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

										if (DropdownMenu.Separator) {
											$$renderer.push('<!--[-->');
											DropdownMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (DropdownMenu.Item) {
											$$renderer.push('<!--[-->');

											DropdownMenu.Item($$renderer, {
												onclick: handleDelete,
												children: ($$renderer) => {
													Delete($$renderer, { class: 'text-destructive' });
													$$renderer.push(`<!----> Delete`);
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
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}