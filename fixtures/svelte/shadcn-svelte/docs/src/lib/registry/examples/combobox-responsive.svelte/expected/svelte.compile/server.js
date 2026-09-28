import * as $ from 'svelte/internal/server';
import { browser } from "$app/environment";
import { onMount } from "svelte";
import * as Command from "$lib/registry/ui/command/index.js";
import * as Drawer from "$lib/registry/ui/drawer/index.js";
import * as Popover from "$lib/registry/ui/popover/index.js";
import { Button } from "$lib/registry/ui/button/index.js";

export default function Combobox_responsive($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const statuses = [
			{ value: "backlog", label: "Backlog" },
			{ value: "todo", label: "Todo" },
			{ value: "in progress", label: "In Progress" },
			{ value: "done", label: "Done" },
			{ value: "canceled", label: "Canceled" }
		];

		let open = false;
		let selectedStatus = null;
		let isDesktop = false;

		function checkScreenSize() {
			isDesktop = window.innerWidth >= 768;
		}

		onMount(() => {
			if (browser) {
				checkScreenSize();
				window.addEventListener("resize", checkScreenSize);

				return () => window.removeEventListener("resize", checkScreenSize);
			}
		});

		function handleStatusSelect(value) {
			selectedStatus = statuses.find((status) => status.value === value) || null;
			open = false;
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isDesktop) {
				$$renderer.push('<!--[0-->');

				if (Popover.Root) {
					$$renderer.push('<!--[-->');

					Popover.Root($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Popover.Trigger) {
								$$renderer.push('<!--[-->');

								Popover.Trigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											class: 'w-[150px] justify-start',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(selectedStatus ? selectedStatus.label : "+ Set status")}`);
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

							if (Popover.Content) {
								$$renderer.push('<!--[-->');

								Popover.Content($$renderer, {
									class: 'w-[200px] p-0',
									align: 'start',
									children: ($$renderer) => {
										if (Command.Root) {
											$$renderer.push('<!--[-->');

											Command.Root($$renderer, {
												children: ($$renderer) => {
													if (Command.Input) {
														$$renderer.push('<!--[-->');
														Command.Input($$renderer, { placeholder: 'Filter status...' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.List) {
														$$renderer.push('<!--[-->');

														Command.List($$renderer, {
															children: ($$renderer) => {
																if (Command.Empty) {
																	$$renderer.push('<!--[-->');

																	Command.Empty($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->No results found.`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array = $.ensure_array_like(statuses);

																			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
																				let status = each_array[$$index];

																				if (Command.Item) {
																					$$renderer.push('<!--[-->');

																					Command.Item($$renderer, {
																						value: status.value,
																						onSelect: () => handleStatusSelect(status.value),
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(status.label)}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
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
						},
						$$slots: { default: true }
					});

					$$renderer.push('<!--]-->');
				} else {
					$$renderer.push('<!--[!-->');
					$$renderer.push('<!--]-->');
				}
			} else {
				$$renderer.push('<!--[-1-->');

				if (Drawer.Root) {
					$$renderer.push('<!--[-->');

					Drawer.Root($$renderer, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							if (Drawer.Trigger) {
								$$renderer.push('<!--[-->');

								Drawer.Trigger($$renderer, {
									children: ($$renderer) => {
										Button($$renderer, {
											variant: 'outline',
											class: 'w-[150px] justify-start',
											children: ($$renderer) => {
												$$renderer.push(`<!---->${$.escape(selectedStatus ? selectedStatus.label : "+ Set status")}`);
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

							if (Drawer.Content) {
								$$renderer.push('<!--[-->');

								Drawer.Content($$renderer, {
									children: ($$renderer) => {
										$$renderer.push(`<div class="mt-4 border-t">`);

										if (Command.Root) {
											$$renderer.push('<!--[-->');

											Command.Root($$renderer, {
												children: ($$renderer) => {
													if (Command.Input) {
														$$renderer.push('<!--[-->');
														Command.Input($$renderer, { placeholder: 'Filter status...' });
														$$renderer.push('<!--]-->');
													} else {
														$$renderer.push('<!--[!-->');
														$$renderer.push('<!--]-->');
													}

													$$renderer.push(` `);

													if (Command.List) {
														$$renderer.push('<!--[-->');

														Command.List($$renderer, {
															children: ($$renderer) => {
																if (Command.Empty) {
																	$$renderer.push('<!--[-->');

																	Command.Empty($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!---->No results found.`);
																		},
																		$$slots: { default: true }
																	});

																	$$renderer.push('<!--]-->');
																} else {
																	$$renderer.push('<!--[!-->');
																	$$renderer.push('<!--]-->');
																}

																$$renderer.push(` `);

																if (Command.Group) {
																	$$renderer.push('<!--[-->');

																	Command.Group($$renderer, {
																		children: ($$renderer) => {
																			$$renderer.push(`<!--[-->`);

																			const each_array_1 = $.ensure_array_like(statuses);

																			for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
																				let status = each_array_1[$$index_1];

																				if (Command.Item) {
																					$$renderer.push('<!--[-->');

																					Command.Item($$renderer, {
																						value: status.value,
																						onSelect: () => handleStatusSelect(status.value),
																						children: ($$renderer) => {
																							$$renderer.push(`<!---->${$.escape(status.label)}`);
																						},
																						$$slots: { default: true }
																					});

																					$$renderer.push('<!--]-->');
																				} else {
																					$$renderer.push('<!--[!-->');
																					$$renderer.push('<!--]-->');
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
			}

			$$renderer.push(`<!--]-->`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}