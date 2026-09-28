import * as $ from 'svelte/internal/server';
import { quickcolors } from '../../../utils.ts';
import Popover from '../../primitives/Popover.svelte';
import ChevronDown from '@lucide/svelte/icons/chevron-down';
import Tooltip from '../Tooltip.svelte';
import { getEditor, useEditorState } from '../../../tiptap/index.js';

export default function Colors($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		var $$store_subs;
		let open = false;
		const editor = getEditor();

		const editorState = useEditorState({
			editor,
			selector: ({ editor }) => ({
				currentColor: editor.getAttributes('textStyle').color,
				currentHighlight: editor.getAttributes('highlight').color,
				isActive(name, opts) {
					return editor.isActive(name, opts) ?? false;
				}
			})
		});

		const currentColor = $.derived(() => $.store_get($$store_subs ??= {}, '$editorState', editorState).currentColor);
		const currentHighlight = $.derived(() => $.store_get($$store_subs ??= {}, '$editorState', editorState).currentHighlight);
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			{
				function trigger($$renderer) {
					Tooltip($$renderer, {
						tooltip: 'Quick Colors',
						children: ($$renderer) => {
							$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon colors-trigger svelte-1wtg13v"${$.attr_style(`color: ${currentColor() || 'inherit'}; background-color: ${currentHighlight() ? currentHighlight() + '75' : 'transparent'};`)}><span>A</span> `);
							ChevronDown($$renderer, { class: 'chevron-icon' });
							$$renderer.push(`<!----></button>`);
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
						$$renderer.push(`<div class="colors-panel svelte-1wtg13v"><div class="title svelte-1wtg13v">Text Colors</div> <div class="colors-grid svelte-1wtg13v"><!--[-->`);

						const each_array = $.ensure_array_like(quickcolors);

						for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
							let color = each_array[$$index];

							$$renderer.push(`<button class="color-btn svelte-1wtg13v"${$.attr_style(`color: ${color.value}; background-color: ${color.value}30; border-color: ${$.store_get($$store_subs ??= {}, '$editorState', editorState).isActive('textStyle', { color: color.value })
								? 'var(--edra-ink)'
								: color.value || 'var(--edra-border)'};`)}${$.attr('title', color.label)}>A</button>`);
						}

						$$renderer.push(`<!--]--></div> <div class="title margin-top svelte-1wtg13v">Background Colors</div> <div class="colors-grid svelte-1wtg13v"><!--[-->`);

						const each_array_1 = $.ensure_array_like(quickcolors);

						for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
							let color = each_array_1[$$index_1];

							$$renderer.push(`<button class="color-btn svelte-1wtg13v"${$.attr_style(`background-color: ${color.value ? color.value + '50' : 'transparent'}; border-color: ${$.store_get($$store_subs ??= {}, '$editorState', editorState).isActive('highlight', { color: color.value }) ? 'var(--edra-ink)' : 'var(--edra-border)'};`)}${$.attr('title', color.label)}>A</button>`);
						}

						$$renderer.push(`<!--]--></div></div>`);
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

		if ($$store_subs) $.unsubscribe_stores($$store_subs);
	});
}