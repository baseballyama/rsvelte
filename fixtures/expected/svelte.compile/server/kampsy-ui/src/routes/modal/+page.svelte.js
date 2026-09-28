import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Button, Modal, Text } from "$lib/index.js";

import {
	modalDefault,
	modalDisabkedActions,
	modalSingleButton,
	modalSticky
} from "../../docs/data/modal.js";

import { ArrowLeft } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function modal($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">modal</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Display popup content that requires attention or provides additional information.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 overflow-hidden rounded-xl border"><div class="w-full overflow-x-auto p-4 lg:p-6"><div class="flex w-full flex-wrap gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> `);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div>`);
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "menu", href: "/menu" },
				next: { title: "note", href: "/note" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let active = false;
	let activeSticky = false;
	let activeSingleButton = false;
	let activeDisabled = false;

	function defaultModal($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div>`);

					Button($$renderer, {
						onclick: () => active = true,
						size: 'small',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Modal.Root) {
						$$renderer.push('<!--[-->');

						Modal.Root($$renderer, {
							get active() {
								return active;
							},

							set active($$value) {
								active = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Modal.Content) {
									$$renderer.push('<!--[-->');

									Modal.Content($$renderer, {
										children: ($$renderer) => {
											if (Modal.Body) {
												$$renderer.push('<!--[-->');

												Modal.Body($$renderer, {
													children: ($$renderer) => {
														if (Modal.Header) {
															$$renderer.push('<!--[-->');

															Modal.Header($$renderer, {
																children: ($$renderer) => {
																	if (Modal.Title) {
																		$$renderer.push('<!--[-->');

																		Modal.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Create Token`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Modal.Subtitle) {
																		$$renderer.push('<!--[-->');

																		Modal.Subtitle($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Enter a unique name for your token to differentiate it from other tokens
										and then select the scope.`);
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

														Text($$renderer, {
															size: 14,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Some content contained within the modal.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Modal.Footer) {
												$$renderer.push('<!--[-->');

												Modal.Footer($$renderer, {
													children: ($$renderer) => {
														Button($$renderer, {
															onclick: () => active = false,
															variant: 'secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cancel`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															onclick: () => active = false,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Submit`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
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

				LinkH2($$renderer, {
					href: '/modal#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, modalDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function sticky($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div>`);

					Button($$renderer, {
						onclick: () => activeSticky = true,
						size: 'small',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Modal.Root) {
						$$renderer.push('<!--[-->');

						Modal.Root($$renderer, {
							sticky: true,
							get active() {
								return activeSticky;
							},

							set active($$value) {
								activeSticky = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Modal.Content) {
									$$renderer.push('<!--[-->');

									Modal.Content($$renderer, {
										children: ($$renderer) => {
											if (Modal.Body) {
												$$renderer.push('<!--[-->');

												Modal.Body($$renderer, {
													children: ($$renderer) => {
														if (Modal.Header) {
															$$renderer.push('<!--[-->');

															Modal.Header($$renderer, {
																children: ($$renderer) => {
																	if (Modal.Title) {
																		$$renderer.push('<!--[-->');

																		Modal.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Create Token`);
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

														$$renderer.push(` <!--[-->`);

														const each_array = $.ensure_array_like(Array(60));

														for (let index = 0, $$length = each_array.length; index < $$length; index++) {
															Text($$renderer, {
																size: 14,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Some content contained within the modal.`);
																},
																$$slots: { default: true }
															});
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

											if (Modal.Footer) {
												$$renderer.push('<!--[-->');

												Modal.Footer($$renderer, {
													children: ($$renderer) => {
														$$renderer.push(`<div class="flex gap-3">`);

														Button($$renderer, {
															onclick: () => activeSticky = false,
															variant: 'secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cancel`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														{
															function prefix($$renderer) {
																ArrowLeft($$renderer, {});
															}

															Button($$renderer, {
																onclick: () => activeSticky = false,
																variant: 'secondary',
																prefix,
																children: ($$renderer) => {
																	$$renderer.push(`<!---->Previous`);
																},
																$$slots: { prefix: true, default: true }
															});
														}

														$$renderer.push(`<!----></div> `);

														Button($$renderer, {
															onclick: () => activeSticky = false,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Submit`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
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

				LinkH2($$renderer, {
					href: '/modal#sticky',
					'aria-label': 'sticky',
					children: ($$renderer) => {
						$$renderer.push(`<!---->sticky`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, modalSticky);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function singleButton($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div>`);

					Button($$renderer, {
						onclick: () => activeSingleButton = true,
						size: 'small',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Modal.Root) {
						$$renderer.push('<!--[-->');

						Modal.Root($$renderer, {
							get active() {
								return activeSingleButton;
							},

							set active($$value) {
								activeSingleButton = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Modal.Content) {
									$$renderer.push('<!--[-->');

									Modal.Content($$renderer, {
										children: ($$renderer) => {
											if (Modal.Body) {
												$$renderer.push('<!--[-->');

												Modal.Body($$renderer, {
													children: ($$renderer) => {
														if (Modal.Header) {
															$$renderer.push('<!--[-->');

															Modal.Header($$renderer, {
																children: ($$renderer) => {
																	if (Modal.Title) {
																		$$renderer.push('<!--[-->');

																		Modal.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Create Token`);
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

														Text($$renderer, {
															size: 14,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Some content contained within the modal.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Modal.Footer) {
												$$renderer.push('<!--[-->');

												Modal.Footer($$renderer, {
													children: ($$renderer) => {
														Button($$renderer, {
															onclick: () => activeSingleButton = false,
															variant: 'secondary',
															class: 'w-full',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cancel`);
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

				LinkH2($$renderer, {
					href: '/modal#single-button',
					'aria-label': 'single-button',
					children: ($$renderer) => {
						$$renderer.push(`<!---->single button`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, modalSingleButton);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function disabled($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div>`);

					Button($$renderer, {
						onclick: () => activeDisabled = true,
						size: 'small',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Open Modal`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (Modal.Root) {
						$$renderer.push('<!--[-->');

						Modal.Root($$renderer, {
							get active() {
								return activeDisabled;
							},

							set active($$value) {
								activeDisabled = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Modal.Content) {
									$$renderer.push('<!--[-->');

									Modal.Content($$renderer, {
										children: ($$renderer) => {
											if (Modal.Body) {
												$$renderer.push('<!--[-->');

												Modal.Body($$renderer, {
													children: ($$renderer) => {
														if (Modal.Header) {
															$$renderer.push('<!--[-->');

															Modal.Header($$renderer, {
																children: ($$renderer) => {
																	if (Modal.Title) {
																		$$renderer.push('<!--[-->');

																		Modal.Title($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->Create Token`);
																			},
																			$$slots: { default: true }
																		});

																		$$renderer.push('<!--]-->');
																	} else {
																		$$renderer.push('<!--[!-->');
																		$$renderer.push('<!--]-->');
																	}

																	$$renderer.push(` `);

																	if (Modal.Subtitle) {
																		$$renderer.push('<!--[-->');

																		Modal.Subtitle($$renderer, {
																			children: ($$renderer) => {
																				$$renderer.push(`<!---->This is a modal.`);
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

														Text($$renderer, {
															size: 14,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Some content contained within the modal.`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Modal.Footer) {
												$$renderer.push('<!--[-->');

												Modal.Footer($$renderer, {
													children: ($$renderer) => {
														Button($$renderer, {
															onclick: () => activeDisabled = false,
															variant: 'secondary',
															children: ($$renderer) => {
																$$renderer.push(`<!---->Cancel`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!----> `);

														Button($$renderer, {
															disabled: true,
															onclick: () => activeDisabled = false,
															children: ($$renderer) => {
																$$renderer.push(`<!---->Submit`);
															},
															$$slots: { default: true }
														});

														$$renderer.push(`<!---->`);
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

				LinkH2($$renderer, {
					href: '/modal#disabled-actions',
					'aria-label': 'disabled-actions',
					children: ($$renderer) => {
						$$renderer.push(`<!---->disabled actions`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, modalDisabkedActions);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		modal($$renderer);
		$$renderer.push(`<!----> `);
		defaultModal($$renderer);
		$$renderer.push(`<!----> `);
		sticky($$renderer);
		$$renderer.push(`<!----> `);
		singleButton($$renderer);
		$$renderer.push(`<!----> `);
		disabled($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('hd132u', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Modal</title>`);
			});
		});

		Shell($$renderer, { asideSlot: aside, contSlot: cont });
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}