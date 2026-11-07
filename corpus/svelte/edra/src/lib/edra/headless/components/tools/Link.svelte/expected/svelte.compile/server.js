import * as $ from 'svelte/internal/server';
import Popover from '../../primitives/Popover.svelte';
import Check from '@lucide/svelte/icons/check';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Link from '@lucide/svelte/icons/link-2';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorTransaction } from '../../../tiptap/index.js';

export default function Link_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let open = false;
		let value = void 0;
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);

		function isActive() {
			void transaction.version;

			return editor.isActive('link');
		}

		function handleSubmit(e) {
			e.preventDefault();

			if (value === undefined || value.trim() === '') return;

			editor.chain().focus().setLink({ href: value }).run();
			value = undefined;
			open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function trigger($$renderer) {
					Tooltip($$renderer, {
						tooltip: 'Link',
						children: ($$renderer) => {
							$$renderer.push(`<div${$.attr_class(`edra-btn edra-btn-ghost edra-btn-icon ${isActive() ? 'active' : ''}`, 'svelte-17hx3sz')}>`);
							Link($$renderer, {});
							$$renderer.push(`<!----> `);
							ChevronDown($$renderer, { class: 'chevron-icon' });
							$$renderer.push(`<!----></div>`);
						},
						$$slots: { default: true }
					});
				}

				Popover($$renderer, {
					get open() {
						return open;
					},

					set open($$value) {
						open = $$value;
						$$settled = false;
					},
					trigger,
					children: ($$renderer) => {
						$$renderer.push(`<form class="link-form svelte-17hx3sz"><input class="edra-input link-input svelte-17hx3sz" placeholder="Type or paste a link..."${$.attr('value', value)} required="" type="url"/> `);

						Tooltip($$renderer, {
							tooltip: 'Insert link',
							children: ($$renderer) => {
								$$renderer.push(`<button type="submit" class="edra-btn edra-btn-icon-xs check-btn svelte-17hx3sz">`);
								Check($$renderer, {});
								$$renderer.push(`<!----></button>`);
							},
							$$slots: { default: true }
						});

						$$renderer.push(`<!----></form>`);
					},
					$$slots: { trigger: true, default: true }
				});
			}
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}