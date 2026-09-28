import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import RoundedCode from "$lib/../docs/ui/roundedCode.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import { Menu, Tabs, Text } from "$lib/index.js";
import Pagination from "$lib/pagination/pagination.svelte";

import {
	menuAlignment,
	menuDefault,
	menuLinkItem,
	menuPrefixAndSuffix
} from "../../docs/data/menu.js";

import { MoreHorizontal, Accessibility, Webhook } from "$lib/icons/index.js";
import { fade } from "svelte/transition";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function menu($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-12 lg:tracking-[-2.4px]">menu</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-7.5 lg:tracking-[-0.33px]">Dropdown menu opened via button. Supports keyboard navigation. The position will
			automatically adapt based on the window bounds.</p>`);
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

function defaultMenu($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				if (Menu.Root) {
					$$renderer.push('<!--[-->');

					Menu.Root($$renderer, {
						children: ($$renderer) => {
							if (Menu.Button) {
								$$renderer.push('<!--[-->');

								Menu.Button($$renderer, {
									'aria-controls': 'menu',
									'aria-expanded': 'false',
									'aria-haspopup': 'true',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Actions`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Content) {
								$$renderer.push('<!--[-->');

								Menu.Content($$renderer, {
									id: 'menu',
									'aria-hidden': 'true',
									class: 'w-50',
									children: ($$renderer) => {
										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												onClick: () => console.log("One"),
												children: ($$renderer) => {
													$$renderer.push(`<!---->One`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												onClick: () => console.log("Two"),
												children: ($$renderer) => {
													$$renderer.push(`<!---->Two`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												onClick: () => console.log("Three"),
												children: ($$renderer) => {
													$$renderer.push(`<!---->One`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Link) {
											$$renderer.push('<!--[-->');

											Menu.Link($$renderer, {
												href: 'https://ui.kampsy.xyz',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Test for Link`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												onClick: () => console.log("Delete"),
												type: 'error',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Delete`);
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
				href: '/menu#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Menu extends the <a href="/button" class="underline">Button component.</a></p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, menuDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function linkItem($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full">`);

				if (Menu.Root) {
					$$renderer.push('<!--[-->');

					Menu.Root($$renderer, {
						children: ($$renderer) => {
							if (Menu.Button) {
								$$renderer.push('<!--[-->');

								Menu.Button($$renderer, {
									'aria-controls': 'menu-2',
									'aria-expanded': 'false',
									'aria-haspopup': 'true',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Actions`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Content) {
								$$renderer.push('<!--[-->');

								Menu.Content($$renderer, {
									id: 'menu-2',
									'aria-hidden': 'true',
									class: 'w-50',
									children: ($$renderer) => {
										if (Menu.Link) {
											$$renderer.push('<!--[-->');

											Menu.Link($$renderer, {
												href: '/menu',
												children: ($$renderer) => {
													$$renderer.push(`<!---->One`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Link) {
											$$renderer.push('<!--[-->');

											Menu.Link($$renderer, {
												href: '#/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->Two`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Link) {
											$$renderer.push('<!--[-->');

											Menu.Link($$renderer, {
												href: '#/',
												children: ($$renderer) => {
													$$renderer.push(`<!---->One`);
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
				href: '/menu#link-item',
				'aria-label': 'link item',
				children: ($$renderer) => {
					$$renderer.push(`<!---->link item`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, menuLinkItem);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function defaultPrefixAndSuffix($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex w-full gap-6">`);

				if (Menu.Root) {
					$$renderer.push('<!--[-->');

					Menu.Root($$renderer, {
						children: ($$renderer) => {
							if (Menu.Button) {
								$$renderer.push('<!--[-->');

								Menu.Button($$renderer, {
									shape: 'square',
									size: 'small',
									variant: 'secondary',
									svgOnly: true,
									'aria-label': 'Actions',
									'aria-controls': 'menu-3',
									'aria-expanded': 'false',
									'aria-haspopup': 'true',
									children: ($$renderer) => {
										MoreHorizontal($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Content) {
								$$renderer.push('<!--[-->');

								Menu.Content($$renderer, {
									id: 'menu-3',
									'aria-hidden': 'true',
									class: 'w-50',
									children: ($$renderer) => {
										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												prefix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Left`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												prefix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Center`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												prefix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Right`);
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

				if (Menu.Root) {
					$$renderer.push('<!--[-->');

					Menu.Root($$renderer, {
						children: ($$renderer) => {
							if (Menu.Button) {
								$$renderer.push('<!--[-->');

								Menu.Button($$renderer, {
									shape: 'square',
									size: 'small',
									variant: 'secondary',
									svgOnly: true,
									'aria-label': 'Actions',
									'aria-controls': 'menu-4',
									'aria-expanded': 'false',
									'aria-haspopup': 'true',
									children: ($$renderer) => {
										MoreHorizontal($$renderer, {});
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Content) {
								$$renderer.push('<!--[-->');

								Menu.Content($$renderer, {
									id: 'menu-4',
									'aria-hidden': 'true',
									class: 'w-50',
									children: ($$renderer) => {
										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												suffix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Left`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												suffix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Center`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												suffix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Right`);
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
				href: '/menu#prefix-and-suffix',
				'aria-label': 'prefix and suffix',
				children: ($$renderer) => {
					$$renderer.push(`<!---->prefix and suffix`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The trigger is still wrapped by an unstyled button.</p> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, menuPrefixAndSuffix);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function alignment($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex w-full justify-between gap-8">`);

				if (Menu.Root) {
					$$renderer.push('<!--[-->');

					Menu.Root($$renderer, {
						children: ($$renderer) => {
							if (Menu.Button) {
								$$renderer.push('<!--[-->');

								Menu.Button($$renderer, {
									'aria-controls': 'menu-5',
									'aria-expanded': 'false',
									'aria-haspopup': 'true',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Actions`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Content) {
								$$renderer.push('<!--[-->');

								Menu.Content($$renderer, {
									id: 'menu-5',
									'aria-hidden': 'true',
									class: 'w-50',
									children: ($$renderer) => {
										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												prefix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Left`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												prefix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Center`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												prefix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Right`);
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

				if (Menu.Root) {
					$$renderer.push('<!--[-->');

					Menu.Root($$renderer, {
						alignment: 'right',
						children: ($$renderer) => {
							if (Menu.Button) {
								$$renderer.push('<!--[-->');

								Menu.Button($$renderer, {
									'aria-controls': 'menu-6',
									'aria-expanded': 'false',
									'aria-haspopup': 'true',
									children: ($$renderer) => {
										$$renderer.push(`<!---->Actions`);
									},
									$$slots: { default: true }
								});

								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` `);

							if (Menu.Content) {
								$$renderer.push('<!--[-->');

								Menu.Content($$renderer, {
									id: 'menu-6',
									'aria-hidden': 'true',
									class: 'w-50',
									children: ($$renderer) => {
										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												suffix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Left`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												suffix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Center`);
												},
												$$slots: { default: true }
											});

											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}

										$$renderer.push(` `);

										if (Menu.Item) {
											$$renderer.push('<!--[-->');

											Menu.Item($$renderer, {
												suffix: Accessibility,
												children: ($$renderer) => {
													$$renderer.push(`<!---->Right`);
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
				href: '/menu#menu-alignment',
				'aria-label': 'menu alignment',
				children: ($$renderer) => {
					$$renderer.push(`<!---->menu alignment`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, menuAlignment);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function howItWorks($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">How it works</h2> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">The dropdown menu is a secondary menu which can be applied to `);
			RoundedCode($$renderer, { text: 'Menu.Button' });
			$$renderer.push(`<!---->. The `);
			RoundedCode($$renderer, { text: 'Menu.Button' });
			$$renderer.push(`<!----> contains a few aria-attributes:</p> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->An `);
					RoundedCode($$renderer, { text: 'aria-controls' });
					$$renderer.push(`<!----> attribute matching the id of the `);
					RoundedCode($$renderer, { text: 'Menu.Content' });
					$$renderer.push(`<!----> containing the menu.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->An `);
					RoundedCode($$renderer, { text: 'aria-expanded' });

					$$renderer.push(`<!----> attribute, the value always being the opposite of the
			aria-hidden value on the `);

					RoundedCode($$renderer, { text: 'Menu.Content' });
					$$renderer.push(`<!---->.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->An `);
					RoundedCode($$renderer, { text: 'aria-haspopup' });
					$$renderer.push(`<!----> with the value of true.`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> `);

			Text($$renderer, {
				size: { sm: 14, md: 16, lg: 16 },
				class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 xl:mt-4',
				children: ($$renderer) => {
					$$renderer.push(`<!---->Keyboard interaction: `);

					Text($$renderer, {
						size: { sm: 12, md: 14, lg: 14 },
						class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
						children: ($$renderer) => {
							$$renderer.push(`<!---->The Enter and space keys opens the menu`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						size: { sm: 12, md: 14, lg: 14 },
						class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
						children: ($$renderer) => {
							$$renderer.push(`<!---->The Escape closes the menu`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Text($$renderer, {
						size: { sm: 12, md: 14, lg: 14 },
						class: 'text-kui-light-gray-900 dark:text-kui-dark-gray-900',
						children: ($$renderer) => {
							$$renderer.push(`<!---->When the menu is open, the Tab key will move through the menu items and once it leaves
				the final item, the menu closes. AT will then announce the pop up has collapsed.`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!---->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});
}

function considerations($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-8 font-semibold tracking-[-0.96px] first-letter:capitalize">Considerations</h2> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">This component aims to adhere to <a href="https://www.w3.org/TR/WCAG22/" class="text-kui-light-blue-900 dark:text-kui-dark-blue-900 underline">WCAG 2.2 (level AA)</a> guidelines. Ensure this compliance is maintained when the component is integrated into other
			projects.</p>`);
		},
		$$slots: { default: true }
	});
}

function prevAndNext($$renderer) {
	Row($$renderer, {
		bottomLine: false,
		children: ($$renderer) => {
			Pagination($$renderer, {
				previous: { title: "keyboard input", href: "/keyboard-input" },
				next: { title: "modal", href: "/modal" }
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

	function cont($$renderer) {
		menu($$renderer);
		$$renderer.push(`<!----> `);
		tabSnip($$renderer);
		$$renderer.push(`<!----> `);

		if (selected === "implementation") {
			$$renderer.push(`<!--[0--><section>`);
			defaultMenu($$renderer);
			$$renderer.push(`<!----> `);
			linkItem($$renderer);
			$$renderer.push(`<!----> `);
			defaultPrefixAndSuffix($$renderer);
			$$renderer.push(`<!----> `);
			alignment($$renderer);
			$$renderer.push(`<!----></section>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (selected === "accessibility") {
			$$renderer.push(`<!--[0--><section>`);
			howItWorks($$renderer);
			$$renderer.push(`<!----> `);
			considerations($$renderer);
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
		$.head('1uas024', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Menu</title>`);
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