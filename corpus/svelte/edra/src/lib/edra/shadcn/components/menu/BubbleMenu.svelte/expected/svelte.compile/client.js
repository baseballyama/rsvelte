import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from '$lib/components/ui/button/index.js';
import { Separator } from '$lib/components/ui/separator/index.js';
import { commands } from '../../../commands/index.js';

import {
	addAIHighlight,
	BubbleMenu,
	getEditor,
	isTextSelection,
	useEditorTransaction
} from '../../../tiptap/index.js';

import { cn } from '$lib/utils.js';
import { WandSparkles } from '@lucide/svelte';
import Colors from '../tools/Colors.svelte';
import Tooltip from '../Tooltip.svelte';
import Link from '../tools/Link.svelte';
import Lists from '../tools/Lists.svelte';
import FontSize from '../tools/FontSize.svelte';
import AlignMent from '../tools/AlignMent.svelte';

var root = $.from_html(`<span></span>`);
var root_1 = $.from_html(`<!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!>`, 1);

export default function BubbleMenu_1($$anchor, $$props) {
	$.push($$props, true);

	const editor = getEditor();
	const transaction = useEditorTransaction(editor);
	const commandsKeys = Object.keys(commands).filter((c) => !['media', 'table', 'diagram', 'undo-redo', 'headings'].includes(c));

	function useAI() {
		void transaction.version;

		return editor.extensionManager.extensions.some((e) => e.name === 'ai-highlight' && e.options?.callAI != null);
	}

	function isActive(command) {
		void transaction.version;

		return command.isActive?.(editor) ?? false;
	}

	function isClickable(command) {
		void transaction.version;

		return command.clickable?.(editor) ?? true;
	}

	const isTableGripSelected = (node) => {
		let container = node;

		while (container && !['TD', 'TH'].includes(container.tagName)) {
			container = container.parentElement;
		}

		const gripColumn = container && container.querySelector && container.querySelector('a.grip-column.selected');
		const gripRow = container && container.querySelector && container.querySelector('a.grip-row.selected');

		if (gripColumn || gripRow) {
			return true;
		}

		return false;
	};

	const shouldShow = (props) => {
		const { editor: propsEditor, view, state } = props;

		if (!propsEditor || !propsEditor.isEditable) return false;
		if (!view || view.dragging) return false;
		if (propsEditor.isActive('link')) return false;
		if (propsEditor.isActive('codeBlock')) return false;
		if (propsEditor.isActive('image-placeholder')) return false;
		if (propsEditor.isActive('video-placeholder')) return false;
		if (propsEditor.isActive('audio-placeholder')) return false;
		if (propsEditor.isActive('iframe-placeholder')) return false;
		if (propsEditor.isActive('image')) return false;
		if (propsEditor.isActive('video')) return false;
		if (propsEditor.isActive('iframe')) return false;
		if (propsEditor.isActive('audio')) return false;
		if (propsEditor.isActive('blockMath') || propsEditor.isActive('inlineMath')) return false;
		if (propsEditor.isActive('ai-highlight')) return false;
		if (propsEditor.isActive('mermaid')) return false;

		const { selection, doc } = state;
		const { empty, from, to } = selection;

		if (empty) return false;

		// check if the selection is a table grip
		const domAtPos = view.domAtPos(from || 0).node;

		const nodeDOM = view.nodeDOM(from || 0);
		const node = nodeDOM || domAtPos;

		if (isTableGripSelected(node)) {
			return false;
		}

		// Sometime check for `empty` is not enough.
		// Doubleclick an empty paragraph returns a node size of 2.
		// So we check also for an empty text size.
		const isEmptyTextBlock = !doc.textBetween(from, to).length && isTextSelection(selection);

		if (isEmptyTextBlock) return false;

		return true;
	};

	{
		let $0 = $.derived(() => ({
			shift: true,
			autoPlacement: { allowedPlacements: ['top', 'top-end', 'top-start'] },
			strategy: 'absolute',
			scrollTarget: editor.view.dom.parentElement ?? window
		}));

		let $1 = $.derived(() => cn('flex w-fit items-center rounded-lg border bg-popover', $$props.class));

		BubbleMenu($$anchor, {
			pluginKey: 'edra-bubble-menu',
			get editor() {
				return editor;
			},
			shouldShow,
			get options() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_2();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						Tooltip($$anchor, {
							tooltip: 'Use AI',
							children: ($$anchor, $$slotProps) => {
								Button($$anchor, {
									onmousedown: (e) => {
										e.preventDefault();
										addAIHighlight(editor);
									},
									variant: 'ghost',
									size: 'icon',
									children: ($$anchor, $$slotProps) => {
										WandSparkles($$anchor, {});
									},
									$$slots: { default: true }
								});
							},
							$$slots: { default: true }
						});
					};

					var d = $.derived(() => useAI());

					$.if(node_1, ($$render) => {
						if ($.get(d)) $$render(consequent);
					});
				}

				var node_2 = $.sibling(node_1, 2);

				Separator(node_2, { orientation: 'vertical', class: 'h-4!' });

				var node_3 = $.sibling(node_2, 2);

				$.each(node_3, 16, () => commandsKeys, (key) => key, ($$anchor, key) => {
					const group = $.derived(() => commands[key]);
					var fragment_5 = $.comment();
					var node_4 = $.first_child(fragment_5);

					{
						var consequent_1 = ($$anchor) => {
							Lists($$anchor, {});
						};

						var consequent_2 = ($$anchor) => {
							AlignMent($$anchor, {});
						};

						var alternate_1 = ($$anchor) => {
							var fragment_8 = root_1();
							var node_5 = $.first_child(fragment_8);

							$.each(node_5, 17, () => $.get(group), $.index, ($$anchor, command) => {
								var fragment_9 = $.comment();
								var node_6 = $.first_child(fragment_9);

								{
									var consequent_3 = ($$anchor) => {
										var span = root();

										$.append($$anchor, span);
									};

									var consequent_4 = ($$anchor) => {
										Link($$anchor, {});
									};

									var alternate = ($$anchor) => {
										const Icon = $.derived(() => $.get(command).icon);

										{
											let $0 = $.derived(() => $.get(command).shortCut ?? '');

											Tooltip($$anchor, {
												get tooltip() {
													return $.get(command).tooltip;
												},

												get shortCut() {
													return $.get($0);
												},

												children: ($$anchor, $$slotProps) => {
													{
														let $0 = $.derived(() => cn(isActive($.get(command)) && 'bg-muted text-primary'));
														let $1 = $.derived(() => !isClickable($.get(command)));

														Button($$anchor, {
															variant: 'ghost',
															size: 'icon',
															get class() {
																return $.get($0);
															},

															get disabled() {
																return $.get($1);
															},

															onclick: () => {
																$.get(command).onClick?.(editor);
															},

															children: ($$anchor, $$slotProps) => {
																var fragment_13 = $.comment();
																var node_7 = $.first_child(fragment_13);

																$.component(node_7, () => $.get(Icon), ($$anchor, Icon_1) => {
																	Icon_1($$anchor, {});
																});

																$.append($$anchor, fragment_13);
															},
															$$slots: { default: true }
														});
													}
												},
												$$slots: { default: true }
											});
										}
									};

									$.if(node_6, ($$render) => {
										if ($.get(command).name === 'paragraph') $$render(consequent_3); else if ($.get(command).name === 'link') $$render(consequent_4, 1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_9);
							});

							var node_8 = $.sibling(node_5, 2);

							Separator(node_8, { orientation: 'vertical', class: 'h-4!' });
							$.append($$anchor, fragment_8);
						};

						$.if(node_4, ($$render) => {
							if (key === 'lists') $$render(consequent_1); else if (key === 'alignment') $$render(consequent_2, 1); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_5);
				});

				var node_9 = $.sibling(node_3, 2);

				FontSize(node_9, {});

				var node_10 = $.sibling(node_9, 2);

				Colors(node_10, {});
				$.append($$anchor, fragment_1);
			},
			$$slots: { default: true }
		});
	}

	$.pop();
}