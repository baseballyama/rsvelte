import * as $ from 'svelte/internal/server';
import * as ContextMenu from "$lib/registry/ui/context-menu/index.js";
import Example from "../../../../../routes/(app)/(layout)/(create)/components/example.svelte";

export default function Context_menu_with_radio($$renderer) {
	let user = "pedro";
	let theme = "light";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		Example($$renderer, {
			title: 'With Radio Group',
			children: ($$renderer) => {
				if (ContextMenu.Root) {
					$$renderer.push('<!--[-->');

					ContextMenu.Root($$renderer, {
						children: ($$renderer) => {
							if (ContextMenu.Trigger) {
								$$renderer.push('<!--[-->');

								ContextMenu.Trigger($$renderer, {
									class: 'flex aspect-[2/0.5] w-full items-center justify-center rounded-lg border text-sm',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Right click here`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (ContextMenu.Content) {
								$$renderer.push('<!--[-->');

								ContextMenu.Content($$renderer, {
									children: ($$renderer) => {
										if (ContextMenu.Group) {
											$$renderer.push('<!--[-->');

											ContextMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.Label) {
														$$renderer.push('<!--[-->');

														ContextMenu.Label($$renderer, {
															children: ($$renderer) => {
																$$renderer.push(`<!---->People`);
															},
															$$slots: { default: true }
														});

														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (ContextMenu.RadioGroup) {
														$$renderer.push('<!--[-->');

														ContextMenu.RadioGroup($$renderer, {
															get value() {
																return user;
															},

															set value($$value) {
																user = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (ContextMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.RadioItem($$renderer, {
																		value: 'pedro',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Pedro Duarte`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (ContextMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.RadioItem($$renderer, {
																		value: 'colm',
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->Colm Tuite`);
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

										if (ContextMenu.Separator) {
											$$renderer.push('<!--[-->');
											ContextMenu.Separator($$renderer, {});
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (ContextMenu.Group) {
											$$renderer.push('<!--[-->');

											ContextMenu.Group($$renderer, {
												children: ($$renderer) => {
													if (ContextMenu.Label) {
														$$renderer.push('<!--[-->');

														ContextMenu.Label($$renderer, {
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

													if (ContextMenu.RadioGroup) {
														$$renderer.push('<!--[-->');

														ContextMenu.RadioGroup($$renderer, {
															get value() {
																return theme;
															},

															set value($$value) {
																theme = $$value;
																$$settled = false;
															},

															children: ($$renderer) => {
																if (ContextMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.RadioItem($$renderer, {
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

																if (ContextMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.RadioItem($$renderer, {
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

																if (ContextMenu.RadioItem) {
																	$$renderer.push('<!--[-->');

																	ContextMenu.RadioItem($$renderer, {
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