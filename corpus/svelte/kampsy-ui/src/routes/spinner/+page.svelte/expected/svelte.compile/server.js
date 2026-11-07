import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import Spinner from "$lib/spinner/spinner.svelte";
import { spinnerCustom, spinnerDefault } from "../../docs/data/spinner.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function spinner($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">spinner</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Indicate an action running in the background. Unlike the loading dots, this should
			generally be used to indicate loading feedback in response to a user action, like for
			buttons, pagination, etc.</p>`);
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

function defaultSize($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				Spinner($$renderer, {});
			}

			LinkH2($$renderer, {
				href: '/spinner#default-size',
				'aria-label': 'default-size',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default size`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, spinnerDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function custom($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="flex items-center gap-8">`);
				Spinner($$renderer, { size: 12 });
				$$renderer.push(`<!----> `);
				Spinner($$renderer, { size: 32 });
				$$renderer.push(`<!----> `);
				Spinner($$renderer, { size: 40 });
				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/spinner#custom-size',
				'aria-label': 'custom-size',
				children: ($$renderer) => {
					$$renderer.push(`<!---->custom size`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, spinnerCustom);
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
				previous: { title: "show more", href: "/show-more" },
				next: { title: "snippet", href: "/snippet" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	spinner($$renderer);
	$$renderer.push(`<!----> `);
	defaultSize($$renderer);
	$$renderer.push(`<!----> `);
	custom($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('1uvfshi', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Spinner</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}