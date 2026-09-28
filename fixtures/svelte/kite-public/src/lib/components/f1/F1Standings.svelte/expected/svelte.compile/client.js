import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconChevronDown,
	IconChevronUp,
	IconLoader2,
	IconRefresh,
	IconTrophy
} from '@tabler/icons-svelte';

import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<button class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><!></button>`);
var root_1 = $.from_html(`<div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><span class="text-gray-600 dark:text-gray-400"></span> <span class="font-medium text-gray-900 dark:text-gray-100"> </span> <span class="text-gray-500 dark:text-gray-500"> </span></div> <div class="flex items-center gap-3"><span class="text-gray-600 dark:text-gray-400"> </span> <span class="min-w-[2rem] text-right font-bold text-gray-900 dark:text-gray-100"> </span></div></div>`);
var root_2 = $.from_html(`<div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="space-y-1"></div></div>`);
var root_3 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_4 = $.from_html(`<div class="p-8 text-center text-red-600 dark:text-red-400"> </div>`);
var root_5 = $.from_html(`<tr class="border-b border-gray-100 last:border-0 dark:border-gray-700/50"><td class="py-2 pr-4"><span> </span></td><td class="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100"><div class="flex items-center gap-2"><span> </span> <span class="text-xs text-gray-500 dark:text-gray-400"> </span></div></td><td class="py-2 pr-4 text-gray-600 dark:text-gray-400"> </td><td class="py-2 pr-4 text-right font-semibold text-gray-900 dark:text-gray-100"> </td><td class="py-2 text-right text-gray-600 dark:text-gray-400"> </td></tr>`);
var root_6 = $.from_html(`<tr class="border-b border-gray-100 last:border-0 dark:border-gray-700/50"><td class="py-2 pr-4"><span> </span></td><td class="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100"> </td><td class="py-2 pr-4 text-right font-semibold text-gray-900 dark:text-gray-100"> </td><td class="py-2 text-right text-gray-600 dark:text-gray-400"> </td></tr>`);
var root_7 = $.from_html(`<div class="p-4"><h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100"> </h3> <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="border-b border-gray-200 dark:border-gray-700"><tr class="text-left text-xs text-gray-600 dark:text-gray-400"><th class="pb-2 pr-4"> </th><th class="pb-2 pr-4"> </th><th class="pb-2 pr-4"> </th><th class="pb-2 pr-4 text-right"> </th><th class="pb-2 text-right"> </th></tr></thead><tbody></tbody></table></div></div> <div class="border-t border-gray-200 p-4 dark:border-gray-700"><h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100"> </h3> <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="border-b border-gray-200 dark:border-gray-700"><tr class="text-left text-xs text-gray-600 dark:text-gray-400"><th class="pb-2 pr-4"> </th><th class="pb-2 pr-4"> </th><th class="pb-2 pr-4 text-right"> </th><th class="pb-2 text-right"> </th></tr></thead><tbody></tbody></table></div></div>`, 1);
var root_8 = $.from_html(`<div class="border-t border-gray-200 dark:border-gray-700"><!></div>`);
var root_9 = $.from_html(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"><!> <span class="text-sm font-medium text-gray-900 dark:text-gray-100"> </span> <span class="text-xs text-gray-600 dark:text-gray-400"> </span> <!></button> <!></div> <!> <!></div>`);

