import * as $ from 'svelte/internal/server';
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

export default function BubbleMenu_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { class: className } = $$props;
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

		BubbleMenu($$renderer, {
			pluginKey: 'edra-bubble-menu',
			editor,
			shouldShow,
			options: {
				shift: true,
				autoPlacement: { allowedPlacements: ['top', 'top-end', 'top-start'] },
				strategy: 'absolute',
				scrollTarget: editor.view.dom.parentElement ?? window
			},
			class: cn('flex w-fit items-center rounded-lg border bg-popover', className),
			children: ($$renderer) => {
				if (useAI()) {
					$$renderer.push('<!--[0-->');

					Tooltip($$renderer, {
						tooltip: 'Use AI',
						children: ($$renderer) => {
							Button($$renderer, {
								onmousedown: (e) => {
									e.preventDefault();
									addAIHighlight(editor);
								},
								variant: 'ghost',
								size: 'icon',
								children: ($$renderer) => {
									WandSparkles($$renderer, {});
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
				Separator($$renderer, { orientation: 'vertical', class: 'h-4!' });
				$$renderer.push(`<!----> <!--[-->`);

				const each_array = $.ensure_array_like(commandsKeys);

				for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
					let key = each_array[$$index_1];
					const group = commands[key];

					if (key === 'lists') {
						$$renderer.push('<!--[0-->');
						Lists($$renderer, {});
					} else if (key === 'alignment') {
						$$renderer.push('<!--[1-->');
						AlignMent($$renderer, {});
					} else {
						$$renderer.push(`<!--[-1--><!--[-->`);

						const each_array_1 = $.ensure_array_like(group);

						for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
							let command = each_array_1[idx];

							if (command.name === 'paragraph') {
								$$renderer.push(`<!--[0--><span></span>`);
							} else if (command.name === 'link') {
								$$renderer.push('<!--[1-->');
								Link($$renderer, {});
							} else {
								$$renderer.push('<!--[-1-->');

								const Icon = command.icon;

								Tooltip($$renderer, {
									tooltip: command.tooltip,
									shortCut: command.shortCut ?? '',
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'ghost',
											size: 'icon',
											class: cn(isActive(command) && 'bg-muted text-primary'),
											disabled: !isClickable(command),
											onclick: () => {
												command.onClick?.(editor);
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
											},
											$$slots: { default: true }
										});
									},
									$$slots: { default: true }
								});
							}

							$$renderer.push(`<!--]-->`);
						}

						$$renderer.push(`<!--]--> `);
						Separator($$renderer, { orientation: 'vertical', class: 'h-4!' });
						$$renderer.push(`<!---->`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--> `);
				FontSize($$renderer, {});
				$$renderer.push(`<!----> `);
				Colors($$renderer, {});
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}