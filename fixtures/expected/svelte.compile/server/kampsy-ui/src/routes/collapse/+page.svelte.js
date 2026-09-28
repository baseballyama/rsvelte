import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";

import {
	collapseDefault,
	collapseExpanded,
	collapseMultiple,
	collapseSize
} from "../../docs/data/collapse.js";

import { Collapse, Pagination, Tabs, Text } from "$lib/index.js";
import { fade } from "svelte/transition";
import { Webhook, Accessibility } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function collapse($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">collapse</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">A set of headings, vertically stacked, that each reveal an related section of content.
			Commonly referred to as an accordion.</p>`);
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

function roundedCode($$renderer, rct) {
	$$renderer.push(`<code class="text-kui-light-gray-900 bg-kui-light-gray-100 dark:bg-kui-dark-gray-100 dark:text-kui-dark-gray-900 border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-md border px-2 py-[3.6px] text-xs">${$.escape(rct)}</code>`);
}

function accessibility($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize">Accessibility</h2> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">This component aims to adhere to <a href="https://www.w3.org/TR/WCAG22/" class="text-kui-light-blue-900 dark:text-kui-dark-blue-900 underline">WCAG 2.2 (level AA)</a> guidelines. Ensure this compliance is maintained when the component is integrated into other
			projects.</p> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Accordion headings should clearly and accurately describe the content within each
			corresponding section.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Do not use an accordion if it conceals essential information the user needs to complete
			actions on the page.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Ensure that the Collapse.Trigger has a `);
					roundedCode($$renderer, 'role="heading"');
					$$renderer.push(`<!----> attribute. This heading should have an appropriate `);
					roundedCode($$renderer, "aria-level");

					$$renderer.push(`<!----> designation,
			based on its position in the page hierarchy.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->If the accordion panel linked to the heading is visible, then the Collapse.Trigger must
			have `);

					roundedCode($$renderer, 'aria-expanded="true"');
					$$renderer.push(`<!----> .`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->The Collapse.Trigger must have an `);
					roundedCode($$renderer, "aria-controls");

					$$renderer.push(`<!----> attribute that points
			to the ID of the associated accordion panel.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Add the `);
					roundedCode($$renderer, "aria-labelledby");

					$$renderer.push(`<!----> attribute to Collapse.Content and set its
			ID value to the aria-controls of Collapse.Trigger.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Avoid keyboard traps when adding components to the accordion panel. For instance, users
			can expand an accordion but may not be able to tab to the next focusable element.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "choicebox", href: "/choicebox" },
				next: { title: "copy button", href: "/copy-button" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let selected = "implementation";

	const questions = [
		"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
		"Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur."
	];

	function tabSnip($$renderer) {
		Row($$renderer, {
			bottomLine: false,
			class: 'py-1!',
			children: ($$renderer) => {
				Tabs($$renderer, {
					tabs: [
						{
							title: "Implementation",
							value: "implementation",
							icon: Webhook
						},

						{
							title: "Accessibility",
							value: "accessibility",
							icon: Accessibility
						}
					],

					get selected() {
						return selected;
					},

					set selected($$value) {
						selected = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});
	}

	function defaultCollapse($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Collapse.Root) {
						$$renderer.push('<!--[-->');

						Collapse.Root($$renderer, {
							children: ($$renderer) => {
								if (Collapse.Item) {
									$$renderer.push('<!--[-->');

									Collapse.Item($$renderer, {
										value: '1',
										children: ($$renderer) => {
											if (Collapse.Trigger) {
												$$renderer.push('<!--[-->');

												Collapse.Trigger($$renderer, {
													role: 'heading',
													'aria-level': 3,
													type: 'button',
													'aria-controls': 'tab1-section',
													'aria-expanded': 'false',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Question A`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Collapse.Content) {
												$$renderer.push('<!--[-->');

												Collapse.Content($$renderer, {
													id: 'tab1-section',
													'aria-hidden': 'true',
													'aria-labelledby': 'tab1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(questions[0])}`);
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

								if (Collapse.Item) {
									$$renderer.push('<!--[-->');

									Collapse.Item($$renderer, {
										value: '2',
										children: ($$renderer) => {
											if (Collapse.Trigger) {
												$$renderer.push('<!--[-->');

												Collapse.Trigger($$renderer, {
													role: 'heading',
													'aria-level': 3,
													type: 'button',
													'aria-controls': 'tab2-section',
													'aria-expanded': 'false',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Question B`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Collapse.Content) {
												$$renderer.push('<!--[-->');

												Collapse.Content($$renderer, {
													id: 'tab2-section',
													'aria-hidden': 'true',
													'aria-labelledby': 'tab2',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(questions[1])}`);
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

				LinkH2($$renderer, {
					href: '/collapse#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, collapseDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function expanded($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Collapse.Root) {
						$$renderer.push('<!--[-->');

						Collapse.Root($$renderer, {
							children: ($$renderer) => {
								if (Collapse.Item) {
									$$renderer.push('<!--[-->');

									Collapse.Item($$renderer, {
										value: '1',
										children: ($$renderer) => {
											if (Collapse.Trigger) {
												$$renderer.push('<!--[-->');

												Collapse.Trigger($$renderer, {
													role: 'heading',
													'aria-level': 3,
													type: 'button',
													'aria-controls': 'tab1-section',
													'aria-expanded': 'false',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Question A`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Collapse.Content) {
												$$renderer.push('<!--[-->');

												Collapse.Content($$renderer, {
													id: 'tab2-section',
													'aria-hidden': 'true',
													'aria-labelledby': 'tab2',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(questions[0])}`);
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

								if (Collapse.Item) {
									$$renderer.push('<!--[-->');

									Collapse.Item($$renderer, {
										defaultExpanded: true,
										value: '2',
										children: ($$renderer) => {
											if (Collapse.Trigger) {
												$$renderer.push('<!--[-->');

												Collapse.Trigger($$renderer, {
													role: 'heading',
													'aria-level': 3,
													type: 'button',
													'aria-controls': 'tab2-section',
													'aria-expanded': 'true',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Question B`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Collapse.Content) {
												$$renderer.push('<!--[-->');

												Collapse.Content($$renderer, {
													id: 'tab2-section',
													'aria-hidden': 'false',
													'aria-labelledby': 'tab2',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(questions[1])}`);
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

				LinkH2($$renderer, {
					href: '/collapse#expanded',
					'aria-label': 'expanded',
					children: ($$renderer) => {
						$$renderer.push(`<!---->expanded`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, collapseExpanded);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function multiple($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Collapse.Root) {
						$$renderer.push('<!--[-->');

						Collapse.Root($$renderer, {
							multiple: true,
							children: ($$renderer) => {
								if (Collapse.Item) {
									$$renderer.push('<!--[-->');

									Collapse.Item($$renderer, {
										value: '1',
										children: ($$renderer) => {
											if (Collapse.Trigger) {
												$$renderer.push('<!--[-->');

												Collapse.Trigger($$renderer, {
													role: 'heading',
													'aria-level': 3,
													type: 'button',
													'aria-controls': 'tab1-section',
													'aria-expanded': 'false',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Question A`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Collapse.Content) {
												$$renderer.push('<!--[-->');

												Collapse.Content($$renderer, {
													id: 'tab2-section',
													'aria-hidden': 'true',
													'aria-labelledby': 'tab2',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(questions[0])}`);
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

								if (Collapse.Item) {
									$$renderer.push('<!--[-->');

									Collapse.Item($$renderer, {
										value: '2',
										children: ($$renderer) => {
											if (Collapse.Trigger) {
												$$renderer.push('<!--[-->');

												Collapse.Trigger($$renderer, {
													role: 'heading',
													'aria-level': 3,
													type: 'button',
													'aria-controls': 'tab2-section',
													'aria-expanded': 'true',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Question B`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Collapse.Content) {
												$$renderer.push('<!--[-->');

												Collapse.Content($$renderer, {
													id: 'tab2-section',
													'aria-hidden': 'false',
													'aria-labelledby': 'tab2',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(questions[1])}`);
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

				LinkH2($$renderer, {
					href: '/collapse#multiple',
					'aria-label': 'multiple',
					children: ($$renderer) => {
						$$renderer.push(`<!---->multiple`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, collapseMultiple);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function size($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Collapse.Root) {
						$$renderer.push('<!--[-->');

						Collapse.Root($$renderer, {
							children: ($$renderer) => {
								if (Collapse.Item) {
									$$renderer.push('<!--[-->');

									Collapse.Item($$renderer, {
										size: 'small',
										value: '1',
										children: ($$renderer) => {
											if (Collapse.Trigger) {
												$$renderer.push('<!--[-->');

												Collapse.Trigger($$renderer, {
													role: 'heading',
													'aria-level': 3,
													type: 'button',
													'aria-controls': 'tab1-section',
													'aria-expanded': 'false',
													children: ($$renderer) => {
														$$renderer.push(`<!---->Question A`);
													},
													$$slots: { default: true }
												});

												$$renderer.push('<!--]-->');
											} else {
												$$renderer.push('<!--[!-->');
												$$renderer.push('<!--]-->');
											}

											$$renderer.push(` `);

											if (Collapse.Content) {
												$$renderer.push('<!--[-->');

												Collapse.Content($$renderer, {
													id: 'tab1-section',
													'aria-hidden': 'true',
													'aria-labelledby': 'tab1',
													children: ($$renderer) => {
														$$renderer.push(`<!---->${$.escape(questions[0])}`);
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

				LinkH2($$renderer, {
					href: '/collapse#small',
					'aria-label': 'small',
					children: ($$renderer) => {
						$$renderer.push(`<!---->small`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, collapseSize);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		collapse($$renderer);
		$$renderer.push(`<!----> `);
		tabSnip($$renderer);
		$$renderer.push(`<!----> `);

		if (selected == "implementation") {
			$$renderer.push(`<!--[0--><section>`);
			defaultCollapse($$renderer);
			$$renderer.push(`<!----> `);
			expanded($$renderer);
			$$renderer.push(`<!----> `);
			multiple($$renderer);
			$$renderer.push(`<!----> `);
			size($$renderer);
			$$renderer.push(`<!----></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (selected == "accessibility") {
			$$renderer.push(`<!--[0--><section>`);
			accessibility($$renderer);
			$$renderer.push(`<!----></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('26ye2c', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Collapse</title>`);
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