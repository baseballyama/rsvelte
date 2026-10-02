import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Toggle } from "$lib/index.js";

import {
	toggleCustomColors,
	toggleDefault,
	toggleSizes,
	toggleWithLabel
} from "../../docs/data/toggle.js";

import { LockClosedSmall, LockOpenSmall } from "$lib/icons/index.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function toggle($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Toggle</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Displays a boolean value.</p>`);
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

function sizes($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex w-full"><div class="w-4/12">`);
				Toggle($$renderer, { 'aria-label': 'Enable Firewall', checked: false });
				$$renderer.push(`<!----></div> <div class="w-4/12">`);

				Toggle($$renderer, {
					'aria-label': 'Enable Firewall',
					checked: false,
					size: 'large'
				});

				$$renderer.push(`<!----></div></div>`);
			}

			LinkH2($$renderer, {
				href: '/toggle#sizes',
				'aria-label': 'sizes',
				children: ($$renderer) => {
					$$renderer.push(`<!---->sizes`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, toggleSizes);
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
				previous: { title: "theme switcher", href: "/theme-switcher" },
				next: { title: "tooltip", href: "/tooltip" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let checked = false;
	let checked2 = true;
	let checkedCustom = false;
	let label = false;

	function defaultToggle($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div class="space-y-4"><div class="w-full">`);
					Toggle($$renderer, { 'aria-label': 'Enable Firewall', checked });
					$$renderer.push(`<!----></div> <div class="w-full">`);
					Toggle($$renderer, { 'aria-label': 'Enable Firewall', checked: checked2 });
					$$renderer.push(`<!----></div></div>`);
				}

				LinkH2($$renderer, {
					href: '/toggle#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, toggleDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function customColors($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div class="w-full space-y-4"><div class="w-full">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						color: 'purple',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return checkedCustom;
						},

						set checked($$value) {
							checkedCustom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="w-full">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						color: 'amber',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return checkedCustom;
						},

						set checked($$value) {
							checkedCustom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="w-full">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						color: 'red',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return checkedCustom;
						},

						set checked($$value) {
							checkedCustom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="w-full">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						color: 'pink',
						size: 'large',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return checkedCustom;
						},

						set checked($$value) {
							checkedCustom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="w-full">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						color: 'green',
						size: 'large',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return checkedCustom;
						},

						set checked($$value) {
							checkedCustom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div> <div class="w-full">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						color: 'teal',
						size: 'large',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return checkedCustom;
						},

						set checked($$value) {
							checkedCustom = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div></div>`);
				}

				LinkH2($$renderer, {
					href: '/toggle#custom-color',
					'aria-label': 'custom color',
					children: ($$renderer) => {
						$$renderer.push(`<!---->custom color`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, toggleCustomColors);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function withLabel($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div class="w-full space-y-6"><div class="flex w-full items-center gap-4">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						direction: 'switch-first',
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex w-full items-center gap-4">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						size: 'large',
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						size: 'large',
						direction: 'switch-first',
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex w-full items-center gap-4">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						direction: 'switch-first',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div> <div class="flex w-full items-center gap-4">`);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						size: 'large',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Toggle($$renderer, {
						'aria-label': 'Enable Firewall',
						size: 'large',
						direction: 'switch-first',
						icon: { checked: LockClosedSmall, unchecked: LockOpenSmall },
						get checked() {
							return label;
						},

						set checked($$value) {
							label = $$value;
							$$settled = false;
						},

						children: ($$renderer) => {
							$$renderer.push(`<!---->Enable Firewall`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div></div>`);
				}

				LinkH2($$renderer, {
					href: '/toggle#with-label',
					'aria-label': 'with label',
					children: ($$renderer) => {
						$$renderer.push(`<!---->with label`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, toggleWithLabel);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		toggle($$renderer);
		$$renderer.push(`<!----> `);
		defaultToggle($$renderer);
		$$renderer.push(`<!----> `);
		sizes($$renderer);
		$$renderer.push(`<!----> `);
		customColors($$renderer);
		$$renderer.push(`<!----> `);
		withLabel($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('mployh', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Toggle</title>`);
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