export default function F1Standings($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(true);
	let data = $.state(null);
	let error = $.state(null);
	let expanded = $.state(false);
	let refreshing = $.state(false);

	async function fetchStandings() {
		try {
			const response = await fetch('/api/widgets/f1/standings');

			if (response.ok) {
				const result = await response.json();

				$.set(data, result.data, true);
				$.set(error, null);
			} else {
				$.set(error, 'Failed to load standings');
			}
		} catch(err) {
			console.error('Failed to fetch F1 standings:', err);
			$.set(error, 'Failed to load standings');
		} finally {
			$.set(loading, false);
			$.set(refreshing, false);
		}
	}

	async function handleRefresh() {
		$.set(refreshing, true);
		await fetchStandings();
	}

	const summaryText = $.derived(() => {
		if (!$.get(data)) return s('f1.standings.loading');

		return `${$.get(data).drivers.length} ${s('f1.drivers')} • ${$.get(data).constructors.length} ${s('f1.constructors')}`;
	});

	// Get top 3 drivers for preview
	const topDrivers = $.derived(() => {
		if (!$.get(data)) return [];

		return $.get(data).drivers.slice(0, 3);
	});

	onMount(() => {
		fetchStandings();

		// Refresh every 5 minutes
		const interval = setInterval(fetchStandings, 300000);

		return () => clearInterval(interval);
	});

	var div = root_9();
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var node = $.child(button);

	IconTrophy(node, { class: 'h-4 w-4 text-gray-600 dark:text-gray-400' });

	var span = $.sibling(node, 2);
	var text = $.only_child(span, true);
	var span_1 = $.sibling(span, 2);
	var text_1 = $.only_child(span_1, true);
	var node_1 = $.sibling(span_1, 2);

	{
		var consequent = ($$anchor) => {
			IconChevronUp($$anchor, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		};

		var alternate = ($$anchor) => {
			IconChevronDown($$anchor, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		};

		$.if(node_1, ($$render) => {
			if ($.get(expanded)) $$render(consequent); else $$render(alternate, -1);
		});
	}

	$.reset(button);

	var node_2 = $.sibling(button, 2);

	{
		var consequent_1 = ($$anchor) => {
			var button_1 = root();
			var node_3 = $.child(button_1);

			{
				let $0 = $.derived(() => $.get(refreshing) ? 'animate-spin' : '');

				IconRefresh(node_3, {
					get class() {
						return `h-4 w-4 ${$.get($0) ?? ''}`;
					}
				});
			}

			$.reset(button_1);

			$.template_effect(
				($0) => {
					button_1.disabled = $.get(refreshing);
					$.set_attribute(button_1, 'aria-label', $0);
				},
				[() => s('f1.standings.title')]
			);

			$.delegated('click', button_1, handleRefresh);
			$.append($$anchor, button_1);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(loading)) $$render(consequent_1);
		});
	}

	$.reset(div_1);

	var node_4 = $.sibling(div_1, 2);

	{
		var consequent_2 = ($$anchor) => {
			var div_2 = root_2();
			var div_3 = $.child(div_2);

			$.each(div_3, 21, () => $.get(topDrivers), $.index, ($$anchor, driver, index) => {
				var div_4 = root_1();
				var div_5 = $.child(div_4);
				var span_2 = $.child(div_5);

				span_2.textContent = `${index + 1}.`;

				var span_3 = $.sibling(span_2, 2);
				var text_2 = $.only_child(span_3, true);
				var span_4 = $.sibling(span_3, 2);
				var text_3 = $.only_child(span_4, true);

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var span_5 = $.child(div_6);
				var text_4 = $.only_child(span_5);
				var span_6 = $.sibling(span_5, 2);
				var text_5 = $.only_child(span_6);

				$.reset(div_6);
				$.reset(div_4);

				$.template_effect(
					($0, $1) => {
						$.set_text(text_2, $.get(driver).driver.name);
						$.set_text(text_3, $.get(driver).driver.code);
						$.set_text(text_4, `${$.get(driver).wins ?? ''} ${$0 ?? ''}`);
						$.set_text(text_5, `${$.get(driver).points ?? ''} ${$1 ?? ''}`);
					},
					[() => s('f1.wins'), () => s('f1.points')]
				);

				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(expanded) && $.get(topDrivers).length > 0) $$render(consequent_2);
		});
	}

	var node_5 = $.sibling(node_4, 2);

	{
		var consequent_6 = ($$anchor) => {
			var div_7 = root_8();
			var node_6 = $.child(div_7);

			{
				var consequent_3 = ($$anchor) => {
					var div_8 = root_3();
					var node_7 = $.child(div_8);

					IconLoader2(node_7, {
						class: 'h-6 w-6 animate-spin text-gray-600 dark:text-gray-400'
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				var consequent_4 = ($$anchor) => {
					var div_9 = root_4();
					var text_6 = $.only_child(div_9, true);

					$.template_effect(() => $.set_text(text_6, $.get(error)));
					$.append($$anchor, div_9);
				};

				var consequent_5 = ($$anchor) => {
					var fragment_2 = root_7();
					var div_10 = $.first_child(fragment_2);
					var h3 = $.child(div_10);
					var text_7 = $.only_child(h3, true);
					var div_11 = $.sibling(h3, 2);
					var table = $.child(div_11);
					var thead = $.child(table);
					var tr = $.child(thead);
					var th = $.child(tr);
					var text_8 = $.only_child(th, true);
					var th_1 = $.sibling(th);
					var text_9 = $.only_child(th_1, true);
					var th_2 = $.sibling(th_1);
					var text_10 = $.only_child(th_2, true);
					var th_3 = $.sibling(th_2);
					var text_11 = $.only_child(th_3, true);
					var th_4 = $.sibling(th_3);
					var text_12 = $.only_child(th_4, true);

					$.reset(tr);
					$.reset(thead);

					var tbody = $.sibling(thead);

					$.each(tbody, 21, () => $.get(data).drivers, $.index, ($$anchor, driver) => {
						var tr_1 = root_5();
						var td = $.child(tr_1);
						var span_7 = $.child(td);
						var text_13 = $.only_child(span_7, true);

						$.reset(td);

						var td_1 = $.sibling(td);
						var div_12 = $.child(td_1);
						var span_8 = $.child(div_12);
						var text_14 = $.only_child(span_8, true);
						var span_9 = $.sibling(span_8, 2);
						var text_15 = $.only_child(span_9, true);

						$.reset(div_12);
						$.reset(td_1);

						var td_2 = $.sibling(td_1);
						var text_16 = $.only_child(td_2, true);
						var td_3 = $.sibling(td_2);
						var text_17 = $.only_child(td_3, true);
						var td_4 = $.sibling(td_3);
						var text_18 = $.only_child(td_4, true);

						$.reset(tr_1);

						$.template_effect(() => {
							$.set_class(span_7, 1, `inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${$.get(driver).position <= 3
								? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
								: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`);

							$.set_text(text_13, $.get(driver).position);
							$.set_text(text_14, $.get(driver).driver.name);
							$.set_text(text_15, $.get(driver).driver.code);
							$.set_text(text_16, $.get(driver).constructor.name);
							$.set_text(text_17, $.get(driver).points);
							$.set_text(text_18, $.get(driver).wins);
						});

						$.append($$anchor, tr_1);
					});

					$.reset(tbody);
					$.reset(table);
					$.reset(div_11);
					$.reset(div_10);

					var div_13 = $.sibling(div_10, 2);
					var h3_1 = $.child(div_13);
					var text_19 = $.only_child(h3_1, true);
					var div_14 = $.sibling(h3_1, 2);
					var table_1 = $.child(div_14);
					var thead_1 = $.child(table_1);
					var tr_2 = $.child(thead_1);
					var th_5 = $.child(tr_2);
					var text_20 = $.only_child(th_5, true);
					var th_6 = $.sibling(th_5);
					var text_21 = $.only_child(th_6, true);
					var th_7 = $.sibling(th_6);
					var text_22 = $.only_child(th_7, true);
					var th_8 = $.sibling(th_7);
					var text_23 = $.only_child(th_8, true);

					$.reset(tr_2);
					$.reset(thead_1);

					var tbody_1 = $.sibling(thead_1);

					$.each(tbody_1, 21, () => $.get(data).constructors, $.index, ($$anchor, constructor) => {
						var tr_3 = root_6();
						var td_5 = $.child(tr_3);
						var span_10 = $.child(td_5);
						var text_24 = $.only_child(span_10, true);

						$.reset(td_5);

						var td_6 = $.sibling(td_5);
						var text_25 = $.only_child(td_6, true);
						var td_7 = $.sibling(td_6);
						var text_26 = $.only_child(td_7, true);
						var td_8 = $.sibling(td_7);
						var text_27 = $.only_child(td_8, true);

						$.reset(tr_3);

						$.template_effect(() => {
							$.set_class(span_10, 1, `inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${$.get(constructor).position <= 3
								? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
								: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`);

							$.set_text(text_24, $.get(constructor).position);
							$.set_text(text_25, $.get(constructor).constructor.name);
							$.set_text(text_26, $.get(constructor).points);
							$.set_text(text_27, $.get(constructor).wins);
						});

						$.append($$anchor, tr_3);
					});

					$.reset(tbody_1);
					$.reset(table_1);
					$.reset(div_14);
					$.reset(div_13);

					$.template_effect(
						($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10) => {
							$.set_text(text_7, $0);
							$.set_text(text_8, $1);
							$.set_text(text_9, $2);
							$.set_text(text_10, $3);
							$.set_text(text_11, $4);
							$.set_text(text_12, $5);
							$.set_text(text_19, $6);
							$.set_text(text_20, $7);
							$.set_text(text_21, $8);
							$.set_text(text_22, $9);
							$.set_text(text_23, $10);
						},
						[
							() => s('f1.driverStandings'),
							() => s('f1.position'),
							() => s('f1.driver'),
							() => s('f1.team'),
							() => s('f1.points'),
							() => s('f1.wins'),
							() => s('f1.constructorStandings'),
							() => s('f1.position'),
							() => s('f1.team'),
							() => s('f1.points'),
							() => s('f1.wins')
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node_6, ($$render) => {
					if ($.get(loading)) $$render(consequent_3); else if ($.get(error)) $$render(consequent_4, 1); else if ($.get(data)) $$render(consequent_5, 2);
				});
			}

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		$.if(node_5, ($$render) => {
			if ($.get(expanded)) $$render(consequent_6);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, $.get(summaryText));
		},
		[() => s('f1.standings.title')]
	);

	$.delegated('click', button, () => $.set(expanded, !$.get(expanded)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);