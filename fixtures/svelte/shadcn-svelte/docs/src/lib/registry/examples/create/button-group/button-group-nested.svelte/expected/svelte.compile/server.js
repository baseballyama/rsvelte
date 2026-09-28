import * as $ from 'svelte/internal/server';
import * as InputGroup from "$lib/registry/ui/input-group/index.js";
import * as Tooltip from "$lib/registry/ui/tooltip/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { ButtonGroup } from "$lib/registry/ui/button-group/index.js";
import { Button } from "$lib/registry/ui/button/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Button_group_nested($$renderer) {
	Example($$renderer, {
		title: 'Nested',
		children: ($$renderer) => {
			ButtonGroup($$renderer, {
				children: ($$renderer) => {
					ButtonGroup($$renderer, {
						children: ($$renderer) => {
							Button($$renderer, {
								variant: 'outline',
								size: 'icon',
								children: ($$renderer) => {
									IconPlaceholder($$renderer, {
										lucide: 'PlusIcon',
										tabler: 'IconPlus',
										hugeicons: 'PlusSignIcon',
										phosphor: 'PlusIcon',
										remixicon: 'RiAddLine'
									});
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					ButtonGroup($$renderer, {
						children: ($$renderer) => {
							if (InputGroup.Root) {
								$$renderer.push('<!--[-->');

								InputGroup.Root($$renderer, {
									children: ($$renderer) => {
										if (InputGroup.Input) {
											$$renderer.push('<!--[-->');
											InputGroup.Input($$renderer, { placeholder: 'Send a message...' });
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
															if (InputGroup.Addon) {
																$$renderer.push('<!--[-->');

																InputGroup.Addon($$renderer, $.spread_props([
																	{ align: 'inline-end' },
																	props,
																	{
																		children: ($$renderer) => {
																			IconPlaceholder($$renderer, {
																				lucide: 'AudioLinesIcon',
																				tabler: 'IconHeadphones',
																				hugeicons: 'AudioWave01Icon',
																				phosphor: 'MicrophoneIcon',
																				remixicon: 'RiMicLine'
																			});
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

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}