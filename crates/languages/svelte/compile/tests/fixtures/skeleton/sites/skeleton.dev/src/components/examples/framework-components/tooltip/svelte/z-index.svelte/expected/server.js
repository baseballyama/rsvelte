import * as $ from 'svelte/internal/server';
import { Portal, Tooltip } from '@skeletonlabs/skeleton-svelte';

export default function Z_index($$renderer) {
	$$renderer.push(`<div class="grid grid-cols-2 gap-4">`);

	Tooltip($$renderer, {
		children: ($$renderer) => {
			if (Tooltip.Trigger) {
				$$renderer.push('<!--[-->');

				Tooltip.Trigger($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Default (auto)`);
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
											$$renderer.push(`<!---->This example will be below the sibling.`);
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

	$$renderer.push(`<!----> `);

	Tooltip($$renderer, {
		children: ($$renderer) => {
			if (Tooltip.Trigger) {
				$$renderer.push('<!--[-->');

				Tooltip.Trigger($$renderer, {
					children: ($$renderer) => {
						$$renderer.push(`<!---->Above (20)`);
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
							class: 'z-20!',
							children: ($$renderer) => {
								if (Tooltip.Content) {
									$$renderer.push('<!--[-->');

									Tooltip.Content($$renderer, {
										class: 'card bg-surface-100-900 p-2  shadow-xl',
										children: ($$renderer) => {
											$$renderer.push(`<!---->This example will be above the sibling.`);
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

	$$renderer.push(`<!----> <div class="col-span-2 h-[100px] relative"><div class="rounded bg-primary-200-800/75 w-full h-full z-10 flex justify-center items-center absolute">Sibling (10)</div></div></div>`);
}