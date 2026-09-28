import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconChevronDown,
	IconChevronUp,
	IconFlag,
	IconLoader2,
	IconRefresh
} from '@tabler/icons-svelte';

import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<button class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><!></button>`);
var root_1 = $.from_html(`<span class="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white"> </span>`);
var root_2 = $.from_html(`<span><!></span>`);
var root_3 = $.from_html(`<div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><!> <span class="font-medium text-gray-900 dark:text-gray-100"> </span></div> <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span> </span> <!></div></div>`);
var root_4 = $.from_html(`<div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="space-y-1"></div></div>`);
var root_5 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_6 = $.from_html(`<div class="p-8 text-center text-red-600 dark:text-red-400"> </div>`);
var root_7 = $.from_html(`<span class="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white"> </span>`);
var root_8 = $.from_html(`<div class="mt-2 text-sm text-gray-600 dark:text-gray-400"><span class="font-medium"> </span> <span class="text-gray-500 dark:text-gray-500"> </span></div>`);
var root_9 = $.from_html(`<div class="mt-1 text-sm text-gray-600 dark:text-gray-400"><!></div>`);
var root_10 = $.from_html(`<div class="mt-1 text-sm text-gray-500 dark:text-gray-500"> </div>`);
var root_11 = $.from_html(`<div><div class="flex items-start justify-between"><div class="flex-1"><div class="flex items-center gap-2"><span class="text-xs font-semibold text-gray-500 dark:text-gray-400"> </span> <!></div> <div class="mt-1 font-semibold text-gray-900 dark:text-gray-100"> </div> <div class="mt-1 text-sm text-gray-600 dark:text-gray-400"> </div> <!></div> <div class="text-right"><div class="font-semibold text-gray-900 dark:text-gray-100"> </div> <!></div></div></div>`);
var root_12 = $.from_html(`<div class="p-4"><div class="space-y-2"></div></div>`);
var root_13 = $.from_html(`<div class="border-t border-gray-200 dark:border-gray-700"><!></div>`);
var root_14 = $.from_html(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"><!> <span class="text-sm font-medium text-gray-900 dark:text-gray-100"> </span> <span class="text-xs text-gray-600 dark:text-gray-400"> </span> <!></button> <!></div> <!> <!></div>`);

