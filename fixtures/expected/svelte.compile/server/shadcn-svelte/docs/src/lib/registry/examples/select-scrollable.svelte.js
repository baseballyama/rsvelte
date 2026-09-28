import * as $ from 'svelte/internal/server';
import * as Select from "$lib/registry/ui/select/index.js";

export default function Select_scrollable($$renderer) {
	if (Select.Root) {
		$$renderer.push('<!--[-->');

		Select.Root($$renderer, {
			type: 'single',
			children: ($$renderer) => {
				if (Select.Trigger) {
					$$renderer.push('<!--[-->');

					Select.Trigger($$renderer, {
						class: 'w-[280px]',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Select a timezone`);
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}

				$$renderer.push(` `);

				if (Select.Content) {
					$$renderer.push('<!--[-->');

					Select.Content($$renderer, {
						class: 'max-h-[300px]',
						children: ($$renderer) => {
							if (Select.Group) {
								$$renderer.push('<!--[-->');

								Select.Group($$renderer, {
									children: ($$renderer) => {
										if (Select.Label) {
											$$renderer.push('<!--[-->');

											Select.Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->North America`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'est',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Eastern Standard Time (EST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'cst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Central Standard Time (CST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'mst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Mountain Standard Time (MST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'pst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Pacific Standard Time (PST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'akst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Alaska Standard Time (AKST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'hst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Hawaii Standard Time (HST)`);
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

							if (Select.Group) {
								$$renderer.push('<!--[-->');

								Select.Group($$renderer, {
									children: ($$renderer) => {
										if (Select.Label) {
											$$renderer.push('<!--[-->');

											Select.Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Europe &amp; Africa`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'gmt',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Greenwich Mean Time (GMT)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'cet',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Central European Time (CET)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'eet',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Eastern European Time (EET)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'west',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Western European Summer Time (WEST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'cat',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Central Africa Time (CAT)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'eat',
												children: ($$renderer) => {
													$$renderer.push(`<!---->East Africa Time (EAT)`);
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

							if (Select.Group) {
								$$renderer.push('<!--[-->');

								Select.Group($$renderer, {
									children: ($$renderer) => {
										if (Select.Label) {
											$$renderer.push('<!--[-->');

											Select.Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Asia`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'msk',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Moscow Time (MSK)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'ist',
												children: ($$renderer) => {
													$$renderer.push(`<!---->India Standard Time (IST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'cst_china',
												children: ($$renderer) => {
													$$renderer.push(`<!---->China Standard Time (CST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'jst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Japan Standard Time (JST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'kst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Korea Standard Time (KST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'ist_indonesia',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Indonesia Central Standard Time (WITA)`);
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

							if (Select.Group) {
								$$renderer.push('<!--[-->');

								Select.Group($$renderer, {
									children: ($$renderer) => {
										if (Select.Label) {
											$$renderer.push('<!--[-->');

											Select.Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Australia &amp; Pacific`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'awst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Australian Western Standard Time (AWST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'acst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Australian Central Standard Time (ACST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'aest',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Australian Eastern Standard Time (AEST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'nzst',
												children: ($$renderer) => {
													$$renderer.push(`<!---->New Zealand Standard Time (NZST)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'fjt',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Fiji Time (FJT)`);
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

							if (Select.Group) {
								$$renderer.push('<!--[-->');

								Select.Group($$renderer, {
									children: ($$renderer) => {
										if (Select.Label) {
											$$renderer.push('<!--[-->');

											Select.Label($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->South America`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'art',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Argentina Time (ART)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'bot',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Bolivia Time (BOT)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'brt',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Brasilia Time (BRT)`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Select.Item) {
											$$renderer.push('<!--[-->');

											Select.Item($$renderer, {
												value: 'clt',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Chile Standard Time (CLT)`);
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