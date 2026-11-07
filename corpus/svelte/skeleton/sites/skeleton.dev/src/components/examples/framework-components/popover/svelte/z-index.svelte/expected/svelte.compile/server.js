import * as $ from 'svelte/internal/server';
import { Popover, Portal } from '@skeletonlabs/skeleton-svelte';

export default function Z_index($$renderer) {
	$$renderer.push(`<div class="grid grid-cols-2 gap-4">`);

	Popover($$renderer, {
		children: ($$renderer) => {
			if (Popover.Trigger) {
				$$renderer.push('<!--[-->');

				Popover.Trigger($$renderer, {
					class: 'btn preset-filled',
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
					if (Popover.Positioner) {
						$$renderer.push('<!--[-->');

						Popover.Positioner($$renderer, {
							children: ($$renderer) => {
								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										class: 'card max-w-md p-4 bg-surface-100-900 space-y-2',
										children: ($$renderer) => {
											if (Popover.Description) {
												$$renderer.push('<!--[-->');

												Popover.Description($$renderer, {
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

	Popover($$renderer, {
		children: ($$renderer) => {
			if (Popover.Trigger) {
				$$renderer.push('<!--[-->');

				Popover.Trigger($$renderer, {
					class: 'btn preset-filled',
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
					if (Popover.Positioner) {
						$$renderer.push('<!--[-->');

						Popover.Positioner($$renderer, {
							class: 'z-20!',
							children: ($$renderer) => {
								if (Popover.Content) {
									$$renderer.push('<!--[-->');

									Popover.Content($$renderer, {
										class: 'card max-w-md p-4 bg-surface-100-900 shadow-xl space-y-2',
										children: ($$renderer) => {
											if (Popover.Description) {
												$$renderer.push('<!--[-->');

												Popover.Description($$renderer, {
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