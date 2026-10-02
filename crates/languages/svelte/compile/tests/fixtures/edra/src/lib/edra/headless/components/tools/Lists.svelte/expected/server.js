import * as $ from 'svelte/internal/server';
import { Root, Trigger, Content, Label, Item, Shortcut } from '../../primitives/dropdown/index.ts';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Minus from '@lucide/svelte/icons/minus';
import { commands } from '../../../commands/index.js';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';
import Tooltip from '../Tooltip.svelte';

export default function Lists($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const lists = commands['lists'];
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		const isActive = () => {
			void transaction.version;

			return lists.some((h) => h.isActive?.(editor));
		};

		const ListIcon = () => {
			void transaction.version;

			const h = lists.find((h) => h.isActive?.(editor));

			return h ? h.icon : Minus;
		};

		Root($$renderer, {
			children: ($$renderer) => {
				Tooltip($$renderer, {
					tooltip: 'Lists',
					children: ($$renderer) => {
						const Icon = ListIcon();

						Trigger($$renderer, {
							class: `edra-btn edra-btn-ghost edra-btn-icon ${isActive() ? 'active' : ''}`,
							children: ($$renderer) => {
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
								$$renderer.push(`<!---->Lists`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(lists);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let list = each_array[$$index];
							const Icon = list.icon;

							Item($$renderer, {
								onclick: () => list.onClick?.(editor),
								children: ($$renderer) => {
									if (Icon) {
										$$renderer.push('<!--[-->');
										Icon($$renderer, { class: 'list-icon' });
										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` <span>${$.escape(list.tooltip)}</span> `);

									Shortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(list.shortCut)}`);
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