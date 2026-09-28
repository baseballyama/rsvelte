import * as $ from 'svelte/internal/server';
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as Kbd from "$lib/registry/ui/kbd/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Kbd_tooltip_demo($$renderer) {
	$$renderer.push(`<div class="flex flex-wrap gap-4">`);

	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			children: ($$renderer) => {
				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ size: 'sm', variant: 'outline' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->Save`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');
									Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Tooltip.Content) {
								$$renderer.push('<!--[-->');

								Tooltip.Content($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center gap-2">Save Changes `);

										if (Kbd.Root) {
											$$renderer.push('<!--[-->');

											Kbd.Root($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->S`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(`</div>`);
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

				if (Tooltip.Root) {
					$$renderer.push('<!--[-->');

					Tooltip.Root($$renderer, {
						children: ($$renderer) => {
							{
								function child($$renderer, { props }) {
									Button($$renderer, $.spread_props([
										{ size: 'sm', variant: 'outline' },
										props,
										{
											children: ($$renderer) => {
												$$renderer.push(`<!---->Print`);
											},
											$$slots: { default: true }
										}
									]));
								}

								if (Tooltip.Trigger) {
									$$renderer.push('<!--[-->');
									Tooltip.Trigger($$renderer, { child, $$slots: { child: true } });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}
							}

							$$renderer.push(` `);

							if (Tooltip.Content) {
								$$renderer.push('<!--[-->');

								Tooltip.Content($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="flex items-center gap-2">Print Document `);

										if (Kbd.Group) {
											$$renderer.push('<!--[-->');

											Kbd.Group($$renderer, {
												children: ($$renderer) => {
													if (Kbd.Root) {
														$$renderer.push('<!--[-->');

														Kbd.Root($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->Ctrl`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Kbd.Root) {
														$$renderer.push('<!--[-->');

														Kbd.Root($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->P`);
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