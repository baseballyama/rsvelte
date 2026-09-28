import * as $ from 'svelte/internal/server';
import * as Menubar from "$lib/registry/ui/menubar/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Menubar_with_radio($$renderer) {
	let user = "benoit";
	let theme = "system";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Radio',
			children: ($$renderer) => {
				if (Menubar.Root) {
					$$renderer.push('<!--[-->');

					Menubar.Root($$renderer, {
						children: ($$renderer) => {
							if (Menubar.Menu) {
								$$renderer.push('<!--[-->');

								Menubar.Menu($$renderer, {
									children: ($$renderer) => {
										if (Menubar.Trigger) {
											$$renderer.push('<!--[-->');

											Menubar.Trigger($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Profiles`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menubar.Content) {
											$$renderer.push('<!--[-->');

											Menubar.Content($$renderer, {
												children: ($$renderer) => {
													if (Menubar.RadioGroup) {
														$$renderer.push('<!--[-->');

														Menubar.RadioGroup($$renderer, {
															get value() {
																return user;
															},

															set value($$value) {
																user = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (Menubar.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.RadioItem($$renderer, {
																		value: 'andy',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Andy`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Menubar.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.RadioItem($$renderer, {
																		value: 'benoit',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Benoit`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Menubar.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.RadioItem($$renderer, {
																		value: 'luis',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Luis`);
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

													if (Menubar.Separator) {
														$$renderer.push('<!--[-->');
														Menubar.Separator($$renderer, {});
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Menubar.Item) {
														$$renderer.push('<!--[-->');

														Menubar.Item($$renderer, {
															inset: true,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Edit...`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Menubar.Item) {
														$$renderer.push('<!--[-->');

														Menubar.Item($$renderer, {
															inset: true,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Add Profile...`);
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

							$$renderer.push(` `);

							if (Menubar.Menu) {
								$$renderer.push('<!--[-->');

								Menubar.Menu($$renderer, {
									children: ($$renderer) => {
										if (Menubar.Trigger) {
											$$renderer.push('<!--[-->');

											Menubar.Trigger($$renderer, {
												children: ($$renderer) => {
													$$renderer.push(`<!---->Theme`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menubar.Content) {
											$$renderer.push('<!--[-->');

											Menubar.Content($$renderer, {
												children: ($$renderer) => {
													if (Menubar.RadioGroup) {
														$$renderer.push('<!--[-->');

														Menubar.RadioGroup($$renderer, {
															get value() {
																return theme;
															},

															set value($$value) {
																theme = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (Menubar.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.RadioItem($$renderer, {
																		value: 'light',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Light`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Menubar.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.RadioItem($$renderer, {
																		value: 'dark',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Dark`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Menubar.RadioItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.RadioItem($$renderer, {
																		value: 'system',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->System`);
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
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}