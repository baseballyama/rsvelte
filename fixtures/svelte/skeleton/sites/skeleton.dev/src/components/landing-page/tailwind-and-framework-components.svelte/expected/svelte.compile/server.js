import * as $ from 'svelte/internal/server';
import ChevronRight from '@lucide/svelte/icons/chevron-right';
import { Switch } from '@skeletonlabs/skeleton-svelte';

export default function Tailwind_and_framework_components($$renderer) {
	$$renderer.push(`<div class="grid grid-cols-1 xl:grid-cols-2 gap-10"><div class="space-y-10"><div class="text-center space-y-2"><h2 class="h2">Tailwind Components</h2> <p class="text-balance opacity-60">Common visual interfaces, such as cards, buttons, and tables. Using semantic HTML elements and Tailwind utility classes.</p></div> <div class="card bg-noise preset-filled-secondary-500 aspect-video shadow-xl flex justify-center items-center"><button class="btn preset-filled scale-150 shadow-xl"><span>Button</span> `);
	ChevronRight($$renderer, { class: 'size-4' });
	$$renderer.push(`<!----></button></div></div> <div class="space-y-10"><div class="text-center space-y-2"><h2 class="h2">Framework Components</h2> <p class="text-balance opacity-60">Interactive components for supported frameworks. Handle state and logic for user interaction and form elements.</p></div> <div class="card bg-noise preset-filled-secondary-500 aspect-video shadow-xl flex justify-center items-center">`);

	Switch($$renderer, {
		class: 'scale-[2.0] shadow-xl',
		children: ($$renderer) => {
			if (Switch.Label) {
				$$renderer.push('<!--[-->');

				Switch.Label($$renderer, {
					class: 'sr-only',
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Switch.Control) {
				$$renderer.push('<!--[-->');

				Switch.Control($$renderer, {
					children: ($$renderer) => {
						if (Switch.Thumb) {
							$$renderer.push('<!--[-->');
							Switch.Thumb($$renderer, {});
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Switch.HiddenInput) {
				$$renderer.push('<!--[-->');
				Switch.HiddenInput($$renderer, {});
				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></div></div>`);
}