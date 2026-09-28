import * as $ from 'svelte/internal/server';
import { Root, Trigger, Content, Label, Item, Shortcut } from '../../primitives/dropdown/index.ts';
import AlignLeft from '@lucide/svelte/icons/align-left';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { commands } from '../../../commands/index.js';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

export default function AlignMent($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const alignments = commands['alignment'];
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		const isActive = () => {
			void transaction.version;

			return alignments.find((h) => h.isActive?.(editor)) !== undefined;
		};

		const AlignmentIcon = () => {
			void transaction.version;

			const h = alignments.find((h) => h.isActive?.(editor));

			return h ? h.icon : AlignLeft;
		};

		Root($$renderer, {
			children: ($$renderer) => {
				Tooltip($$renderer, {
					tooltip: 'Alignment',
					children: ($$renderer) => {
						Trigger($$renderer, {
							class: `edra-btn edra-btn-ghost edra-btn-icon ${isActive() ? 'active' : ''}`,
							children: ($$renderer) => {
								const Icon = AlignmentIcon();

								if (Icon) {
									$$renderer.push('<!--[-->');
									Icon($$renderer, {});
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);
								ChevronDown($$renderer, { class: 'chevron-icon' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Content($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Alignments`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(alignments);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let alignment = each_array[$$index];
							const Icon = alignment.icon;

							Item($$renderer, {
								onclick: () => alignment.onClick?.(editor),
								children: ($$renderer) => {
									if (Icon) {
										$$renderer.push('<!--[-->');
										Icon($$renderer, { class: 'align-icon' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <span>${$.escape(alignment.tooltip)}</span> `);

									Shortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(alignment.shortCut)}`);
										},
										$$slots: { default: true }
									});

									$$renderer.push(`<!---->`);
								},
								$$slots: { default: true }
							});
						}

						$$renderer.push(`<!--]-->`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	});
}