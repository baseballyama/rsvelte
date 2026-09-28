import * as $ from 'svelte/internal/server';
import { Switch } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Switch($$renderer, {
		children: ($$renderer) => {
			if (Switch.Label) {
				$$renderer.push('<!--[-->');

				Switch.Label($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Label`);
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
}