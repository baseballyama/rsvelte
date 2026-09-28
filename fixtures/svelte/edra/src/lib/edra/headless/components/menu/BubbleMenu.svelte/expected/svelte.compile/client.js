import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
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

var root = $.from_html(`<button class="edra-btn edra-btn-ghost edra-btn-icon"><!></button>`);
var root_1 = $.from_html(`<!> <div class="edra-separator" role="separator" aria-orientation="vertical"></div>`, 1);
var root_2 = $.from_html(`<span></span>`);
var root_3 = $.from_html(`<button><!></button>`);
var root_4 = $.from_html(`<!> <!> <!> <!>`, 1);

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

	{
		let $0 = $.derived(() => ({
			shift: true,
			autoPlacement: { allowedPlacements: ['top', 'top-end', 'top-start'] },
			strategy: 'absolute',
			scrollTarget: editor.view.dom.parentElement ?? window
		}));

		let $1 = $.derived(() => cn('bubble-menu-panel', $$props.class));

		BubbleMenu($$anchor, {
			pluginKey: 'edra-bubble-menu',
			get editor() {
				return editor;
			},

			shouldShow: (props) => {
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
			},

			get options() {
				return $.get($0);
			},

			get class() {
				return $.get($1);
			},

			children: ($$anchor, $$slotProps) => {
				var fragment_1 = root_4();
				var node_1 = $.first_child(fragment_1);

				{
					var consequent = ($$anchor) => {
						var fragment_2 = root_1();
						var node_2 = $.first_child(fragment_2);

						Tooltip(node_2, {
							tooltip: 'Use AI',
							children: ($$anchor, $$slotProps) => {
								var button = root();
								var node_3 = $.child(button);

								WandSparkles(node_3, {});
								$.reset(button);

								$.delegated('mousedown', button, (e) => {
									e.preventDefault();
									addAIHighlight(editor);
								});

								$.append($$anchor, button);
							},
							$$slots: { default: true }
						});

						$.next(2);
						$.append($$anchor, fragment_2);
					};

					var d = $.derived(() => useAI());

					$.if(node_1, ($$render) => {
						if ($.get(d)) $$render(consequent);
					});
				}

				var node_4 = $.sibling(node_1, 2);

				$.each(node_4, 16, () => commandsKeys, (key) => key, ($$anchor, key) => {
					const group = $.derived(() => commands[key]);
					var fragment_3 = $.comment();
					var node_5 = $.first_child(fragment_3);

					{
						var consequent_1 = ($$anchor) => {
							Lists($$anchor, {});
						};

						var consequent_2 = ($$anchor) => {
							AlignMent($$anchor, {});
						};

						var alternate_1 = ($$anchor) => {
							var fragment_6 = root_1();
							var node_6 = $.first_child(fragment_6);

							$.each(node_6, 17, () => $.get(group), $.index, ($$anchor, command) => {
								var fragment_7 = $.comment();
								var node_7 = $.first_child(fragment_7);

								{
									var consequent_3 = ($$anchor) => {
										var span = root_2();

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
													var button_1 = root_3();
													var node_8 = $.child(button_1);

													$.component(node_8, () => $.get(Icon), ($$anchor, Icon_1) => {
														Icon_1($$anchor, {});
													});

													$.reset(button_1);

													$.template_effect(
														($0, $1) => {
															$.set_class(button_1, 1, `edra-btn edra-btn-ghost edra-btn-icon ${$0 ?? ''}`, 'svelte-szouqa');
															button_1.disabled = $1;
														},
														[
															() => isActive($.get(command)) ? 'active' : '',
															() => !isClickable($.get(command))
														]
													);

													$.delegated('click', button_1, () => {
														$.get(command).onClick?.(editor);
													});

													$.append($$anchor, button_1);
												},
												$$slots: { default: true }
											});
										}
									};

									$.if(node_7, ($$render) => {
										if ($.get(command).name === 'paragraph') $$render(consequent_3); else if ($.get(command).name === 'link') $$render(consequent_4, 1); else $$render(alternate, -1);
									});
								}

								$.append($$anchor, fragment_7);
							});

							$.next(2);
							$.append($$anchor, fragment_6);
						};

						$.if(node_5, ($$render) => {
							if (key === 'lists') $$render(consequent_1); else if (key === 'alignment') $$render(consequent_2, 1); else $$render(alternate_1, -1);
						});
					}

					$.append($$anchor, fragment_3);
				});

				var node_9 = $.sibling(node_4, 2);

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

$.delegate(['mousedown', 'click']);