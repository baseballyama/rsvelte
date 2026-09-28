import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Aside from "$lib/../docs/ui/aside.svelte";
import Row from "$lib/../docs/ui/row.svelte";
import Shell from "$lib/../docs/ui/shell.svelte";
import { asideData } from "$lib/../docs/utils/data.js";
import CollapseCode from "$lib/collapse/collapseCode.svelte";
import Pagination from "$lib/pagination/pagination.svelte";
import { Calendar } from "$lib/index.js";
import { calendarDefault } from "$lib/../docs/data/calendar.js";
import LinkH2 from "$lib/../docs/ui/linkH2.svelte";

const calendar = ($$anchor) => {
	Row($$anchor, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
};

const demoAndCode = ($$anchor, demo = $.noop, code = $.noop) => {
	var div = root_1();
	var div_1 = $.child(div);
	var div_2 = $.child(div_1);
	var node = $.child(div_2);

	$.snippet(node, demo);
	$.reset(div_2);
	$.reset(div_1);

	var div_3 = $.sibling(div_1, 2);
	var node_1 = $.child(div_3);

	CollapseCode(node_1, {
		get code() {
			return code();
		}
	});

	$.reset(div_3);
	$.reset(div);
	$.append($$anchor, div);
};

const prevAndNext = ($$anchor) => {
	Row($$anchor, {
		bottomLine: false,
		children: ($$anchor, $$slotProps) => {
			Pagination($$anchor, {
				previous: { title: "button", href: "/button" },
				next: { title: "checkbox", href: "/checkbox" }
			});
		},
		$$slots: { default: true }
	});
};

const aside = ($$anchor) => {
	Aside($$anchor, {
		get asideDataList() {
			return asideData;
		}
	});
};

var root = $.from_html(`<h1 class="text-kui-light-gray-1000 dark:text-kui-dark-gray-1000 mb-3 text-[24px] leading-[32px] font-semibold tracking-[-0.96px] first-letter:capitalize lg:text-[40px] lg:leading-[48px] lg:tracking-[-2.4px]">calendar</h1> <p class="text-kui-light-gray-900 dark:text-kui-dark-gray-900 text-[16px] leading-6 font-normal tracking-normal first-letter:capitalize lg:text-[20px] lg:leading-[30px] lg:tracking-[-0.33px]">Displays a calendar from which users can select a date or range of dates.</p>`, 1);
var root_1 = $.from_html(`<div class="bg-kui-light-bg dark:bg-kui-dark-bg border-kui-light-gray-200 dark:border-kui-dark-gray-400 rounded-xl border"><div class="w-full p-4 lg:p-6"><div class="flex w-full flex-wrap justify-between gap-4"><!></div></div> <div class="overflow-hidden rounded-b-xl"><!></div></div>`);
var root_2 = $.from_html(`<div class="flex w-full justify-center"><!></div>`);
var root_3 = $.from_html(`<!> <div class="mt-4 xl:mt-7"><!></div>`, 1);
var root_4 = $.from_html(`<!> <!> <!>`, 1);

export default function _page($$anchor) {
	const defaultCalendar = ($$anchor) => {
		Row($$anchor, {
			children: ($$anchor, $$slotProps) => {
				var fragment_3 = root_3();
				var node_2 = $.first_child(fragment_3);

				LinkH2(node_2, {
					href: '/calender#default',
					'aria-label': 'default',
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('default');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var div_4 = $.sibling(node_2, 2);

				{
					const demo = ($$anchor) => {
						var div_5 = root_2();
						var node_3 = $.child(div_5);

						Calendar(node_3, {
							get value() {
								return $.get(value);
							},

							set value($$value) {
								$.set(value, $$value, true);
							}
						});

						$.reset(div_5);
						$.append($$anchor, div_5);
					};

					var node_4 = $.child(div_4);

					demoAndCode(node_4, () => demo, () => calendarDefault);
					$.reset(div_4);
				}

				$.append($$anchor, fragment_3);
			},
			$$slots: { default: true }
		});
	};

	const cont = ($$anchor) => {
		var fragment_6 = root_4();
		var node_5 = $.first_child(fragment_6);

		calendar(node_5);

		var node_6 = $.sibling(node_5, 2);

		defaultCalendar(node_6);

		var node_7 = $.sibling(node_6, 2);

		prevAndNext(node_7);
		$.append($$anchor, fragment_6);
	};

	let value = $.state(void 0);

	$.head('13luymz', ($$anchor) => {
		$.effect(() => {
			$.document.title = 'Calendar';
		});
	});

	Shell($$anchor, {
		get asideSlot() {
			return aside;
		},

		get contSlot() {
			return cont;
		}
	});
}