import * as $ from 'svelte/internal/server';
import AudioLines from "@lucide/svelte/icons/audio-lines";
import Plus from "@lucide/svelte/icons/plus";
import * as ButtonGroup from "$lib/registry/ui/button-group/index.js";
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Button_group_input_group_demo($$renderer) {
	let voiceEnabled = false;

	if (ButtonGroup.Root) {
		$$renderer.push('<!--[-->');

		ButtonGroup.Root($$renderer, {
			class: '[--radius:9999rem]',
			children: ($$renderer) => {
				if (ButtonGroup.Root) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Root($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									Plus($$renderer, {});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (ButtonGroup.Root) {
					$$renderer.push('<!--[-->');

					ButtonGroup.Root($$renderer, {
						class: 'flex-1',
						children: ($$renderer) => {
							if (InputGroup.Root) {
								$$renderer.push('<!--[-->');

								InputGroup.Root($$renderer, {
									children: ($$renderer) => {
										if (InputGroup.Input) {
											$$renderer.push('<!--[-->');

											InputGroup.Input($$renderer, {
												placeholder: voiceEnabled ? "Record and send audio..." : "Send a message...",
												disabled: voiceEnabled
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
													if (Tooltip.Root) {
														$$renderer.push('<!--[-->');

														Tooltip.Root($$renderer, {
															children: ($$renderer) => {
																{
																	function child($$renderer, { props }) {
																		if (InputGroup.Button) {
																			$$renderer.push('<!--[-->');

																			InputGroup.Button($$renderer, $.spread_props([
																				props,
																				{
																					onclick: () => voiceEnabled = !voiceEnabled,
																					size: 'icon-xs',
																					'data-active': voiceEnabled,
																					class: 'data-[active=true]:bg-orange-100 data-[active=true]:text-orange-700 dark:data-[active=true]:bg-orange-800 dark:data-[active=true]:text-orange-100',
																					'aria-pressed': voiceEnabled,
																					children: ($$renderer) => {
																						AudioLines($$renderer, {});
																					},
																					$$slots: { default: true }
																				}
																			]));

																			$$renderer.push('<!--]-->');
																		} else {
																			$$renderer.push('<!--[!-->');
																			$$renderer.push('<!--]-->');
																		}
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
																			$$renderer.push(`<!---->Voice Mode`);
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