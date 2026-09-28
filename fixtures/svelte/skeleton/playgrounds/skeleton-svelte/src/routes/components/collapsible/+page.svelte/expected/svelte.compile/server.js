import * as $ from 'svelte/internal/server';
import { Collapsible } from '@skeletonlabs/skeleton-svelte';

export default function _page($$renderer) {
	Collapsible($$renderer, {
		children: ($$renderer) => {
			if (Collapsible.Trigger) {
				$$renderer.push('<!--[-->');

				Collapsible.Trigger($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Toggle `);

						if (Collapsible.Indicator) {
							$$renderer.push('<!--[-->');

							Collapsible.Indicator($$renderer, {
								children: ($$renderer) => {
									$$renderer.push(`<!---->+`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			if (Collapsible.Content) {
				$$renderer.push('<!--[-->');

				Collapsible.Content($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Content`);
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