import * as $ from 'svelte/internal/server';
import { Popover, Portal, usePopover } from '@skeletonlabs/skeleton-svelte';

export default function Provider_pattern($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const id = $.props_id($$renderer);
		const popover = usePopover({ id, closeOnInteractOutside: false });

		function showAndHide() {
			popover().setOpen(true);

			setTimeout(
				() => {
					popover().setOpen(false);
				},
				3000
			);
		}

		$$renderer.push(`<div class="flex flex-col gap-4"><button class="btn preset-filled">Show for 3 seconds</button> `);

		if (Popover.Provider) {
			$$renderer.push('<!--[-->');

			Popover.Provider($$renderer, {
				value: popover,
				children: ($$renderer) => {
					if (Popover.Trigger) {
						$$renderer.push('<!--[-->');

						Popover.Trigger($$renderer, {
							class: 'btn preset-tonal',
							children: ($$renderer) => {
								$$renderer.push(`<!---->Anchor`);
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
												class: 'card max-w-sm p-4 bg-surface-100-900 shadow-xl space-y-2',
												children: ($$renderer) => {
													if (Popover.Description) {
														$$renderer.push('<!--[-->');

														Popover.Description($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->This popover will appear, stay open for three seconds, then close on it's own.`);
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

			$$renderer.push('<!--]-->');
		} else {
			$$renderer.push('<!--[!-->');
			$$renderer.push('<!--]-->');
		}

		$$renderer.push(`</div>`);
	});
}