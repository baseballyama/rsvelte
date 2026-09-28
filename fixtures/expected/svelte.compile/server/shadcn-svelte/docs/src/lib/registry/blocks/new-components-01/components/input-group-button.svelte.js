import * as $ from 'svelte/internal/server';
import InfoIcon from "@lucide/svelte/icons/info";
import StarIcon from "@lucide/svelte/icons/star";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Label } from "$lib/registry/ui/label/index.js";

export default function Input_group_button($$renderer) {
	let isFavorite = false;

	$$renderer.push(`<div class="grid w-full max-w-sm gap-6">`);

	Label($$renderer, {
		for: 'input-secure-19',
		class: 'sr-only',
		children: ($$renderer) => {
			$$renderer.push(`<!---->Input Secure`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	if (InputGroup.Root) {
		$$renderer.push('<!--[-->');

		InputGroup.Root($$renderer, {
			class: '[--radius:9999px]',
			children: ($$renderer) => {
				if (InputGroup.Input) {
					$$renderer.push('<!--[-->');
					InputGroup.Input($$renderer, { id: 'input-secure-19', class: '!ps-0.5' });
					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Popover.Root) {
					$$renderer.push('<!--[-->');

					Popover.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									if (InputGroup.Addon) {
										$$renderer.push('<!--[-->');

										InputGroup.Addon($$renderer, {
											children: ($$renderer) => {
												if (InputGroup.Button) {
													$$renderer.push('<!--[-->');

													InputGroup.Button($$renderer, $.spread_props([
														props,
														{
															variant: 'secondary',
															size: 'icon-xs',
															'aria-label': 'Info',
															children: ($$renderer) => {
																InfoIcon($$renderer, {});
															},
															$$slots: { default: true }
														}
													]));

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
								}

								if (Popover.Trigger) {
									$$renderer.push('<!--[-->');
									Popover.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									align: 'start',
									alignOffset: 10,
									class: 'flex flex-col gap-1 rounded-xl text-sm',
									children: ($$renderer) => {
										$$renderer.push(`<p class="font-medium">Your connection is not secure.</p> <p>You should not enter any sensitive information on this site.</p>`);
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

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						class: '!ps-1 text-muted-foreground',
						children: ($$renderer) => {
							$$renderer.push(`<!---->https://`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (InputGroup.Addon) {
					$$renderer.push('<!--[-->');

					InputGroup.Addon($$renderer, {
						align: 'inline-end',
						children: ($$renderer) => {
							if (InputGroup.Button) {
								$$renderer.push('<!--[-->');

								InputGroup.Button($$renderer, {
									onclick: () => isFavorite = !isFavorite,
									size: 'icon-xs',
									'aria-label': 'Favorite',
									children: ($$renderer) => {
										StarIcon($$renderer, {
											'data-favorite': isFavorite,
											class: 'data-[favorite=true]:fill-primary data-[favorite=true]:stroke-primary'
										});
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

	$$renderer.push(`</div>`);
}