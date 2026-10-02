import * as $ from 'svelte/internal/server';
import { Menubar } from "bits-ui";
import CaretRight from "phosphor-svelte/lib/CaretRight";
import Cat from "phosphor-svelte/lib/Cat";
import Check from "phosphor-svelte/lib/Check";

function SwitchOn($$renderer) {
	$$renderer.push(`<div class="bg-dark-10 peer inline-flex h-[15.6px] min-h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[1.5px]"><span class="bg-background dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-[10px] rounded-full"></span></div>`);
}

function SwitchOff($$renderer) {
	$$renderer.push(`<div class="bg-dark-10 shadow-mini-inset peer inline-flex h-[15.6px] w-[26px] shrink-0 items-center rounded-full px-[3px] transition-colors"><span class="bg-background shadow-mini dark:border-border-input dark:shadow-mini pointer-events-none block size-[13px] shrink-0 translate-x-0 rounded-full transition-transform dark:border"></span></div>`);
}

export default function Menubar_demo($$renderer) {
	let selectedView = "table";
	let selectedProfile = "pavel";

	let grids = [
		{ checked: true, label: "Pixel" },
		{ checked: false, label: "Layout" }
	];

	let showConfigs = [
		{ checked: true, label: "Show Bookmarks" },
		{ checked: false, label: "Show Full URLs" }
	];

	const profiles = [
		{ value: "hunter", label: "Hunter" },
		{ value: "pavel", label: "Pavel" },
		{ value: "adrian", label: "Adrian" }
	];

	const views = [
		{ value: "table", label: "Table" },
		{ value: "board", label: "Board" },
		{ value: "gallery", label: "Gallery" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		if (Menubar.Root) {
			$$renderer.push('<!--[-->');

			Menubar.Root($$renderer, {
				class: 'rounded-10px border-dark-10 bg-background-alt shadow-mini flex h-12 items-center gap-1 border px-[3px]',
				children: ($$renderer) => {
					$$renderer.push(`<div class="px-2.5">`);
					Cat($$renderer, { class: 'size-6' });
					$$renderer.push(`<!----></div> `);

					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										class: 'rounded-9px data-highlighted:bg-muted data-[state=open]:bg-muted inline-flex h-10 cursor-default items-center justify-center px-3 text-sm font-medium focus-visible:outline-none',
										children: ($$renderer) => {
											$$renderer.push(`<!---->File`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Portal) {
									$$renderer.push('<!--[-->');

									Menubar.Portal($$renderer, {
										children: ($$renderer) => {
											if (Menubar.Content) {
												$$renderer.push('<!--[-->');

												Menubar.Content($$renderer, {
													class: 'focus-override border-muted bg-background  shadow-popover focus-visible:outline-hidden z-50 w-fit rounded-xl border px-1 py-1.5',
													align: 'start',
													sideOffset: 3,
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array = $.ensure_array_like(grids);

														for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
															let grid = each_array[$$index];

															{
																function children($$renderer, { checked }) {
																	$$renderer.push(`<!---->${$.escape(grid.label)} grid <div class="ml-auto flex items-center">`);

																	if (checked) {
																		$$renderer.push('<!--[0-->');
																		SwitchOn($$renderer);
																	} else {
																		$$renderer.push('<!--[-1-->');
																		SwitchOff($$renderer);
																	}

																	$$renderer.push(`<!--]--></div>`);
																}

																if (Menubar.CheckboxItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.CheckboxItem($$renderer, {
																		class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																		get checked() {
																			return grid.checked;
																		},

																		set checked($$value) {
																			grid.checked = $$value;
																			$$settled = false;
																		},
																		children,
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}
														}

														$$renderer.push(`<!--]--> `);

														if (Menubar.Separator) {
															$$renderer.push('<!--[-->');
															Menubar.Separator($$renderer, { class: 'bg-muted my-1 -ml-1 -mr-1 block h-px' });
															$$renderer.push('<!--]-->');
														} else {
															$$renderer.push('<!--[!-->');
															$$renderer.push('<!--]-->');
														}

														$$renderer.push(` `);

														if (Menubar.RadioGroup) {
															$$renderer.push('<!--[-->');

															Menubar.RadioGroup($$renderer, {
																get value() {
																	return selectedView;
																},

																set value($$value) {
																	selectedView = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_1 = $.ensure_array_like(views);

																	for (let i = 0, $$length = each_array_1.length; i < $$length; i++) {
																		let view = each_array_1[i];

																		{
																			function children($$renderer, { checked }) {
																				$$renderer.push(`<!---->${$.escape(view.label)} <div class="ml-auto size-5">`);

																				if (checked) {
																					$$renderer.push('<!--[0-->');
																					Check($$renderer, { class: 'size-5' });
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]--></div>`);
																			}

																			if (Menubar.RadioItem) {
																				$$renderer.push('<!--[-->');

																				Menubar.RadioItem($$renderer, {
																					value: view.value,
																					class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center gap-2 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																					children,
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}
																	}

																	$$renderer.push(`<!--]-->`);
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

					$$renderer.push(` `);

					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										class: 'data-highlighted:bg-muted data-[state=open]:bg-muted inline-flex h-10 cursor-default items-center justify-center rounded-[9px] px-3 text-sm font-medium focus-visible:outline-none',
										children: ($$renderer) => {
											$$renderer.push(`<!---->Edit`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Portal) {
									$$renderer.push('<!--[-->');

									Menubar.Portal($$renderer, {
										children: ($$renderer) => {
											if (Menubar.Content) {
												$$renderer.push('<!--[-->');

												Menubar.Content($$renderer, {
													class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden z-50 w-full rounded-xl border px-1 py-1.5',
													align: 'start',
													sideOffset: 3,
													children: ($$renderer) => {
														if (Menubar.Item) {
															$$renderer.push('<!--[-->');

															Menubar.Item($$renderer, {
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Undo`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 min-w-[130px] select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Redo`);
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

														if (Menubar.Sub) {
															$$renderer.push('<!--[-->');

															Menubar.Sub($$renderer, {
																children: ($$renderer) => {
																	if (Menubar.SubTrigger) {
																		$$renderer.push('<!--[-->');

																		Menubar.SubTrigger($$renderer, {
																			class: 'rounded-button data-highlighted:bg-muted data-[state=open]:bg-muted flex h-10 select-none items-center gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Find <div class="ml-auto flex items-center">`);
																				CaretRight($$renderer, { class: 'text-foreground-alt h-4 w-4' });
																				$$renderer.push(`<!----></div>`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Menubar.SubContent) {
																		$$renderer.push('<!--[-->');

																		Menubar.SubContent($$renderer, {
																			class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden w-full max-w-[209px] rounded-xl border px-1 py-1.5',
																			children: ($$renderer) => {
																				if (Menubar.Item) {
																					$$renderer.push('<!--[-->');

																					Menubar.Item($$renderer, {
																						class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Search the web`);
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
																						class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Find...`);
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
																						class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Find Next`);
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
																						class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->Find Previous`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Cut`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Copy`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Paste`);
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

					$$renderer.push(` `);

					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										class: 'rounded-9px data-highlighted:bg-muted data-[state=open]:bg-muted inline-flex h-10 cursor-default items-center justify-center px-3 text-sm font-medium focus-visible:outline-none',
										children: ($$renderer) => {
											$$renderer.push(`<!---->View`);
										},
										$$slots: { default: true }
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Menubar.Portal) {
									$$renderer.push('<!--[-->');

									Menubar.Portal($$renderer, {
										children: ($$renderer) => {
											if (Menubar.Content) {
												$$renderer.push('<!--[-->');

												Menubar.Content($$renderer, {
													class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden z-50 w-full max-w-[220px] rounded-xl border px-1 py-1.5',
													align: 'start',
													sideOffset: 3,
													children: ($$renderer) => {
														$$renderer.push(`<!--[-->`);

														const each_array_2 = $.ensure_array_like(showConfigs);

														for (let i = 0, $$length = each_array_2.length; i < $$length; i++) {
															let config = each_array_2[i];

															{
																function children($$renderer, { checked }) {
																	$$renderer.push(`<!---->${$.escape(config.label)} <div class="ml-auto flex items-center">`);

																	if (checked) {
																		$$renderer.push('<!--[0-->');
																		SwitchOn($$renderer);
																	} else {
																		$$renderer.push('<!--[-1-->');
																		SwitchOff($$renderer);
																	}

																	$$renderer.push(`<!--]--></div>`);
																}

																if (Menubar.CheckboxItem) {
																	$$renderer.push('<!--[-->');

																	Menubar.CheckboxItem($$renderer, {
																		class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center gap-3 py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																		get checked() {
																			return config.checked;
																		},

																		set checked($$value) {
																			config.checked = $$value;
																			$$settled = false;
																		},
																		children,
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}
															}
														}

														$$renderer.push(`<!--]--> `);

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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Reload`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Force Reload`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Toggle Fullscreen`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Hide Sidebar`);
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

					$$renderer.push(` `);

					if (Menubar.Menu) {
						$$renderer.push('<!--[-->');

						Menubar.Menu($$renderer, {
							children: ($$renderer) => {
								if (Menubar.Trigger) {
									$$renderer.push('<!--[-->');

									Menubar.Trigger($$renderer, {
										class: 'data-highlighted:bg-muted data-[state=open]:bg-muted mr-[20px] inline-flex h-10 cursor-default items-center justify-center rounded-[9px] px-3 text-sm font-medium focus-visible:outline-none',
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

								if (Menubar.Portal) {
									$$renderer.push('<!--[-->');

									Menubar.Portal($$renderer, {
										children: ($$renderer) => {
											if (Menubar.Content) {
												$$renderer.push('<!--[-->');

												Menubar.Content($$renderer, {
													class: 'focus-override border-muted bg-background shadow-popover focus-visible:outline-hidden z-50 w-full max-w-[220px] rounded-xl border px-1 py-1.5',
													align: 'start',
													sideOffset: 3,
													children: ($$renderer) => {
														if (Menubar.RadioGroup) {
															$$renderer.push('<!--[-->');

															Menubar.RadioGroup($$renderer, {
																get value() {
																	return selectedProfile;
																},

																set value($$value) {
																	selectedProfile = $$value;
																	$$settled = false;
																},

																children: ($$renderer) => {
																	$$renderer.push(`<!--[-->`);

																	const each_array_3 = $.ensure_array_like(profiles);

																	for (let i = 0, $$length = each_array_3.length; i < $$length; i++) {
																		let profile = each_array_3[i];

																		{
																			function children($$renderer, { checked }) {
																				$$renderer.push(`<!---->${$.escape(profile.label)} <div class="ml-auto flex items-center">`);

																				if (checked) {
																					$$renderer.push('<!--[0-->');
																					Check($$renderer, { class: 'size-5' });
																				} else {
																					$$renderer.push('<!--[-1-->');
																				}

																				$$renderer.push(`<!--]--></div>`);
																			}

																			if (Menubar.RadioItem) {
																				$$renderer.push('<!--[-->');

																				Menubar.RadioItem($$renderer, {
																					class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
																					value: profile.value,
																					children,
																					$$slots: { default: true }
																				});

																				$$renderer.push('<!--]-->');
																			} else {
																				$$renderer.push('<!--[!-->');
																				$$renderer.push('<!--]-->');
																			}
																		}
																	}

																	$$renderer.push(`<!--]-->`);
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
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
																class: 'rounded-button data-highlighted:bg-muted flex h-10 select-none items-center py-3 pl-3 pr-1.5 text-sm font-medium focus-visible:outline-none',
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