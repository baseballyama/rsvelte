import * as $ from 'svelte/internal/server';
import { Portal, Tooltip, useTooltip } from '@skeletonlabs/skeleton-svelte';

export default function Provider_pattern($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const tooltip = useTooltip({ id });

		$$renderer.push(`<div class="grid gap-4"><button class="btn preset-filled w-[150px]">Trigger</button> `);

		if (Tooltip.Provider) {
			$$renderer.push('<!--[-->');

			Tooltip.Provider($$renderer, {
				value: tooltip,
				children: ($$renderer) => {
					if (Tooltip.Trigger) {
						$$renderer.push('<!--[-->');

						Tooltip.Trigger($$renderer, {
							children: ($$renderer) => {
								$$renderer.push(`<!---->Anchor (${$.escape(tooltip().open ? 'open' : 'closed')})`);
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}