import * as $ from 'svelte/internal/server';
import { clickOutside, componentPosition } from "$lib/utils/event.js";
import { cubicOut } from "svelte/easing";
import Calendar from "$lib/icons/calendar.svelte";
import { ChevronLeft } from "$lib/icons/index.js";
import { ChevronRight } from "$lib/icons/index.js";
import { Button } from "$lib/index.js";

import {
	formatDateRange,
	generateCalendar,
	getFirstAndLastDay,
	getMonthDateRange,
	getZeroDate,
	isZeroDate,
	nextMonth,
	prevMonth,
	selectedValue
} from "$lib/utils/calendar.js";

import { fade, fly } from "svelte/transition";
import Weekday from "./weekday.svelte";

export default function Calendar_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { value = void 0 } = $$props;

		const days = [
			{ short: "Su", long: "Sunday" },
			{ short: "Mo", long: "Monday" },
			{ short: "Tu", long: "Tuesday" },
			{ short: "We", long: "Wednesday" },
			{ short: "Th", long: "Thursday" },
			{ short: "Fr", long: "Friday" },
			{ short: "Sa", long: "Saturday" }
		];

		let isActive = false;
		let isMobile = false;
		let desktopPosition = "top";
		let currentMonth = new Date();
		let calendarList = [];
		let monthAndYear = "";
		let strValue = "select date range";

		// Selection
		let startDate = getZeroDate();

		let endDate = getZeroDate();

		// Reset to trigger re-render on month change. Needed for transition to work
		const reset = () => {
			calendarList = [];
			monthAndYear = "";
		};

		// update when the user is resizing the window
		const toggle = (evt) => {
			desktopPosition = componentPosition(evt);
			isActive = !isActive;
		};

		function calendarSnip($$renderer) {
			$$renderer.push(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-b-kui-light-gray-200 dark:border-b-kui-dark-gray-200 border-t-kui-light-gray-600 dark:border-t-kui-dark-gray-500 lg:border-kui-light-gray-200 lg:dark:border-kui-dark-gray-200 overflow-y-auto scroll-smooth rounded-t-[10px] border-t border-b p-6 lg:rounded-md lg:border lg:p-3 lg:shadow-xs"><div class="grid grid-cols-7 items-center gap-y-1.25"><div><div class="flex w-full items-center justify-center"><button class="text-kui-light-gray-700 dark:text-kui-dark-gray-700 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000 flex h-10 w-10 items-center justify-center transition-colors lg:h-8.5 lg:w-8.5"><span class="h-4 w-4">`);
			ChevronLeft($$renderer, {});
			$$renderer.push(`<!----></span></button></div></div> <div class="col-span-5"><div class="text-center">`);

			if (monthAndYear) {
				$$renderer.push(`<!--[0--><h2 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 text-sm font-normal capitalize">${$.escape(monthAndYear)}</h2>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div></div> <div><div class="flex w-full items-center justify-center"><button class="text-kui-light-gray-700 dark:text-kui-dark-gray-700 hover:text-kui-light-gray-1000 dark:hover:text-kui-dark-gray-1000 flex h-10 w-10 items-center justify-center transition-colors lg:h-8.5 lg:w-8.5"><span class="h-4 w-4">`);
			ChevronRight($$renderer, {});
			$$renderer.push(`<!----></span></button></div></div></div> <div class="mt-3 grid grid-cols-7 gap-y-3 lg:gap-y-2"><!--[-->`);

			const each_array = $.ensure_array_like(days);

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let day = each_array[index];

				$$renderer.push(`<div class="relative flex items-center justify-center"><div class="relative z-[0.01] h-10 w-10 lg:h-8.5 lg:w-8.5"><div class="flex h-full w-full justify-center"><button class="relative flex h-full w-full items-center justify-center rounded-xs"><span class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-xs font-normal tracking-[0.06px]">${$.escape(day.short)}</span></button></div></div></div>`);
			}

			$$renderer.push(`<!--]--> <!--[-->`);

			const each_array_1 = $.ensure_array_like(calendarList);

			for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
				let row = each_array_1[index];

				$$renderer.push(`<div class="relative flex items-center justify-center">`);

				Weekday($$renderer, {
					dayAndDateObj: row,
					get startDate() {
						return startDate;
					},

					set startDate($$value) {
						startDate = $$value;
						$$settled = false;
					},

					get endDate() {
						return endDate;
					},

					set endDate($$value) {
						endDate = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----></div>`);
			}

			$$renderer.push(`<!--]--></div></div> <footer class="p-4 lg:hidden">`);

			Button($$renderer, {
				onclick: () => {
					isActive = false;
				},
				variant: 'secondary',
				class: 'w-full',
				children: ($$renderer) => {
					$$renderer.push(`<!---->done`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></footer>`);
		}

		function mobileSnip($$renderer) {
			if (isActive) {
				$$renderer.push(`<!--[0--><div class="bg-kui-light-bg-secondary dark:bg-kui-dark-bg-secondary fixed bottom-0 left-0 z-1001 w-full rounded-t-[10px] lg:bg-transparent">`);
				calendarSnip($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		function desktopSnip($$renderer) {
			if (isActive) {
				$$renderer.push(`<!--[0--><div${$.attr_class(`absolute ${desktopPosition == 'top' ? 'top-[112%]' : 'bottom-[112%]'} z-1001`)}>`);
				calendarSnip($$renderer);
				$$renderer.push(`<!----></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->`);
		}

		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			if (isActive) {
				$$renderer.push(`<!--[0--><div class="fixed top-0 left-0 z-1000 h-full w-full bg-black opacity-35 lg:hidden dark:opacity-45"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <div class="relative inline-block"><button class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 border-kui-light-gray-400 dark:border-kui-dark-gray-400 hover:bg-kui-light-gray-100 dark:hover:bg-kui-dark-gray-100 box-border flex h-10 w-62.5 items-center rounded-md border px-2.5 text-sm font-normal capitalize transition-colors"><span class="flex h-5 w-5 items-center justify-center"><span class="h-4 w-4">`);
			Calendar($$renderer, {});
			$$renderer.push(`<!----></span></span> <span class="px-1.5">${$.escape(strValue)}</span></button> `);

			if (isMobile) {
				$$renderer.push('<!--[0-->');
				mobileSnip($$renderer);
			} else {
				$$renderer.push('<!--[-1-->');
				desktopSnip($$renderer);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
		$.bind_props($$props, { value });
	});
}