import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import StatusDot from "$lib/statusDot/statusDot.svelte";
import { statusDotDefault, statusDotLabel } from "../../docs/data/status-dot.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function error($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">Status Dot</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Display an indicator of deployment status.</p>`);
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

function defaultErr($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="space-y-6">`);
				StatusDot($$renderer, { state: 'QUEUED' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { state: 'BUILDING' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { state: 'ERROR' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { state: 'READY' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { state: 'CANCELED' });
				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/status-dot#default',
				'aria-label': 'default',
				children: ($$renderer) => {
					$$renderer.push(`<!---->default`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, statusDotDefault);
			$$renderer.push(`<!----></div>`);
		},
		$$slots: { default: true }
	});
}

function customLabel($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			function demo($$renderer) {
				$$renderer.push(`<div class="space-y-6">`);
				StatusDot($$renderer, { label: true, state: 'QUEUED' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { label: true, state: 'BUILDING' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { label: true, state: 'ERROR' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { label: true, state: 'READY' });
				$$renderer.push(`<!----> `);
				StatusDot($$renderer, { label: true, state: 'CANCELED' });
				$$renderer.push(`<!----></div>`);
			}

			LinkH2($$renderer, {
				href: '/status-dot#label',
				'aria-label': 'label',
				children: ($$renderer) => {
					$$renderer.push(`<!---->label`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
			demoAndCode($$renderer, demo, statusDotLabel);
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
				previous: { title: "split button", href: "/split-button" },
				next: { title: "switch", href: "/switch" }
			});
		},
		$$slots: { default: true }
	});
}

function cont($$renderer) {
	error($$renderer);
	$$renderer.push(`<!----> `);
	defaultErr($$renderer);
	$$renderer.push(`<!----> `);
	customLabel($$renderer);
	$$renderer.push(`<!----> `);
	prevAndNext($$renderer);
	$$renderer.push(`<!---->`);
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	$.head('l8653d', $$renderer, ($$renderer) => {
		$$renderer.title(($$renderer) => {
			$$renderer.push(`<title>Status Dot</title>`);
		});
	});

	Shell($$renderer, { asideSlot: aside, contSlot: cont });
}