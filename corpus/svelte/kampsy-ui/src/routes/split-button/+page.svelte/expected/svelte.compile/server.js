import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { SplitButton } from "$lib/index.js";

import {
	splitButtonDefault,
	splitButtonMenuAlignment,
	splitButtonTypes
} from "../../docs/data/split-button.js";

import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function description($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">Split Button</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">A button that offers a primary interaction coupled with a dropdown menu offering
			additional actions.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-nowrap items-center justify-between gap-4">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> <div class="overflow-hidden rounded-b-xl">`);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div></div>`);
}

function alignment($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex w-full gap-10">`);

				if (SplitButton.Root) {
					$$renderer.push('<!--[-->');

					SplitButton.Root($$renderer, {
						children: ($$renderer) => {
							if (SplitButton.Button) {
								$$renderer.push('<!--[-->');

								SplitButton.Button($$renderer, {
									onclick: () => alert("Clicked save"),
									children: ($$renderer) => {
										$$renderer.push(`<!---->save`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (SplitButton.Content) {
								$$renderer.push('<!--[-->');

								SplitButton.Content($$renderer, {
									class: 'w-66',
									children: ($$renderer) => {
										if (SplitButton.Item) {
											$$renderer.push('<!--[-->');

											SplitButton.Item($$renderer, {
												onClick: () => alert("Clicked save"),
												title: 'Save',
												description: 'Save changes'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SplitButton.Item) {
											$$renderer.push('<!--[-->');

											SplitButton.Item($$renderer, {
												onClick: () => alert("Clicked save + Redeploy"),
												title: 'Save + Redeploy',
												description: 'Save changes and create a new production deployment'
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

				if (SplitButton.Root) {
					$$renderer.push('<!--[-->');

					SplitButton.Root($$renderer, {
						alignment: 'right',
						children: ($$renderer) => {
							if (SplitButton.Button) {
								$$renderer.push('<!--[-->');

								SplitButton.Button($$renderer, {
									onclick: () => alert("Clicked save"),
									children: ($$renderer) => {
										$$renderer.push(`<!---->save`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (SplitButton.Content) {
								$$renderer.push('<!--[-->');

								SplitButton.Content($$renderer, {
									class: 'w-66',
									children: ($$renderer) => {
										if (SplitButton.Item) {
											$$renderer.push('<!--[-->');

											SplitButton.Item($$renderer, {
												onClick: () => alert("Clicked save"),
												title: 'Save',
												description: 'Save changes'
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (SplitButton.Item) {
											$$renderer.push('<!--[-->');

											SplitButton.Item($$renderer, {
												onClick: () => alert("Clicked save + Redeploy"),
												title: 'Save + Redeploy',
												description: 'Save changes and create a new production deployment'
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
				href: '/split-button#menu-alignment',
				'aria-label': 'menu-alignment',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Menu Alignment`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, splitButtonMenuAlignment);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "snippet", href: "/snippet" },
				next: { title: "status dot", href: "/status-dot" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	const sizes = ["small", "medium", "large"];
	const sbTypes = ["primary", "secondary", "tertiary", "error", "warning"];

	function defaultDescription($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div class="space-y-8"><div class="flex flex-wrap gap-4 lg:gap-8"><!--[-->`);

					const each_array = $.ensure_array_like(sizes);

					for (let index = 0, $$length = each_array.length; index < $$length; index++) {
						let size = each_array[index];

						if (SplitButton.Root) {
							$$renderer.push('<!--[-->');

							SplitButton.Root($$renderer, {
								children: ($$renderer) => {
									if (SplitButton.Button) {
										$$renderer.push('<!--[-->');

										SplitButton.Button($$renderer, {
											onclick: () => alert("Clicked save"),
											size,
											children: ($$renderer) => {
												$$renderer.push(`<!---->save`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (SplitButton.Content) {
										$$renderer.push('<!--[-->');

										SplitButton.Content($$renderer, {
											class: 'w-66',
											children: ($$renderer) => {
												if (SplitButton.Item) {
													$$renderer.push('<!--[-->');

													SplitButton.Item($$renderer, {
														onClick: () => alert("Clicked save"),
														title: 'Save',
														description: 'Save changes'
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (SplitButton.Item) {
													$$renderer.push('<!--[-->');

													SplitButton.Item($$renderer, {
														onClick: () => alert("Clicked save + Redeploy"),
														title: 'Save + Redeploy',
														description: 'Save changes and create a new production deployment'
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

					$$renderer.push(`<!--]--></div> <div class="flex w-full flex-wrap gap-4 lg:gap-8"><!--[-->`);

					const each_array_1 = $.ensure_array_like(sizes);

					for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
						let size = each_array_1[index];

						if (SplitButton.Root) {
							$$renderer.push('<!--[-->');

							SplitButton.Root($$renderer, {
								children: ($$renderer) => {
									if (SplitButton.Button) {
										$$renderer.push('<!--[-->');

										SplitButton.Button($$renderer, {
											onclick: () => alert("Clicked save"),
											size,
											type: 'secondary',
											children: ($$renderer) => {
												$$renderer.push(`<!---->save`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (SplitButton.Content) {
										$$renderer.push('<!--[-->');

										SplitButton.Content($$renderer, {
											class: 'w-66',
											children: ($$renderer) => {
												if (SplitButton.Item) {
													$$renderer.push('<!--[-->');

													SplitButton.Item($$renderer, {
														onClick: () => alert("Clicked save"),
														title: 'Save',
														description: 'Save changes'
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (SplitButton.Item) {
													$$renderer.push('<!--[-->');

													SplitButton.Item($$renderer, {
														onClick: () => alert("Clicked save + Redeploy"),
														title: 'Save + Redeploy',
														description: 'Save changes and create a new production deployment'
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

					$$renderer.push(`<!--]--></div></div>`);
				}

				LinkH2($$renderer, {
					href: '/split-button#split-button',
					'aria-label': 'split-button',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The button's primary action should be the first item in the dropdown menu.</p> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, splitButtonDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function types($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div class="flex w-full flex-wrap gap-4 lg:gap-10"><!--[-->`);

					const each_array_2 = $.ensure_array_like(sbTypes);

					for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
						let sbType = each_array_2[index];

						if (SplitButton.Root) {
							$$renderer.push('<!--[-->');

							SplitButton.Root($$renderer, {
								children: ($$renderer) => {
									if (SplitButton.Button) {
										$$renderer.push('<!--[-->');

										SplitButton.Button($$renderer, {
											onclick: () => alert("Clicked save"),
											type: sbType,
											children: ($$renderer) => {
												$$renderer.push(`<!---->save`);
											},
											$$slots: { default: true }
										});

										$$renderer.push('<!--]-->');
									} else {
										$$renderer.push('<!--[!-->');
										$$renderer.push('<!--]-->');
									}

									$$renderer.push(` `);

									if (SplitButton.Content) {
										$$renderer.push('<!--[-->');

										SplitButton.Content($$renderer, {
											class: 'w-66',
											children: ($$renderer) => {
												if (SplitButton.Item) {
													$$renderer.push('<!--[-->');

													SplitButton.Item($$renderer, {
														onClick: () => alert("Clicked save"),
														title: 'Save',
														description: 'Save changes'
													});

													$$renderer.push('<!--]-->');
												} else {
													$$renderer.push('<!--[!-->');
													$$renderer.push('<!--]-->');
												}

												$$renderer.push(` `);

												if (SplitButton.Item) {
													$$renderer.push('<!--[-->');

													SplitButton.Item($$renderer, {
														onClick: () => alert("Clicked save + Redeploy"),
														title: 'Save + Redeploy',
														description: 'Save changes and create a new production deployment'
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

					$$renderer.push(`<!--]--></div>`);
				}

				LinkH2($$renderer, {
					href: '/split-button#types',
					'aria-label': 'types',
					children: ($$renderer) => {
						$$renderer.push(`<!---->types`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, splitButtonTypes);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		description($$renderer);
		$$renderer.push(`<!----> `);
		defaultDescription($$renderer);
		$$renderer.push(`<!----> `);
		types($$renderer);
		$$renderer.push(`<!----> `);
		alignment($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	$.head('o806sc', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Split Button</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}