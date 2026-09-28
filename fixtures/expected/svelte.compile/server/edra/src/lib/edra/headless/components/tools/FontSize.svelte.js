import * as $ from 'svelte/internal/server';
import { Root, Trigger, Content, Label, Item, Shortcut } from '../../primitives/dropdown/index.ts';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

export default function FontSize($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		const currentSize = () => {
			void transaction.version;

			return editor.getAttributes('textStyle').fontSize || '';
		};

		const FONT_SIZE = [
			{ label: 'Tiny', value: '0.7rem' },
			{ label: 'Smaller', value: '0.75rem' },
			{ label: 'Small', value: '0.9rem' },
			{ label: 'Default', value: '' },
			{ label: 'Large', value: '1.25rem' },
			{ label: 'Extra Large', value: '1.5rem' }
		];

		const currentLabel = $.derived(() => {
			const l = FONT_SIZE.find((f) => f.value === currentSize());

			if (l) return l.label.split(' ')[0];

			return 'Medium';
		});

		Root($$renderer, {
			children: ($$renderer) => {
				Tooltip($$renderer, {
					tooltip: 'Font Size',
					children: ($$renderer) => {
						Trigger($$renderer, {
							class: 'edra-btn edra-btn-ghost trigger-font-btn',
							children: ($$renderer) => {
								$$renderer.push(`<span>${$.escape(currentLabel())}</span> `);
								ChevronDown($$renderer, { class: 'chevron-icon' });
								$$renderer.push(`<!---->`);
							},
							$$slots: { default: true }
						});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				$$renderer.push(`<style>
		.trigger-font-btn {
			font-weight: 500;
		}
		:global(.chevron-icon) {
			color: var(--edra-mute);
			width: 0.5rem;
			height: 0.5rem;
		}
	</style>`);

				$$renderer.push(` `);

				Content($$renderer, {
					children: ($$renderer) => {
						Label($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Font Size`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----> <!--[-->`);

						const each_array = $.ensure_array_like(FONT_SIZE);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let fontSize = each_array[$$index];

							Item($$renderer, {
								onclick: () => {
									editor.chain().focus().setFontSize(fontSize.value).run();
								},

								children: ($$renderer) => {
									$$renderer.push(`<span>${$.escape(fontSize.label)}</span> `);

									Shortcut($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->${$.escape(fontSize.value || 'default')}`);
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