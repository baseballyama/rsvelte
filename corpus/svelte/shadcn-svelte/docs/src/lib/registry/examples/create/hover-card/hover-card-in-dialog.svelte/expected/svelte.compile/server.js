import * as $ from 'svelte/internal/server';
import * as Dialog from "$lib/registry/ui/dialog/index.js";
import * as HoverCard from "$lib/registry/ui/hover-card/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Hover_card_in_dialog($$renderer) {
	Example($$renderer, {
		title: 'In Dialog',
		children: ($$renderer) => {
			if (Dialog.Root) {
				$$renderer.push('<!--[-->');

				Dialog.Root($$renderer, {
					children: ($$renderer) => {
						{
							function child($$renderer, { props }) {
								Button($$renderer, $.spread_props([
									{ variant: 'outline' },
									props,
									{
										children: ($$renderer) => {
											$$renderer.push(`<!---->Open Dialog`);
										},
										$$slots: { default: true }
									}
								]));
							}

							if (Dialog.Trigger) {
								$$renderer.push('<!--[-->');
								Dialog.Trigger($$renderer, { child, $$slots: { child: true } });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}
						}

						$$renderer.push(` `);

						if (Dialog.Content) {
							$$renderer.push('<!--[-->');

							Dialog.Content($$renderer, {
								children: ($$renderer) => {
									if (Dialog.Header) {
										$$renderer.push('<!--[-->');

										Dialog.Header($$renderer, {
											children: ($$renderer) => {
												if (Dialog.Title) {
													$$renderer.push('<!--[-->');

													Dialog.Title($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Hover Card Example`);
														},
														$$slots: { default: true }
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (Dialog.Description) {
													$$renderer.push('<!--[-->');

													Dialog.Description($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<!---->Hover over the button below to see the hover card.`);
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

									if (HoverCard.Root) {
										$$renderer.push('<!--[-->');

										HoverCard.Root($$renderer, {
											openDelay: 100,
											closeDelay: 100,
											children: ($$renderer) => {
												{
													function child($$renderer, { props }) {
														Button($$renderer, $.spread_props([
															{ variant: 'outline', class: 'w-fit' },
															props,
															{
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Hover me`);
																},
																$$slots: { default: true }
															}
														]));
													}

													if (HoverCard.Trigger) {
														$$renderer.push('<!--[-->');
														HoverCard.Trigger($$renderer, { child, $$slots: { child: true } });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}
												}

												$$renderer.push(` `);

												if (HoverCard.Content) {
													$$renderer.push('<!--[-->');

													HoverCard.Content($$renderer, {
														children: ($$renderer) => {
															$$renderer.push(`<div class="flex flex-col style-vega:gap-2 style-nova:gap-1.5 style-lyra:gap-1 style-maia:gap-2 style-mira:gap-1"><h4 class="font-medium">Hover Card</h4> <p>This hover card appears inside a dialog. Hover over the button to see it.</p></div>`);
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

				$$renderer.push('<!--]-->');
			} else {
				$$renderer.push('<!--[!-->');
				$$renderer.push('<!--]-->');
			}
		},
		$$slots: { default: true }
	});
}