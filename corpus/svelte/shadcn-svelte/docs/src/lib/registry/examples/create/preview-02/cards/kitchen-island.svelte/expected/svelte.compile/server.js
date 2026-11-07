import * as $ from 'svelte/internal/server';
import * as Card from "$lib/registry/ui/card/index.js";
import * as Item from "$lib/registry/ui/item/index.js";
import * as ToggleGroup from "$lib/registry/ui/toggle-group/index.js";
import IconPlaceholder from "$lib/components/icon-placeholder/icon-placeholder.svelte";
import { Slider } from "$lib/registry/ui/slider/index.js";
import { Switch } from "$lib/registry/ui/switch/index.js";

export default function Kitchen_island($$renderer) {
	const SCENES = {
		cooking: { brightness: [90], colorTemp: [70], volume: [30], fade: [0] },
		dining: { brightness: [50], colorTemp: [40], volume: [20], fade: [60] },
		nightlight: { brightness: [15], colorTemp: [20], volume: [0], fade: [80] },
		focus: { brightness: [100], colorTemp: [85], volume: [0], fade: [0] }
	};

	let enabled = true;
	let scene = "cooking";
	let brightness = [90];
	let colorTemp = [70];
	let volume = [30];
	let fade = [0];

	function onSceneChange(value) {
		const preset = SCENES[value];

		if (!preset) return;

		brightness = [...preset.brightness];
		colorTemp = [...preset.colorTemp];
		volume = [...preset.volume];
		fade = [...preset.fade];
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Card.Root) {
			$$renderer.push('<!--[-->');

			Card.Root($$renderer, {
				children: ($$renderer) => {
					if (Card.Header) {
						$$renderer.push('<!--[-->');

						Card.Header($$renderer, {
							children: ($$renderer) => {
								if (Card.Title) {
									$$renderer.push('<!--[-->');

									Card.Title($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Kitchen Island`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Description) {
									$$renderer.push('<!--[-->');

									Card.Description($$renderer, {
										children: ($$renderer) => {
											$$renderer.push(`<!---->Hue Color Ambient`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Card.Action) {
									$$renderer.push('<!--[-->');

									Card.Action($$renderer, {
										children: ($$renderer) => {
											Switch($$renderer, {
												get checked() {
													return enabled;
												},

												set checked($$value) {
													enabled = $$value;
													$$settled = false;
												}
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

					$$renderer.push(` `);

					if (Card.Content) {
						$$renderer.push('<!--[-->');

						Card.Content($$renderer, {
							class: 'flex flex-col gap-4',
							children: ($$renderer) => {
								$$renderer.push(`<div class="flex flex-col gap-2"><span class="sr-only">Scenes</span> `);

								if (ToggleGroup.Root) {
									$$renderer.push('<!--[-->');

									ToggleGroup.Root($$renderer, {
										type: 'single',
										onValueChange: onSceneChange,
										variant: 'outline',
										spacing: 1,
										class: 'flex-wrap',
										get value() {
											return scene;
										},

										set value($$value) {
											scene = $$value;
											$$settled = false;
										},

										children: ($$renderer) => {
											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'cooking',
													disabled: !enabled,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Cooking`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'dining',
													disabled: !enabled,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Dining`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'nightlight',
													disabled: !enabled,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Nightlight`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (ToggleGroup.Item) {
												$$renderer.push('<!--[-->');

												ToggleGroup.Item($$renderer, {
													value: 'focus',
													disabled: !enabled,
													children: ($$renderer) => {
														$$renderer.push(`<!---->Focus`);
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

								$$renderer.push(`</div> `);

								if (Item.Group) {
									$$renderer.push('<!--[-->');

									Item.Group($$renderer, {
										children: ($$renderer) => {
											if (Item.Root) {
												$$renderer.push('<!--[-->');

												Item.Root($$renderer, {
													size: 'sm',
													variant: 'outline',
													children: ($$renderer) => {
														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'SunIcon',
																		tabler: 'IconSun',
																		hugeicons: 'Sun03Icon',
																		phosphor: 'SunIcon',
																		remixicon: 'RiSunLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																class: 'flex-row items-center gap-3',
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			class: 'shrink-0',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Brightness`);
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

														if (Item.Actions) {
															$$renderer.push('<!--[-->');

															Item.Actions($$renderer, {
																class: 'flex-1',
																children: ($$renderer) => {
																	Slider($$renderer, {
																		type: 'multiple',
																		max: 100,
																		disabled: !enabled,
																		class: 'w-full',
																		get value() {
																			return brightness;
																		},

																		set value($$value) {
																			brightness = $$value;
																			$$settled = false;
																		}
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

											$$renderer.push(` `);

											if (Item.Root) {
												$$renderer.push('<!--[-->');

												Item.Root($$renderer, {
													size: 'sm',
													variant: 'outline',
													children: ($$renderer) => {
														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'ThermometerIcon',
																		tabler: 'IconThermometer',
																		hugeicons: 'ThermometerWarmIcon',
																		phosphor: 'ThermometerIcon',
																		remixicon: 'RiThermometerLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																class: 'flex-row items-center gap-3',
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			class: 'shrink-0',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Color Temp`);
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

														if (Item.Actions) {
															$$renderer.push('<!--[-->');

															Item.Actions($$renderer, {
																class: 'flex-1',
																children: ($$renderer) => {
																	Slider($$renderer, {
																		type: 'multiple',
																		max: 100,
																		disabled: !enabled,
																		get value() {
																			return colorTemp;
																		},

																		set value($$value) {
																			colorTemp = $$value;
																			$$settled = false;
																		}
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

											$$renderer.push(` `);

											if (Item.Root) {
												$$renderer.push('<!--[-->');

												Item.Root($$renderer, {
													size: 'sm',
													variant: 'outline',
													children: ($$renderer) => {
														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'Volume2Icon',
																		tabler: 'IconVolume',
																		hugeicons: 'VolumeHighIcon',
																		phosphor: 'SpeakerHighIcon',
																		remixicon: 'RiVolumeUpLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																class: 'flex-row items-center gap-3',
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			class: 'shrink-0',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Volume`);
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

														if (Item.Actions) {
															$$renderer.push('<!--[-->');

															Item.Actions($$renderer, {
																class: 'flex-1',
																children: ($$renderer) => {
																	Slider($$renderer, {
																		type: 'multiple',
																		max: 100,
																		disabled: !enabled,
																		get value() {
																			return volume;
																		},

																		set value($$value) {
																			volume = $$value;
																			$$settled = false;
																		}
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

											$$renderer.push(` `);

											if (Item.Root) {
												$$renderer.push('<!--[-->');

												Item.Root($$renderer, {
													size: 'sm',
													variant: 'outline',
													children: ($$renderer) => {
														if (Item.Media) {
															$$renderer.push('<!--[-->');

															Item.Media($$renderer, {
																variant: 'icon',
																children: ($$renderer) => {
																	IconPlaceholder($$renderer, {
																		lucide: 'TimerIcon',
																		tabler: 'IconClock',
																		hugeicons: 'Clock03Icon',
																		phosphor: 'TimerIcon',
																		remixicon: 'RiTimerLine'
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

														if (Item.Content) {
															$$renderer.push('<!--[-->');

															Item.Content($$renderer, {
																class: 'flex-row items-center gap-3',
																children: ($$renderer) => {
																	if (Item.Title) {
																		$$renderer.push('<!--[-->');

																		Item.Title($$renderer, {
																			class: 'shrink-0',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Fade`);
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

														if (Item.Actions) {
															$$renderer.push('<!--[-->');

															Item.Actions($$renderer, {
																class: 'flex-1',
																children: ($$renderer) => {
																	Slider($$renderer, {
																		type: 'multiple',
																		max: 100,
																		disabled: !enabled,
																		get value() {
																			return fade;
																		},

																		set value($$value) {
																			fade = $$value;
																			$$settled = false;
																		}
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

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}