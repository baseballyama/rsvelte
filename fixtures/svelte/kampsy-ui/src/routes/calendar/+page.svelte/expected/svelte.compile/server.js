import * as $ from 'svelte/internal/server';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Calendar } from "$lib/index.js";
import { calendarDefault } from "$lib/../docs/data/calendar.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

function calendar($$renderer) {
	Row($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">calendar</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Displays a calendar from which users can select a date or range of dates.</p>`);
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
				previous: { title: "button", href: "/button" },
				next: { title: "checkbox", href: "/checkbox" }
			});
		},
		$$slots: { default: true }
	});
}

function aside($$renderer) {
	Aside($$renderer, { asideDataList: asideData });
}

export default function _page($$renderer) {
	let value = void 0;

	function defaultCalendar($$renderer) {
		Row($$renderer, {
			children: ($$renderer) => {
				function demo($$renderer) {
					$$renderer.push(`<div class="flex w-full justify-center">`);

					Calendar($$renderer, {
						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----></div>`);
				}

				LinkH2($$renderer, {
					href: '/calender#default',
					'aria-label': 'default',
					children: ($$renderer) => {
						$$renderer.push(`<!---->default`);
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> <div class="mt-4 xl:mt-7">`);
				demoAndCode($$renderer, demo, calendarDefault);
				$$renderer.push(`<!----></div>`);
			},
			$$slots: { default: true }
		});
	}

	function cont($$renderer) {
		calendar($$renderer);
		$$renderer.push(`<!----> `);
		defaultCalendar($$renderer);
		$$renderer.push(`<!----> `);
		prevAndNext($$renderer);
		$$renderer.push(`<!---->`);
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$.head('13luymz', $$renderer, ($$renderer) => {
			$$renderer.title(($$renderer) => {
				$$renderer.push(`<title>Calendar</title>`);
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