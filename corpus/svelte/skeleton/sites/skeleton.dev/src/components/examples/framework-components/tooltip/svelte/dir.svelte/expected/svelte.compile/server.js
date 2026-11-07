import * as $ from 'svelte/internal/server';
import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';

export default function Dir($$renderer) {
	Tooltip($$renderer, {
		dir: 'rtl',
		children: ($$renderer) => {
			if (Tooltip.Trigger) {
				$$renderer.push('<!--[-->');

				Tooltip.Trigger($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Hover`);
					},
					$$slots: { default: true }
				});

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}

			$$renderer.push(` `);

			Portal($$renderer, {
				children: ($$renderer) => {
					if (Tooltip.Positioner) {
						$$renderer.push('<!--[-->');

						Tooltip.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Tooltip.Content) {
									$$renderer.push('<!--[-->');

									Tooltip.Content($$renderer, {
										class: 'card bg-surface-100-900 p-2  shadow-xl',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Hello Skeleton`);
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
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}