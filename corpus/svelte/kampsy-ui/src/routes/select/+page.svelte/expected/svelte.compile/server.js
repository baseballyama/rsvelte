import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Select } from "$lib/index.js";
import { selectDefault, selectSize, selectError } from "$lib/../docs/data/select.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function select($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">select</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display a dropdown list of items.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="grid w-full gap-4 lg:flex lg:flex-wrap lg:justify-between">`);
	demo($$renderer);
	$$renderer.push(`<!----></div></div> <div class="overflow-hidden rounded-b-xl">`);
	CollapseCode($$renderer, { code });
	$$renderer.push(`<!----></div></div>`);
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "project banner", href: "/project-banner" },
				next: { title: "show more", href: "/show-more" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let value = "";
	let error = "Please select a value.";
	let loading = true;

	function defaultSelect($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							class: 'w-full lg:w-auto',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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
					href: '/select#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Displays a list of options for the user to pick from—triggered by a button.</p> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, selectDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function size($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							size: 'small',
							class: 'w-full lg:w-auto',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							class: 'w-full lg:w-auto',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							size: 'large',
							class: 'w-full lg:w-auto',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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
					href: '/select#size',
					'aria-label': 'size',
					children: ($$renderer) => {
						$$renderer.push(`<!---->size`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, selectSize);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function errorSnip($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							size: 'small',
							class: 'w-full lg:w-auto',
							get error() {
								return error;
							},

							set error($$value) {
								error = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							class: 'w-full lg:w-auto',
							get error() {
								return error;
							},

							set error($$value) {
								error = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							size: 'large',
							class: 'w-full lg:w-auto',
							get error() {
								return error;
							},

							set error($$value) {
								error = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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
					href: '/select#size',
					'aria-label': 'size',
					children: ($$renderer) => {
						$$renderer.push(`<!---->error`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, selectError);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function loadingSnip($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							size: 'small',
							class: 'w-full lg:w-auto',
							get loading() {
								return loading;
							},

							set loading($$value) {
								loading = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							class: 'w-full lg:w-auto',
							get loading() {
								return loading;
							},

							set loading($$value) {
								loading = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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

					if (Select.Root) {
						$$renderer.push('<!--[-->');

						Select.Root($$renderer, {
							size: 'large',
							class: 'w-full lg:w-auto',
							get loading() {
								return loading;
							},

							set loading($$value) {
								loading = $$value;
								$$settled = false;
							},

							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Select.Trigger) {
									$$renderer.push('<!--[-->');

									Select.Trigger($$renderer, {
										class: 'w-full lg:w-[200px]',
										children: ($$renderer) => {
											if (Select.Value) {
												$$renderer.push('<!--[-->');
												Select.Value($$renderer, { placeholder: 'select a fruit' });
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

								if (Select.Content) {
									$$renderer.push('<!--[-->');

									Select.Content($$renderer, {
										children: ($$renderer) => {
											if (Select.Item) {
												$$renderer.push('<!--[-->');

												Select.Item($$renderer, {
													value: 'apple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->apple`);
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
													value: 'banana',
													children: ($$renderer) => {
														$$renderer.push(`<!---->banana`);
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
													value: 'orange',
													children: ($$renderer) => {
														$$renderer.push(`<!---->orange`);
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
													value: 'pineapple',
													children: ($$renderer) => {
														$$renderer.push(`<!---->pineapple`);
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
					href: '/select#size',
					'aria-label': 'size',
					children: ($$renderer) => {
						$$renderer.push(`<!---->loading`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, selectError);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		select($$renderer);
		$$renderer.push(`<!----> `);
		defaultSelect($$renderer);
		$$renderer.push(`<!----> `);
		size($$renderer);
		$$renderer.push(`<!----> `);
		errorSnip($$renderer);
		$$renderer.push(`<!----> `);
		loadingSnip($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('18utmfh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Select</title>`);
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