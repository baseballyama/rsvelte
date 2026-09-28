import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconChevronDown,
	IconChevronUp,
	IconLoader2,
	IconMedal,
	IconMinus,
	IconRefresh,
	IconTrendingDown,
	IconTrendingUp
} from '@tabler/icons-svelte';

import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

var root = $.from_html(`<button class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><!></button>`);
var root_1 = $.from_html(`<img class="h-4 w-4 object-contain"/>`);
var root_2 = $.from_html(`<div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><span class="text-gray-600 dark:text-gray-400"></span> <!> <span class="font-medium text-gray-900 dark:text-gray-100"> </span></div> <div class="flex items-center gap-3"><span class="text-gray-600 dark:text-gray-400"> </span> <span class="min-w-[2rem] text-right font-bold text-gray-900 dark:text-gray-100"> </span></div></div>`);
var root_3 = $.from_html(`<div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="space-y-1"></div></div>`);
var root_4 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_5 = $.from_html(`<div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p> </p></div>`);
var root_6 = $.from_html(`<img class="h-5 w-5 object-contain"/>`);
var root_7 = $.from_html(`<tr class="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"><td class="px-3 py-2 text-gray-700 dark:text-gray-300"></td><td class="px-3 py-2"><div class="flex items-center gap-2"><!> <span class="font-medium text-gray-900 dark:text-gray-100"> </span></div></td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300"> </td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300"> </td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300"> </td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300"> </td><td class="px-2 py-2 text-center font-bold text-gray-900 dark:text-gray-100"> </td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell"><span> </span></td><td class="px-2 py-2 text-center"><div><!> <span class="font-medium"> </span></div></td></tr>`);
var root_8 = $.from_html(`<div class="border-b border-gray-200 last:border-b-0 dark:border-gray-700"><div class="bg-gray-100 px-4 py-2 dark:bg-gray-700"><span class="text-xs font-semibold text-gray-900 dark:text-gray-100"> </span> <span class="ml-2 text-xs text-gray-600 dark:text-gray-400"> </span></div> <div class="overflow-x-auto"><table class="w-full text-xs"><thead class="border-b border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"><tr><th class="px-3 py-2 text-left font-medium"> </th><th class="px-3 py-2 text-left font-medium"> </th><th class="px-2 py-2 text-center font-medium"> </th><th class="px-2 py-2 text-center font-medium"> </th><th class="px-2 py-2 text-center font-medium"> </th><th class="px-2 py-2 text-center font-medium"> </th><th class="px-2 py-2 text-center font-medium"> </th><th class="px-2 py-2 text-center font-medium hidden sm:table-cell"> </th><th class="px-2 py-2 text-center font-medium"> </th></tr></thead><tbody class="bg-white dark:bg-gray-800"></tbody></table></div></div>`);
var root_9 = $.from_html(`<div class="overflow-x-auto"></div> <div class="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"><div class="flex flex-wrap gap-x-3 gap-y-1"><span><strong> </strong> </span> <span><strong> </strong> </span> <span><strong> </strong> </span> <span><strong> </strong> </span> <span><strong> </strong> </span> <span class="hidden sm:inline"><strong> </strong> </span> <span><strong> </strong> </span></div></div>`, 1);
var root_10 = $.from_html(`<div class="border-t border-gray-200 dark:border-gray-700"><!></div>`);
var root_11 = $.from_html(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"><!> <span class="text-sm font-medium text-gray-900 dark:text-gray-100"> </span> <span class="text-xs text-gray-600 dark:text-gray-400"> </span> <!></button> <!></div> <!> <!></div>`);

export default function NHLStandings($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(true);
	let data = $.state(null);
	let refreshing = $.state(false);
	let expanded = $.state(false);

	async function fetchStandings() {
		try {
			const response = await fetch('/api/widgets/nhl/standings');

			if (response.ok) {
				const result = await response.json();

				$.set(data, result, true);
				console.log('NHL Standings loaded:', result.divisions?.length, 'divisions');
			} else {
				console.error('NHL Standings API error:', response.status);
			}
		} catch(error) {
			console.error('Failed to fetch NHL standings:', error);
		} finally {
			$.set(loading, false);
			$.set(refreshing, false);
		}
	}

	async function handleRefresh() {
		$.set(refreshing, true);
		await fetchStandings();
	}

	function getStreakIcon(streakCode) {
		if (streakCode === 'W') return IconTrendingUp;
		if (streakCode === 'L') return IconTrendingDown;

		return IconMinus;
	}

	function getStreakColor(streakCode) {
		if (streakCode === 'W') return 'text-green-600 dark:text-green-400';
		if (streakCode === 'L') return 'text-red-600 dark:text-red-400';

		return 'text-gray-600 dark:text-gray-400';
	}

	// Get summary of top teams for collapsed view
	const summaryText = $.derived(() => {
		if (!$.get(data)?.divisions || $.get(data).divisions.length === 0) return s('nhl.standings.loading');

		const totalTeams = $.get(data).divisions.reduce((acc, div) => acc + div.teams.length, 0);

		return `${$.get(data).divisions.length} ${s('nhl.standings.divisions')} • ${totalTeams} ${s('nhl.standings.teams')}`;
	});

	// Get top 3 teams across all divisions for preview
	const topTeams = $.derived(() => {
		if (!$.get(data)?.divisions) return [];

		const allTeams = $.get(data).divisions.flatMap((div) => div.teams);

		return allTeams.sort((a, b) => b.points - a.points).slice(0, 3);
	});

	onMount(() => {
		fetchStandings();

		// Refresh every 5 minutes
		const interval = setInterval(fetchStandings, 300000);

		return () => clearInterval(interval);
	});

	var div_1 = root_11();
	var div_2 = $.child(div_1);
	var button = $.child(div_2);
	var node = $.child(button);

	IconMedal(node, { class: 'size-4 text-gray-600 dark:text-gray-400' });

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
				[() => s('nhl.standings.refresh')]
			);

			$.delegated('click', button_1, handleRefresh);
			$.append($$anchor, button_1);
		};

		$.if(node_2, ($$render) => {
			if (!$.get(loading)) $$render(consequent_1);
		});
	}

	$.reset(div_2);

	var node_4 = $.sibling(div_2, 2);

	{
		var consequent_3 = ($$anchor) => {
			var div_3 = root_3();
			var div_4 = $.child(div_3);

			$.each(div_4, 21, () => $.get(topTeams), $.index, ($$anchor, team, index) => {
				var div_5 = root_2();
				var div_6 = $.child(div_5);
				var span_2 = $.child(div_6);

				span_2.textContent = `${index + 1}.`;

				var node_5 = $.sibling(span_2, 2);

				{
					var consequent_2 = ($$anchor) => {
						var img = root_1();

						$.template_effect(() => {
							$.set_attribute(img, 'src', $.get(team).teamLogo);
							$.set_attribute(img, 'alt', `${$.get(team).teamId ?? ''} logo`);
						});

						$.append($$anchor, img);
					};

					$.if(node_5, ($$render) => {
						if ($.get(team).teamLogo) $$render(consequent_2);
					});
				}

				var span_3 = $.sibling(node_5, 2);
				var text_2 = $.only_child(span_3, true);

				$.reset(div_6);

				var div_7 = $.sibling(div_6, 2);
				var span_4 = $.child(div_7);
				var text_3 = $.only_child(span_4);
				var span_5 = $.sibling(span_4, 2);
				var text_4 = $.only_child(span_5);

				$.reset(div_7);
				$.reset(div_5);

				$.template_effect(
					($0) => {
						$.set_text(text_2, $.get(team).teamId);
						$.set_text(text_3, `${$.get(team).wins ?? ''}-${$.get(team).losses ?? ''}-${$.get(team).otLosses ?? ''}`);
						$.set_text(text_4, `${$.get(team).points ?? ''} ${$0 ?? ''}`);
					},
					[() => s('nhl.standings.points')]
				);

				$.append($$anchor, div_5);
			});

			$.reset(div_4);
			$.reset(div_3);
			$.append($$anchor, div_3);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(expanded) && $.get(topTeams).length > 0) $$render(consequent_3);
		});
	}

	var node_6 = $.sibling(node_4, 2);

	{
		var consequent_8 = ($$anchor) => {
			var div_8 = root_10();
			var node_7 = $.child(div_8);

			{
				var consequent_4 = ($$anchor) => {
					var div_9 = root_4();
					var node_8 = $.child(div_9);

					IconLoader2(node_8, {
						class: 'h-6 w-6 animate-spin text-gray-600 dark:text-gray-400'
					});

					$.reset(div_9);
					$.append($$anchor, div_9);
				};

				var consequent_5 = ($$anchor) => {
					var div_10 = root_5();
					var p = $.child(div_10);
					var text_5 = $.only_child(p, true);

					$.reset(div_10);
					$.template_effect(($0) => $.set_text(text_5, $0), [() => s('nhl.standings.error')]);
					$.append($$anchor, div_10);
				};

				var consequent_6 = ($$anchor) => {
					var div_11 = root_5();
					var p_1 = $.child(div_11);
					var text_6 = $.only_child(p_1, true);

					$.reset(div_11);
					$.template_effect(($0) => $.set_text(text_6, $0), [() => s('nhl.standings.noData')]);
					$.append($$anchor, div_11);
				};

				var alternate_1 = ($$anchor) => {
					var fragment_2 = root_9();
					var div_12 = $.first_child(fragment_2);

					$.each(div_12, 21, () => $.get(data).divisions, $.index, ($$anchor, division) => {
						var div_13 = root_8();
						var div_14 = $.child(div_13);
						var span_6 = $.child(div_14);
						var text_7 = $.only_child(span_6, true);
						var span_7 = $.sibling(span_6, 2);
						var text_8 = $.only_child(span_7);

						$.reset(div_14);

						var div_15 = $.sibling(div_14, 2);
						var table = $.child(div_15);
						var thead = $.child(table);
						var tr = $.child(thead);
						var th = $.child(tr);
						var text_9 = $.only_child(th, true);
						var th_1 = $.sibling(th);
						var text_10 = $.only_child(th_1, true);
						var th_2 = $.sibling(th_1);
						var text_11 = $.only_child(th_2, true);
						var th_3 = $.sibling(th_2);
						var text_12 = $.only_child(th_3, true);
						var th_4 = $.sibling(th_3);
						var text_13 = $.only_child(th_4, true);
						var th_5 = $.sibling(th_4);
						var text_14 = $.only_child(th_5, true);
						var th_6 = $.sibling(th_5);
						var text_15 = $.only_child(th_6, true);
						var th_7 = $.sibling(th_6);
						var text_16 = $.only_child(th_7, true);
						var th_8 = $.sibling(th_7);
						var text_17 = $.only_child(th_8, true);

						$.reset(tr);
						$.reset(thead);

						var tbody = $.sibling(thead);

						$.each(tbody, 21, () => $.get(division).teams, $.index, ($$anchor, team, index) => {
							const StreakIcon = $.derived(() => getStreakIcon($.get(team).streakCode));
							var tr_1 = root_7();
							var td = $.child(tr_1);

							td.textContent = index + 1;

							var td_1 = $.sibling(td);
							var div_16 = $.child(td_1);
							var node_9 = $.child(div_16);

							{
								var consequent_7 = ($$anchor) => {
									var img_1 = root_6();

									$.template_effect(() => {
										$.set_attribute(img_1, 'src', $.get(team).teamLogo);
										$.set_attribute(img_1, 'alt', `${$.get(team).teamId ?? ''} logo`);
									});

									$.append($$anchor, img_1);
								};

								$.if(node_9, ($$render) => {
									if ($.get(team).teamLogo) $$render(consequent_7);
								});
							}

							var span_8 = $.sibling(node_9, 2);
							var text_18 = $.only_child(span_8, true);

							$.reset(div_16);
							$.reset(td_1);

							var td_2 = $.sibling(td_1);
							var text_19 = $.only_child(td_2, true);
							var td_3 = $.sibling(td_2);
							var text_20 = $.only_child(td_3, true);
							var td_4 = $.sibling(td_3);
							var text_21 = $.only_child(td_4, true);
							var td_5 = $.sibling(td_4);
							var text_22 = $.only_child(td_5, true);
							var td_6 = $.sibling(td_5);
							var text_23 = $.only_child(td_6, true);
							var td_7 = $.sibling(td_6);
							var span_9 = $.child(td_7);
							var text_24 = $.only_child(span_9);

							$.reset(td_7);

							var td_8 = $.sibling(td_7);
							var div_17 = $.child(td_8);
							var node_10 = $.child(div_17);

							$.component(node_10, () => $.get(StreakIcon), ($$anchor, StreakIcon_1) => {
								StreakIcon_1($$anchor, { class: 'h-3 w-3' });
							});

							var span_10 = $.sibling(node_10, 2);
							var text_25 = $.only_child(span_10, true);

							$.reset(div_17);
							$.reset(td_8);
							$.reset(tr_1);

							$.template_effect(
								($0) => {
									$.set_text(text_18, $.get(team).teamId);
									$.set_text(text_19, $.get(team).gamesPlayed);
									$.set_text(text_20, $.get(team).wins);
									$.set_text(text_21, $.get(team).losses);
									$.set_text(text_22, $.get(team).otLosses);
									$.set_text(text_23, $.get(team).points);

									$.set_class(span_9, 1, $.get(team).goalDifferential > 0
										? 'text-green-600 dark:text-green-400'
										: $.get(team).goalDifferential < 0 ? 'text-red-600 dark:text-red-400' : '');

									$.set_text(text_24, `${$.get(team).goalDifferential > 0 ? '+' : ''}${$.get(team).goalDifferential ?? ''}`);
									$.set_class(div_17, 1, `flex items-center justify-center gap-1 ${$0 ?? ''}`);
									$.set_text(text_25, $.get(team).streakCount);
								},
								[() => getStreakColor($.get(team).streakCode)]
							);

							$.append($$anchor, tr_1);
						});

						$.reset(tbody);
						$.reset(table);
						$.reset(div_15);
						$.reset(div_13);

						$.template_effect(
							($0, $1, $2, $3, $4, $5, $6, $7, $8) => {
								$.set_text(text_7, $.get(division).name);
								$.set_text(text_8, `(${$.get(division).conference ?? ''})`);
								$.set_text(text_9, $0);
								$.set_text(text_10, $1);
								$.set_text(text_11, $2);
								$.set_text(text_12, $3);
								$.set_text(text_13, $4);
								$.set_text(text_14, $5);
								$.set_text(text_15, $6);
								$.set_text(text_16, $7);
								$.set_text(text_17, $8);
							},
							[
								() => s('nhl.standings.header.rank'),
								() => s('nhl.standings.header.team'),
								() => s('nhl.standings.header.gp'),
								() => s('nhl.standings.header.w'),
								() => s('nhl.standings.header.l'),
								() => s('nhl.standings.header.ot'),
								() => s('nhl.standings.header.pts'),
								() => s('nhl.standings.header.diff'),
								() => s('nhl.standings.header.strk')
							]
						);

						$.append($$anchor, div_13);
					});

					$.reset(div_12);

					var div_18 = $.sibling(div_12, 2);
					var div_19 = $.child(div_18);
					var span_11 = $.child(div_19);
					var strong = $.child(span_11);
					var text_26 = $.only_child(strong);
					var text_27 = $.sibling(strong);

					$.reset(span_11);

					var span_12 = $.sibling(span_11, 2);
					var strong_1 = $.child(span_12);
					var text_28 = $.only_child(strong_1);
					var text_29 = $.sibling(strong_1);

					$.reset(span_12);

					var span_13 = $.sibling(span_12, 2);
					var strong_2 = $.child(span_13);
					var text_30 = $.only_child(strong_2);
					var text_31 = $.sibling(strong_2);

					$.reset(span_13);

					var span_14 = $.sibling(span_13, 2);
					var strong_3 = $.child(span_14);
					var text_32 = $.only_child(strong_3);
					var text_33 = $.sibling(strong_3);

					$.reset(span_14);

					var span_15 = $.sibling(span_14, 2);
					var strong_4 = $.child(span_15);
					var text_34 = $.only_child(strong_4);
					var text_35 = $.sibling(strong_4);

					$.reset(span_15);

					var span_16 = $.sibling(span_15, 2);
					var strong_5 = $.child(span_16);
					var text_36 = $.only_child(strong_5);
					var text_37 = $.sibling(strong_5);

					$.reset(span_16);

					var span_17 = $.sibling(span_16, 2);
					var strong_6 = $.child(span_17);
					var text_38 = $.only_child(strong_6);
					var text_39 = $.sibling(strong_6);

					$.reset(span_17);
					$.reset(div_19);
					$.reset(div_18);

					$.template_effect(
						($0, $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) => {
							$.set_text(text_26, `${$0 ?? ''}:`);
							$.set_text(text_27, ` ${$1 ?? ''}`);
							$.set_text(text_28, `${$2 ?? ''}:`);
							$.set_text(text_29, ` ${$3 ?? ''}`);
							$.set_text(text_30, `${$4 ?? ''}:`);
							$.set_text(text_31, ` ${$5 ?? ''}`);
							$.set_text(text_32, `${$6 ?? ''}:`);
							$.set_text(text_33, ` ${$7 ?? ''}`);
							$.set_text(text_34, `${$8 ?? ''}:`);
							$.set_text(text_35, ` ${$9 ?? ''}`);
							$.set_text(text_36, `${$10 ?? ''}:`);
							$.set_text(text_37, ` ${$11 ?? ''}`);
							$.set_text(text_38, `${$12 ?? ''}:`);
							$.set_text(text_39, ` ${$13 ?? ''}`);
						},
						[
							() => s('nhl.standings.header.gp'),
							() => s('nhl.standings.legend.gp'),
							() => s('nhl.standings.header.w'),
							() => s('nhl.standings.legend.w'),
							() => s('nhl.standings.header.l'),
							() => s('nhl.standings.legend.l'),
							() => s('nhl.standings.header.ot'),
							() => s('nhl.standings.legend.ot'),
							() => s('nhl.standings.header.pts'),
							() => s('nhl.standings.legend.pts'),
							() => s('nhl.standings.header.diff'),
							() => s('nhl.standings.legend.diff'),
							() => s('nhl.standings.header.strk'),
							() => s('nhl.standings.legend.strk')
						]
					);

					$.append($$anchor, fragment_2);
				};

				$.if(node_7, ($$render) => {
					if ($.get(loading)) $$render(consequent_4); else if ($.get(data)?.error) $$render(consequent_5, 1); else if (!$.get(data)?.divisions || $.get(data).divisions.length === 0) $$render(consequent_6, 2); else $$render(alternate_1, -1);
				});
			}

			$.reset(div_8);
			$.append($$anchor, div_8);
		};

		$.if(node_6, ($$render) => {
			if ($.get(expanded)) $$render(consequent_8);
		});
	}

	$.reset(div_1);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(button, 'aria-expanded', $.get(expanded));
			$.set_attribute(button, 'aria-label', $0);
			$.set_text(text, $1);
			$.set_text(text_1, $.get(summaryText));
		},
		[
			() => $.get(expanded)
				? s('nhl.standings.collapse') || 'Collapse NHL standings'
				: s('nhl.standings.expand') || 'Expand NHL standings',
			() => s('nhl.standings.title')
		]
	);

	$.delegated('click', button, () => $.set(expanded, !$.get(expanded)));
	$.append($$anchor, div_1);
	$.pop();
}

$.delegate(['click']);