export default function F1Schedule($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(true);
	let data = $.state(null);
	let error = $.state(null);
	let expanded = $.state(false);
	let refreshing = $.state(false);

	async function fetchSchedule() {
		try {
			const response = await fetch('/api/widgets/f1/schedule');

			if (response.ok) {
				const result = await response.json();

				$.set(data, result.data, true);
				$.set(error, null);
			} else {
				$.set(error, 'Failed to load schedule');
			}
		} catch(err) {
			console.error('Failed to fetch F1 schedule:', err);
			$.set(error, 'Failed to load schedule');
		} finally {
			$.set(loading, false);
			$.set(refreshing, false);
		}
	}

	async function handleRefresh() {
		$.set(refreshing, true);
		await fetchSchedule();
	}

	function formatDate(dateStr) {
		const date = new Date(dateStr);

		return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
	}

	function getDaysUntil(dateStr, timeStr) {
		// timeStr already includes 'Z' from API (e.g., "04:00:00Z")
		// If no time provided, use default UTC time
		const timeWithZ = timeStr || '14:00:00Z';

		const raceDate = new Date(`${dateStr}T${timeWithZ}`);
		const now = new Date();
		const diff = raceDate.getTime() - now.getTime();

		return Math.ceil(diff / (1000 * 60 * 60 * 24));
	}

	const summaryText = $.derived(() => {
		if (!$.get(data)) return s('f1.schedule.loading');

		if ($.get(data).nextRace) {
			const daysUntil = getDaysUntil($.get(data).nextRace.date, $.get(data).nextRace.time);

			if (daysUntil === 0) return s('f1.schedule.today');
			if (daysUntil === 1) return s('f1.schedule.tomorrow');

			return s('f1.schedule.inDays', { days: daysUntil.toString() });
		}

		return s('f1.schedule.seasonComplete');
	});

	// Get upcoming races for preview (next 3)
	const upcomingRaces = $.derived(() => {
		if (!$.get(data)?.races) return [];

		return $.get(data).races.filter((r) => r.status === 'upcoming').slice(0, 3);
	});

	onMount(() => {
		fetchSchedule();

		// Refresh every 5 minutes
		const interval = setInterval(fetchSchedule, 300000);

		return () => clearInterval(interval);
	});

	var div = root_14();
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var node = $.child(button);

	IconFlag(node, { class: 'h-4 w-4 text-gray-600 dark:text-gray-400' });

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
				[() => s('f1.schedule.title')]
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
		var consequent_6 = ($$anchor) => {
			var div_2 = root_4();
			var div_3 = $.child(div_2);

			$.each(div_3, 21, () => $.get(upcomingRaces), $.index, ($$anchor, race) => {
				const daysUntil = $.derived(() => getDaysUntil($.get(race).date, $.get(race).time));
				const isNext = $.derived(() => $.get(race).round === $.get(data)?.nextRace?.round);
				var div_4 = root_3();
				var div_5 = $.child(div_4);
				var node_5 = $.child(div_5);

				{
					var consequent_2 = ($$anchor) => {
						var span_2 = root_1();
						var text_2 = $.only_child(span_2, true);

						$.template_effect(($0) => $.set_text(text_2, $0), [() => s('f1.nextRace')]);
						$.append($$anchor, span_2);
					};

					$.if(node_5, ($$render) => {
						if ($.get(isNext)) $$render(consequent_2);
					});
				}

				var span_3 = $.sibling(node_5, 2);
				var text_3 = $.only_child(span_3, true);

				$.reset(div_5);

				var div_6 = $.sibling(div_5, 2);
				var span_4 = $.child(div_6);
				var text_4 = $.only_child(span_4, true);
				var node_6 = $.sibling(span_4, 2);

				{
					var consequent_5 = ($$anchor) => {
						var span_5 = root_2();
						var node_7 = $.child(span_5);

						{
							var consequent_3 = ($$anchor) => {
								var text_5 = $.text();

								$.template_effect(($0) => $.set_text(text_5, $0), [() => s('f1.today')]);
								$.append($$anchor, text_5);
							};

							var consequent_4 = ($$anchor) => {
								var text_6 = $.text();

								$.template_effect(($0) => $.set_text(text_6, $0), [() => s('f1.tomorrow')]);
								$.append($$anchor, text_6);
							};

							var alternate_1 = ($$anchor) => {
								var text_7 = $.text();

								$.template_effect(($0) => $.set_text(text_7, `${$.get(daysUntil) ?? ''} ${$0 ?? ''}`), [() => s('f1.days')]);
								$.append($$anchor, text_7);
							};

							$.if(node_7, ($$render) => {
								if ($.get(daysUntil) === 0) $$render(consequent_3); else if ($.get(daysUntil) === 1) $$render(consequent_4, 1); else $$render(alternate_1, -1);
							});
						}

						$.reset(span_5);
						$.append($$anchor, span_5);
					};

					$.if(node_6, ($$render) => {
						if ($.get(daysUntil) > 0) $$render(consequent_5);
					});
				}

				$.reset(div_6);
				$.reset(div_4);

				$.template_effect(
					($0) => {
						$.set_text(text_3, $.get(race).name);
						$.set_text(text_4, $0);
					},
					[() => formatDate($.get(race).date)]
				);

				$.append($$anchor, div_4);
			});

			$.reset(div_3);
			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(expanded) && $.get(upcomingRaces).length > 0) $$render(consequent_6);
		});
	}

	var node_8 = $.sibling(node_4, 2);

	{
		var consequent_15 = ($$anchor) => {
			var div_7 = root_13();
			var node_9 = $.child(div_7);

			{
				var consequent_7 = ($$anchor) => {
					var div_8 = root_5();
					var node_10 = $.child(div_8);

					IconLoader2(node_10, {
						class: 'h-6 w-6 animate-spin text-gray-600 dark:text-gray-400'
					});

					$.reset(div_8);
					$.append($$anchor, div_8);
				};

				var consequent_8 = ($$anchor) => {
					var div_9 = root_6();
					var text_8 = $.only_child(div_9, true);

					$.template_effect(() => $.set_text(text_8, $.get(error)));
					$.append($$anchor, div_9);
				};

				var consequent_14 = ($$anchor) => {
					var div_10 = root_12();
					var div_11 = $.child(div_10);

					$.each(div_11, 21, () => $.get(data).races, $.index, ($$anchor, race) => {
						const isNext = $.derived(() => $.get(race).round === $.get(data).nextRace?.round);
						const isLast = $.derived(() => $.get(race).round === $.get(data).lastRace?.round);
						var div_12 = root_11();
						var div_13 = $.child(div_12);
						var div_14 = $.child(div_13);
						var div_15 = $.child(div_14);
						var span_6 = $.child(div_15);
						var text_9 = $.only_child(span_6);
						var node_11 = $.sibling(span_6, 2);

						{
							var consequent_9 = ($$anchor) => {
								var span_7 = root_7();
								var text_10 = $.only_child(span_7, true);

								$.template_effect(($0) => $.set_text(text_10, $0), [() => s('f1.nextRace')]);
								$.append($$anchor, span_7);
							};

							$.if(node_11, ($$render) => {
								if ($.get(isNext)) $$render(consequent_9);
							});
						}

						$.reset(div_15);

						var div_16 = $.sibling(div_15, 2);
						var text_11 = $.only_child(div_16, true);
						var div_17 = $.sibling(div_16, 2);
						var text_12 = $.only_child(div_17);
						var node_12 = $.sibling(div_17, 2);

						{
							var consequent_10 = ($$anchor) => {
								var div_18 = root_8();
								var span_8 = $.child(div_18);
								var text_13 = $.only_child(span_8);
								var text_14 = $.sibling(span_8);
								var span_9 = $.sibling(text_14);
								var text_15 = $.only_child(span_9);

								$.reset(div_18);

								$.template_effect(
									($0) => {
										$.set_text(text_13, `${$0 ?? ''}:`);
										$.set_text(text_14, ` ${$.get(race).winner.name ?? ''} `);
										$.set_text(text_15, `(${$.get(race).winner.constructor ?? ''})`);
									},
									[() => s('f1.winner')]
								);

								$.append($$anchor, div_18);
							};

							$.if(node_12, ($$render) => {
								if ($.get(race).winner) $$render(consequent_10);
							});
						}

						$.reset(div_14);

						var div_19 = $.sibling(div_14, 2);
						var div_20 = $.child(div_19);
						var text_16 = $.only_child(div_20, true);
						var node_13 = $.sibling(div_20, 2);

						{
							var consequent_13 = ($$anchor) => {
								const days = $.derived(() => getDaysUntil($.get(race).date, $.get(race).time));
								var div_21 = root_9();
								var node_14 = $.child(div_21);

								{
									var consequent_11 = ($$anchor) => {
										var text_17 = $.text();

										$.template_effect(($0) => $.set_text(text_17, $0), [() => s('f1.today')]);
										$.append($$anchor, text_17);
									};

									var consequent_12 = ($$anchor) => {
										var text_18 = $.text();

										$.template_effect(($0) => $.set_text(text_18, $0), [() => s('f1.tomorrow')]);
										$.append($$anchor, text_18);
									};

									var alternate_2 = ($$anchor) => {
										var text_19 = $.text();

										$.template_effect(($0) => $.set_text(text_19, `${$.get(days) ?? ''} ${$0 ?? ''}`), [() => s('f1.days')]);
										$.append($$anchor, text_19);
									};

									$.if(node_14, ($$render) => {
										if ($.get(days) <= 0) $$render(consequent_11); else if ($.get(days) === 1) $$render(consequent_12, 1); else $$render(alternate_2, -1);
									});
								}

								$.reset(div_21);
								$.append($$anchor, div_21);
							};

							var alternate_3 = ($$anchor) => {
								var div_22 = root_10();
								var text_20 = $.only_child(div_22, true);

								$.template_effect(($0) => $.set_text(text_20, $0), [() => s('f1.completed')]);
								$.append($$anchor, div_22);
							};

							$.if(node_13, ($$render) => {
								if ($.get(race).status === 'upcoming') $$render(consequent_13); else $$render(alternate_3, -1);
							});
						}

						$.reset(div_19);
						$.reset(div_13);
						$.reset(div_12);

						$.template_effect(
							($0, $1) => {
								$.set_class(div_12, 1, `rounded-lg border p-3 ${$.get(isNext)
									? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
									: 'border-gray-200 dark:border-gray-700'}`);

								$.set_text(text_9, `${$0 ?? ''} ${$.get(race).round ?? ''}`);
								$.set_text(text_11, $.get(race).name);
								$.set_text(text_12, `${$.get(race).circuit.location ?? ''}, ${$.get(race).circuit.country ?? ''}`);
								$.set_text(text_16, $1);
							},
							[() => s('f1.round'), () => formatDate($.get(race).date)]
						);

						$.append($$anchor, div_12);
					});

					$.reset(div_11);
					$.reset(div_10);
					$.append($$anchor, div_10);
				};

				$.if(node_9, ($$render) => {
					if ($.get(loading)) $$render(consequent_7); else if ($.get(error)) $$render(consequent_8, 1); else if ($.get(data)) $$render(consequent_14, 2);
				});
			}

			$.reset(div_7);
			$.append($$anchor, div_7);
		};

		$.if(node_8, ($$render) => {
			if ($.get(expanded)) $$render(consequent_15);
		});
	}

	$.reset(div);

	$.template_effect(
		($0) => {
			$.set_text(text, $0);
			$.set_text(text_1, $.get(summaryText));
		},
		[() => s('f1.schedule.title')]
	);

	$.delegated('click', button, () => $.set(expanded, !$.get(expanded)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);