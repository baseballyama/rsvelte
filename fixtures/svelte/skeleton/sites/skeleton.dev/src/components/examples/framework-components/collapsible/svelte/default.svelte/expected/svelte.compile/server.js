import * as $ from 'svelte/internal/server';
import ArrowUpDownIcon from '@lucide/svelte/icons/arrow-up-down';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

export default function Default($$renderer) {
	Collapsible($$renderer, {
		class: 'items-start card preset-filled-surface-100-900 p-4 w-56 mx-auto',
		children: ($$renderer) => {
			$$renderer.push(`<div class="w-full flex justify-between items-center"><p class="font-bold">Design System</p> `);

			if (Collapsible.Trigger) {
				$$renderer.push('<!--[-->');

				Collapsible.Trigger($$renderer, {
					class: 'btn-icon hover:preset-tonal',
					children: ($$renderer) => {
						ArrowUpDownIcon($$renderer, { class: 'size-4' });
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(`</div> `);

			if (Collapsible.Content) {
				$$renderer.push('<!--[-->');

				Collapsible.Content($$renderer, {
					class: 'flex flex-col gap-2',
					children: ($$renderer) => {
						$$renderer.push(`<nav class="contents"><a class="anchor" href="/docs/design/themes">Themes</a> <a class="anchor" href="/docs/design/colors">Colors</a> <a class="anchor" href="/docs/tailwind-utilities/presets">Presets</a> <a class="anchor" href="/docs/design/typography">Typography</a> <a class="anchor" href="/docs/design/spacing">Spacing</a> <a class="anchor" href="/docs/design/iconography">Iconography</a></nav>`);
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
}