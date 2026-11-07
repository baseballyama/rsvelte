import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Progress from "$lib/progress/progress.svelte";
import { progressDefault, progressDynamicColors, progressThemed } from "../../docs/data/progress.js";
import Button from "$lib/button/button.svelte";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function progress($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">progress</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display progress relative to a limit or related to a task.</p>`);
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

function defaultProgess($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Progress($$renderer, { value: 80 });
			}

			LinkH2($$renderer, {
				href: '/progress#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, progressDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function themed($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="w-full space-y-6">`);
				Progress($$renderer, { type: 'success', value: 100 });
				$$renderer.push(`<!----> `);
				Progress($$renderer, { type: 'error', value: 10 });
				$$renderer.push(`<!----> `);
				Progress($$renderer, { type: 'warning', value: 40 });
				$$renderer.push(`<!----> `);
				Progress($$renderer, { type: 'secondary', value: 70 });
				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/progress#themed',
				'aria-label': 'themed',
				children: ($$renderer) => {
					$$renderer.push(`<!---->themed`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, progressThemed);
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
				previous: { title: "pagination", href: "/pagination" },
				next: { title: "project banner", href: "/project-banner" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let dynamic = 40;

	function dynamicColors($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					Progress($$renderer, { value: dynamic });
					$$renderer.push(`<!----> <div class="flex items-center gap-4">`);

					Button($$renderer, {
						onclick: () => {
							if (dynamic < 100) {
								dynamic = dynamic + 10;
							}
						},
						size: 'small',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Increase`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					Button($$renderer, {
						onclick: () => {
							if (dynamic > 0) {
								dynamic = dynamic - 10;
							}
						},
						size: 'small',
						variant: 'secondary',
						children: ($$renderer) => {
							$$renderer.push(`<!---->Decrease`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				}

				LinkH2($$renderer, {
					href: '/progress#dynamic-colors',
					'aria-label': 'dynamic-colors',
					children: ($$renderer) => {
						$$renderer.push(`<!---->dynamic colors`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, progressDynamicColors);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		progress($$renderer);
		$$renderer.push(`<!----> `);
		defaultProgess($$renderer);
		$$renderer.push(`<!----> `);
		dynamicColors($$renderer);
		$$renderer.push(`<!----> `);
		themed($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	$.head('tllgyw', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Progess</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}