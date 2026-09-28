import * as $ from 'svelte/internal/server';
import BoldIcon from '@lucide/svelte/icons/bold';
import ItalicIcon from '@lucide/svelte/icons/italic';
import UnderlineIcon from '@lucide/svelte/icons/underline';
import { ToggleGroup } from '@skeletonlabs/skeleton-svelte';

export default function Controlled($$renderer) {
	let value = ['bold'];

	$$renderer.push(`<div class="flex flex-col items-center gap-4">`);

	ToggleGroup($$renderer, {
		value,
		onValueChange: (details) => value = details.value,
		multiple: true,
		children: ($$renderer) => {
			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'bold',
					children: ($$renderer) => {
						BoldIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'italic',
					children: ($$renderer) => {
						ItalicIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (ToggleGroup.Item) {
				$$renderer.push('<!--[-->');

				ToggleGroup.Item($$renderer, {
					value: 'underline',
					children: ($$renderer) => {
						UnderlineIcon($$renderer, { class: 'size-4' });
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

	$$renderer.push(`<!----> <p><span class="opacity-60">You selected</span> <code class="code">${$.escape(value.length > 0 ? value.join(', ') : 'none')}</code></p></div>`);
}