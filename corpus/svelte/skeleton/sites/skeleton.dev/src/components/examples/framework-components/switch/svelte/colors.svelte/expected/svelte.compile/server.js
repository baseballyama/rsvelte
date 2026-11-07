import * as $ from 'svelte/internal/server';
import { Switch } from '@skeletonlabs/skeleton-svelte';

export default function Colors($$renderer) {
	Switch($$renderer, {
		children: ($$renderer) => {
			if (Switch.Control) {
				$$renderer.push('<!--[-->');

				Switch.Control($$renderer, {
					class: 'preset-filled-secondary-50-950 data-[state=checked]:preset-filled-secondary-500',
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
}