import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Switch, Tooltip } from "$lib/index.js";

import {
	switchDefault,
	switchDisabled,
	switchFullWidth,
	switchIcon,
	switchSize,
	switchTooltip
} from "../../docs/data/switch.js";

import { GridSquare, ListUnordered } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Switch</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Choose between a set of options.</p>`);
		},
		$$slots: { default: true }
	});
}

function demoAndCode($$renderer, demo, code) {
	$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-wrap justify-between gap-4">`);
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
				previous: { title: "status dot", href: "/status-dot" },
				next: { title: "table", href: "/table" }
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

	function defaultSwitch($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'default',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, label: 'Source', value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { label: 'Output', value: 'output' });
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
					href: '/switch#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 mt-2 text-[16px] leading-6 font-normal first-letter:capitalize xl:mt-4">Ensure the width of each item is wide enough to prevent jumping when active.</p> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, switchDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function disabled($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');

									Switch.Control($$renderer, {
										defaultChecked: true,
										disabled: true,
										label: 'Source',
										value: 'source'
									});

									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { label: 'Output', disabled: true, value: 'output' });
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
					href: '/switch#disabled',
					'aria-label': 'disabled',
					children: ($$renderer) => {
						$$renderer.push(`<!---->disabled`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, switchDisabled);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function sizes($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'size-small',
							size: 'small',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, label: 'Source', value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { label: 'Output', value: 'output' });
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

					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'size-default',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, label: 'Source', value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { label: 'Output', value: 'output' });
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

					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'size-large',
							size: 'large',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, label: 'Source', value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { label: 'Output', value: 'output' });
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
					href: '/switch#sizes',
					'aria-label': 'sizes',
					children: ($$renderer) => {
						$$renderer.push(`<!---->sizes`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, switchSize);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function fullWidth($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'size-small',
							size: 'large',
							fullWidth: true,
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, label: 'Source', value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { label: 'Output', value: 'output' });
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
					href: '/switch#full-width',
					'aria-label': 'full-width',
					children: ($$renderer) => {
						$$renderer.push(`<!---->full width`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, switchFullWidth);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function tooltip($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								Tooltip($$renderer, {
									text: 'View Source',
									children: ($$renderer) => {
										if (Switch.Control) {
											$$renderer.push('<!--[-->');
											Switch.Control($$renderer, { defaultChecked: true, label: 'Source', value: 'source' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
									},
									$$slots: { default: true }
								});

								$$renderer.push(`<!----> `);

								Tooltip($$renderer, {
									text: 'View Output',
									children: ($$renderer) => {
										if (Switch.Control) {
											$$renderer.push('<!--[-->');
											Switch.Control($$renderer, { label: 'Output', value: 'output' });
											$$renderer.push('<!--]-->');
										} else {
											$$renderer.push('<!--[!-->');
											$$renderer.push('<!--]-->');
										}
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
				}

				LinkH2($$renderer, {
					href: '/switch#tooltip',
					'aria-label': 'tooltip',
					children: ($$renderer) => {
						$$renderer.push(`<!---->tooltip`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, switchTooltip);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function icon($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'size-small',
							size: 'small',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, icon: GridSquare, value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { icon: ListUnordered, value: 'output' });
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

					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'size-default',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, icon: GridSquare, value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { icon: ListUnordered, value: 'output' });
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

					if (Switch.Root) {
						$$renderer.push('<!--[-->');

						Switch.Root($$renderer, {
							name: 'size-large',
							size: 'large',
							get value() {
								return value;
							},

							set value($$value) {
								value = $$value;
								$$settled = false;
							},

							children: ($$renderer) => {
								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { defaultChecked: true, icon: GridSquare, value: 'source' });
									$$renderer.push('<!--]-->');
								} else {
									$$renderer.push('<!--[!-->');
									$$renderer.push('<!--]-->');
								}

								$$renderer.push(` `);

								if (Switch.Control) {
									$$renderer.push('<!--[-->');
									Switch.Control($$renderer, { icon: ListUnordered, value: 'output' });
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
					href: '/switch#icon',
					'aria-label': 'icon',
					children: ($$renderer) => {
						$$renderer.push(`<!---->icon`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, switchIcon);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		error($$renderer);
		$$renderer.push(`<!----> `);
		defaultSwitch($$renderer);
		$$renderer.push(`<!----> `);
		disabled($$renderer);
		$$renderer.push(`<!----> `);
		sizes($$renderer);
		$$renderer.push(`<!----> `);
		fullWidth($$renderer);
		$$renderer.push(`<!----> `);
		tooltip($$renderer);
		$$renderer.push(`<!----> `);
		icon($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('j2e911', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Switch</title>`);
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