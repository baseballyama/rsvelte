import * as $ from 'svelte/internal/server';
import { commands } from '../../commands/index.js';
import { addAIHighlight, getEditor, useEditorTransaction } from '../../tiptap/index.js';
import { cn } from '$lib/utils.js';
import { WandSparkles } from '@lucide/svelte';
import Colors from './tools/Colors.svelte';
import Export from './tools/Export.svelte';
import Tooltip from './Tooltip.svelte';

export default function Toolbar($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const { class: className } = $$props;
		const editor = getEditor();
		const transaction = useEditorTransaction(editor);
		const commandsKeys = Object.keys(commands);

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

		$$renderer.push(`<div${$.attr_class($.clsx(cn('toolbar-container', className)), 'svelte-177aoc0')}>`);

		if (useAI()) {
			$$renderer.push('<!--[0-->');

			Tooltip($$renderer, {
				tooltip: 'Use AI',
				children: ($$renderer) => {
					$$renderer.push(`<button class="edra-btn edra-btn-ghost edra-btn-icon">`);
					WandSparkles($$renderer, {});
					$$renderer.push(`<!----></button>`);
				},
				$$slots: { default: true }
			});
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <!--[-->`);

		const each_array = $.ensure_array_like(commandsKeys);

		for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
			let key = each_array[$$index_1];
			const group = commands[key];

			$$renderer.push(`<!--[-->`);

			const each_array_1 = $.ensure_array_like(group);

			for (let idx = 0, $$length = each_array_1.length; idx < $$length; idx++) {
				let command = each_array_1[idx];
				const Icon = command.icon;

				Tooltip($$renderer, {
					tooltip: command.tooltip,
					shortCut: command.shortCut ?? '',
					children: ($$renderer) => {
						$$renderer.push(`<button${$.attr_class(`edra-btn edra-btn-ghost edra-btn-icon ${isActive(command) ? 'active' : ''}`, 'svelte-177aoc0')}${$.attr('disabled', !isClickable(command), true)}>`);

						if (Icon) {
							$$renderer.push('<!--[-->');
							Icon($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(`</button>`);
					},
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!--]--> <div class="edra-separator" role="separator" aria-orientation="vertical"></div>`);
		}

		$$renderer.push(`<!--]--> `);
		Colors($$renderer, {});
		$$renderer.push(`<!----> `);
		Export($$renderer, {});
		$$renderer.push(`<!----></div>`);
	});
}