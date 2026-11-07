import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { paginationDefault } from "$lib/../docs/data/pagination.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function pagination($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">pagination</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Navigate to the previous or next page.</p>`);
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
				previous: { title: "note", href: "/note" },
				next: { title: "progress", href: "/progress" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	const prev = { title: "Home", href: "#" };
	const next = { title: "Introduction", href: "#" };

	function defaultComp($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					Pagination($$renderer, { previous: prev, next });
				}

				LinkH2($$renderer, {
					href: '/pagination#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, paginationDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		pagination($$renderer);
		$$renderer.push(`<!----> `);
		defaultComp($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	$.head('1sugu9l', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Pagination</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}