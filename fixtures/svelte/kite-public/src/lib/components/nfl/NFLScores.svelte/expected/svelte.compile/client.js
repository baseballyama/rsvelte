import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	IconBallFootball,
	IconChevronDown,
	IconChevronUp,
	IconLoader2,
	IconRefresh
} from '@tabler/icons-svelte';

import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { language } from '$lib/stores/language.svelte.js';

var root = $.from_html(`<button class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"><!></button>`);
var root_1 = $.from_html(`<img class="h-4 w-4 object-contain"/>`);
var root_2 = $.from_html(`<span class="text-[10px] text-gray-600 dark:text-gray-400"> </span>`);
var root_3 = $.from_html(`<span class="text-gray-900 dark:text-gray-100"> </span>`);
var root_4 = $.from_html(`<div class="flex min-w-[140px] flex-col gap-1 rounded border border-gray-200 bg-white p-2 text-xs dark:border-gray-600 dark:bg-gray-800"><div class="flex items-center justify-between gap-1"><div class="flex items-center gap-1"><!> <span class="font-medium text-gray-900 dark:text-gray-100"> </span></div> <!></div> <div class="flex items-center justify-between gap-1"><div class="flex items-center gap-1"><!> <span class="font-medium text-gray-900 dark:text-gray-100"> </span></div> <!></div> <div class="border-t border-gray-200 pt-1 text-center dark:border-gray-600"><span> </span></div></div>`);
var root_5 = $.from_html(`<div class="mt-2 text-center"><a href="https://polymarket.com/sports/nfl" target="_blank" rel="noopener noreferrer" class="text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"> </a></div>`);
var root_6 = $.from_html(`<div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="flex gap-3 overflow-x-auto"></div> <!></div>`);
var root_7 = $.from_html(`<div class="flex items-center justify-center py-8"><!></div>`);
var root_8 = $.from_html(`<div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>Unable to load scores. Please try again later.</p></div>`);
var root_9 = $.from_html(`<div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>No games scheduled for today.</p></div>`);
var root_10 = $.from_html(`<img class="h-6 w-6 object-contain"/>`);
var root_11 = $.from_html(`<span class="ml-auto text-xs text-gray-600 dark:text-gray-400"> </span>`);
var root_12 = $.from_html(`<span class="text-lg font-bold text-gray-900 dark:text-gray-100"> </span>`);
var root_13 = $.from_html(`<span class="ml-1"> </span>`);
var root_14 = $.from_html(`<span class="text-xs text-gray-600 dark:text-gray-400"> </span>`);
var root_15 = $.from_html(`<span class="text-[10px] text-gray-500 dark:text-gray-500"> <!></span>`);
var root_16 = $.from_html(`<div><div class="mb-2 flex items-center justify-between"><div class="flex items-center gap-2"><!> <span class="text-sm font-medium text-gray-900 dark:text-gray-100"> </span> <!></div> <!></div> <div class="mb-2 flex items-center justify-between"><div class="flex items-center gap-2"><!> <span class="text-sm font-medium text-gray-900 dark:text-gray-100"> </span> <!></div> <!></div> <div class="flex items-center justify-between text-center"><span> <!></span> <div class="flex flex-col items-end gap-0.5"><!> <!></div></div></div>`);
var root_17 = $.from_html(`<div class="border-t border-gray-200 px-4 py-2 text-center dark:border-gray-700"><a href="https://polymarket.com/sports/nfl" target="_blank" rel="noopener noreferrer" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300"> </a></div>`);
var root_18 = $.from_html(`<div class="divide-y divide-gray-200 dark:divide-gray-700"></div> <!>`, 1);
var root_19 = $.from_html(`<div class="border-t border-gray-200 dark:border-gray-700"><!></div>`);
var root_20 = $.from_html(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"><!> <span class="text-sm font-medium text-gray-900 dark:text-gray-100"> </span> <span class="text-xs text-gray-600 dark:text-gray-400"> </span> <!></button> <!></div> <!> <!></div>`);

export default function NFLScores($$anchor, $$props) {
	$.push($$props, true);

	let loading = $.state(true);
	let data = $.state(null);
	let oddsData = $.state(null);
	let refreshing = $.state(false);
	let expanded = $.state(false);

	async function fetchScores() {
		try {
			const response = await fetch('/api/widgets/nfl/scores');

			if (response.ok) {
				const result = await response.json();

				$.set(data, result, true);
				console.log('NFL Scores loaded:', result.games?.length, 'games');
			} else {
				console.error('NFL Scores API error:', response.status);
			}
		} catch(error) {
			console.error('Failed to fetch NFL scores:', error);
		} finally {
			$.set(loading, false);
			$.set(refreshing, false);
		}
	}

	async function fetchOdds() {
		try {
			const response = await fetch('/api/widgets/nfl/polymarket');

			if (response.ok) {
				const result = await response.json();

				$.set(oddsData, result, true);
				console.log('Polymarket NFL odds loaded:', result.odds?.length, 'games');
			} else {
				console.error('Polymarket NFL API error:', response.status);
			}
		} catch(error) {
			console.error('Failed to fetch NFL Polymarket odds:', error);
		}
	}

	// Helper to match team by name
	function matchesTeam(teamName, polymarketName) {
		const lowerTeamName = teamName.toLowerCase();
		const lowerPolyName = polymarketName.toLowerCase();

		// Check if the ESPN team name contains the Polymarket name
		// e.g., "Miami Dolphins" contains "Dolphins"
		if (lowerTeamName.includes(lowerPolyName)) {
			return true;
		}

		// Also check the reverse - if Polymarket name contains ESPN team name parts
		// This handles cases like "49ers" matching "San Francisco 49ers"
		const teamParts = lowerTeamName.split(' ');

		return teamParts.some((part) => {
			if (part.length < 3) return false; // Skip very short words

			return lowerPolyName.includes(part);
		});
	}

	// Helper to get odds for a specific game by matching team names
	function getOddsForGame(game, odds) {
		if (!odds?.odds) return undefined;

		const match = odds.odds.find((o) => {
			const homeMatch = matchesTeam(game.homeTeam.name, o.homeTeam);
			const awayMatch = matchesTeam(game.awayTeam.name, o.awayTeam);

			return homeMatch && awayMatch;
		});

		if (match) {
			console.log(`✓ Matched: ${game.awayTeam.name} @ ${game.homeTeam.name} ↔ ${match.awayTeam} @ ${match.homeTeam}`);
		}

		return match;
	}

	// Format odds as percentage
	function formatOdds(odds) {
		return `${Math.round(odds * 100)}%`;
	}

	// Format currency for tooltips
	function formatCurrency(amount) {
		if (amount >= 1000000) {
			return `$${(amount / 1000000).toFixed(1)}M`;
		} else if (amount >= 1000) {
			return `$${(amount / 1000).toFixed(0)}K`;
		}

		return `$${amount.toFixed(0)}`;
	}

	// Generate tooltip text for odds
	function getOddsTooltip(odds) {
		if (!odds.moneyline) return '';

		const parts = [];

		if (odds.moneyline.volume) {
			parts.push(`${s('nfl.volume')}: ${formatCurrency(odds.moneyline.volume)}`);
		}

		if (odds.moneyline.liquidity) {
			parts.push(`${s('nfl.liquidity')}: ${formatCurrency(odds.moneyline.liquidity)}`);
		}

		return parts.join(' • ');
	}

	async function handleRefresh() {
		$.set(refreshing, true);
		await Promise.all([fetchScores(), fetchOdds()]);
	}

	function formatGameTime(startTime) {
		const date = new Date(startTime);
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const gameDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
		const diffDays = Math.floor((gameDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
		const timeStr = date.toLocaleTimeString(language.currentLocale, { hour: 'numeric', minute: '2-digit' });

		if (diffDays === 0) {
			return timeStr;
		} else if (diffDays === 1) {
			return `${s('nfl.tomorrow')} ${timeStr}`;
		} else if (diffDays > 1 && diffDays <= 7) {
			return date.toLocaleDateString(language.currentLocale, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
		} else {
			return date.toLocaleDateString(language.currentLocale, {
				month: 'short',
				day: 'numeric',
				hour: 'numeric',
				minute: '2-digit'
			});
		}
	}

	function getGameStatus(game) {
		if (game.state === 'in') {
			const quarterText = game.quarter === 1
				? s('nfl.quarter1')
				: game.quarter === 2
					? s('nfl.quarter2')
					: game.quarter === 3
						? s('nfl.quarter3')
						: game.quarter === 4 ? s('nfl.quarter4') : s('nfl.overtime');

			return quarterText;
		}

		if (game.state === 'pre') {
			return formatGameTime(game.startTime);
		}

		if (game.state === 'post') {
			return s('nfl.final');
		}

		return game.state;
	}

	function isLive(game) {
		return game.state === 'in';
	}

	// Get summary text for collapsed view
	const summaryText = $.derived(() => {
		if (!$.get(data)?.games || $.get(data).games.length === 0) return s('nfl.noGames');

		const liveCount = $.get(data).games.filter(isLive).length;
		const finalCount = $.get(data).games.filter((g) => g.state === 'post').length;
		const upcomingCount = $.get(data).games.filter((g) => g.state === 'pre').length;

		if (liveCount > 0) {
			const liveText = liveCount === 1
				? s('nfl.gamesCount', { count: liveCount.toString() })
				: s('nfl.gamesCountPlural', { count: liveCount.toString() });

			const totalText = $.get(data).games.length === 1
				? s('nfl.gamesCount', { count: $.get(data).games.length.toString() })
				: s('nfl.gamesCountPlural', { count: $.get(data).games.length.toString() });

			return `${liveText} ${s('nfl.live')} • ${totalText} ${s('nfl.total')}`;
		} else if (upcomingCount > 0 && finalCount === 0) {
			return upcomingCount === 1
				? s('nfl.gamesCount', { count: upcomingCount.toString() })
				: s('nfl.gamesCountPlural', { count: upcomingCount.toString() });
		} else if (finalCount > 0 && upcomingCount === 0) {
			const completedText = finalCount === 1
				? s('nfl.gamesCount', { count: finalCount.toString() })
				: s('nfl.gamesCountPlural', { count: finalCount.toString() });

			return `${completedText} ${s('nfl.completed')}`;
		} else {
			const completedText = finalCount === 1
				? s('nfl.gamesCount', { count: finalCount.toString() })
				: s('nfl.gamesCountPlural', { count: finalCount.toString() });

			const upcomingText = upcomingCount === 1
				? s('nfl.gamesCount', { count: upcomingCount.toString() })
				: s('nfl.gamesCountPlural', { count: upcomingCount.toString() });

			return `${completedText} ${s('nfl.completed')} • ${upcomingText} ${s('nfl.upcoming')}`;
		}
	});

	// Show max 3 games in collapsed view
	const collapsedGames = $.derived(() => {
		return ($.get(data)?.games || []).slice(0, 3);
	});

	onMount(() => {
		fetchScores();
		fetchOdds();

		// Refresh scores every 30 seconds for live games, odds every 5 minutes
		const scoresInterval = setInterval(fetchScores, 30000);

		const oddsInterval = setInterval(fetchOdds, 300000);

		return () => {
			clearInterval(scoresInterval);
			clearInterval(oddsInterval);
		};
	});

	var div = root_20();
	var div_1 = $.child(div);
	var button = $.child(div_1);
	var node = $.child(button);

	IconBallFootball(node, { class: 'size-4 text-gray-600 dark:text-gray-400' });

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
				[() => s('nfl.refresh')]
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
		var consequent_7 = ($$anchor) => {
			var div_2 = root_6();
			var div_3 = $.child(div_2);

			$.each(div_3, 21, () => $.get(collapsedGames), (game) => game.id, ($$anchor, game) => {
				var fragment_2 = $.comment();
				var node_5 = $.first_child(fragment_2);

				$.key(node_5, () => `${$.get(game).id}-${$.get(oddsData)?.lastUpdated || 'no-odds'}`, ($$anchor) => {
					const live = $.derived(() => isLive($.get(game)));
					const odds = $.derived(() => getOddsForGame($.get(game), $.get(oddsData)));
					var div_4 = root_4();
					var div_5 = $.child(div_4);
					var div_6 = $.child(div_5);
					var node_6 = $.child(div_6);

					{
						var consequent_2 = ($$anchor) => {
							var img = root_1();

							$.template_effect(() => {
								$.set_attribute(img, 'src', $.get(game).awayTeam.logo);
								$.set_attribute(img, 'alt', $.get(game).awayTeam.abbrev);
							});

							$.append($$anchor, img);
						};

						$.if(node_6, ($$render) => {
							if ($.get(game).awayTeam.logo) $$render(consequent_2);
						});
					}

					var span_2 = $.sibling(node_6, 2);
					var text_2 = $.only_child(span_2, true);

					$.reset(div_6);

					var node_7 = $.sibling(div_6, 2);

					{
						var consequent_3 = ($$anchor) => {
							{
								let $0 = $.derived(() => getOddsTooltip($.get(odds)));

								Tooltip($$anchor, {
									get text() {
										return $.get($0);
									},
									position: 'top',
									children: ($$anchor, $$slotProps) => {
										var span_3 = root_2();
										var text_3 = $.only_child(span_3, true);

										$.template_effect(($0) => $.set_text(text_3, $0), [() => formatOdds($.get(odds).moneyline.away)]);
										$.append($$anchor, span_3);
									},
									$$slots: { default: true }
								});
							}
						};

						var alternate_1 = ($$anchor) => {
							var span_4 = root_3();
							var text_4 = $.only_child(span_4, true);

							$.template_effect(() => $.set_text(text_4, $.get(game).awayTeam.score ?? '-'));
							$.append($$anchor, span_4);
						};

						$.if(node_7, ($$render) => {
							if ($.get(odds)?.moneyline) $$render(consequent_3); else $$render(alternate_1, -1);
						});
					}

					$.reset(div_5);

					var div_7 = $.sibling(div_5, 2);
					var div_8 = $.child(div_7);
					var node_8 = $.child(div_8);

					{
						var consequent_4 = ($$anchor) => {
							var img_1 = root_1();

							$.template_effect(() => {
								$.set_attribute(img_1, 'src', $.get(game).homeTeam.logo);
								$.set_attribute(img_1, 'alt', $.get(game).homeTeam.abbrev);
							});

							$.append($$anchor, img_1);
						};

						$.if(node_8, ($$render) => {
							if ($.get(game).homeTeam.logo) $$render(consequent_4);
						});
					}

					var span_5 = $.sibling(node_8, 2);
					var text_5 = $.only_child(span_5, true);

					$.reset(div_8);

					var node_9 = $.sibling(div_8, 2);

					{
						var consequent_5 = ($$anchor) => {
							{
								let $0 = $.derived(() => getOddsTooltip($.get(odds)));

								Tooltip($$anchor, {
									get text() {
										return $.get($0);
									},
									position: 'top',
									children: ($$anchor, $$slotProps) => {
										var span_6 = root_2();
										var text_6 = $.only_child(span_6, true);

										$.template_effect(($0) => $.set_text(text_6, $0), [() => formatOdds($.get(odds).moneyline.home)]);
										$.append($$anchor, span_6);
									},
									$$slots: { default: true }
								});
							}
						};

						var alternate_2 = ($$anchor) => {
							var span_7 = root_3();
							var text_7 = $.only_child(span_7, true);

							$.template_effect(() => $.set_text(text_7, $.get(game).homeTeam.score ?? '-'));
							$.append($$anchor, span_7);
						};

						$.if(node_9, ($$render) => {
							if ($.get(odds)?.moneyline) $$render(consequent_5); else $$render(alternate_2, -1);
						});
					}

					$.reset(div_7);

					var div_9 = $.sibling(div_7, 2);
					var span_8 = $.child(div_9);
					var text_8 = $.only_child(span_8, true);

					$.reset(div_9);
					$.reset(div_4);

					$.template_effect(
						($0) => {
							$.set_text(text_2, $.get(game).awayTeam.abbrev);
							$.set_text(text_5, $.get(game).homeTeam.abbrev);

							$.set_class(span_8, 1, $.get(live)
								? 'font-medium text-red-600 dark:text-red-400'
								: 'text-gray-600 dark:text-gray-400');

							$.set_text(text_8, $0);
						},
						[() => getGameStatus($.get(game))]
					);

					$.append($$anchor, div_4);
				});

				$.append($$anchor, fragment_2);
			});

			$.reset(div_3);

			var node_10 = $.sibling(div_3, 2);

			{
				var consequent_6 = ($$anchor) => {
					var div_10 = root_5();
					var a = $.child(div_10);
					var text_9 = $.only_child(a, true);

					$.reset(div_10);
					$.template_effect(($0) => $.set_text(text_9, $0), [() => s('nfl.oddsTooltip')]);
					$.append($$anchor, div_10);
				};

				$.if(node_10, ($$render) => {
					if ($.get(oddsData)?.odds && $.get(oddsData).odds.length > 0) $$render(consequent_6);
				});
			}

			$.reset(div_2);
			$.append($$anchor, div_2);
		};

		$.if(node_4, ($$render) => {
			if (!$.get(expanded) && $.get(data)?.games && $.get(data).games.length > 0) $$render(consequent_7);
		});
	}

	var node_11 = $.sibling(node_4, 2);

	{
		var consequent_22 = ($$anchor) => {
			var div_11 = root_19();
			var node_12 = $.child(div_11);

			{
				var consequent_8 = ($$anchor) => {
					var div_12 = root_7();
					var node_13 = $.child(div_12);

					IconLoader2(node_13, {
						class: 'h-6 w-6 animate-spin text-gray-600 dark:text-gray-400'
					});

					$.reset(div_12);
					$.append($$anchor, div_12);
				};

				var consequent_9 = ($$anchor) => {
					var div_13 = root_8();

					$.append($$anchor, div_13);
				};

				var consequent_10 = ($$anchor) => {
					var div_14 = root_9();

					$.append($$anchor, div_14);
				};

				var alternate_3 = ($$anchor) => {
					var fragment_5 = root_18();
					var div_15 = $.first_child(fragment_5);

					$.each(div_15, 21, () => $.get(data).games, (game) => game.id, ($$anchor, game) => {
						var fragment_6 = $.comment();
						var node_14 = $.first_child(fragment_6);

						$.key(node_14, () => `${$.get(game).id}-${$.get(oddsData)?.lastUpdated || 'no-odds'}`, ($$anchor) => {
							const live = $.derived(() => isLive($.get(game)));
							const odds = $.derived(() => getOddsForGame($.get(game), $.get(oddsData)));
							var div_16 = root_16();
							var div_17 = $.child(div_16);
							var div_18 = $.child(div_17);
							var node_15 = $.child(div_18);

							{
								var consequent_11 = ($$anchor) => {
									var img_2 = root_10();

									$.template_effect(() => {
										$.set_attribute(img_2, 'src', $.get(game).awayTeam.logo);
										$.set_attribute(img_2, 'alt', `${$.get(game).awayTeam.abbrev ?? ''} logo`);
									});

									$.append($$anchor, img_2);
								};

								$.if(node_15, ($$render) => {
									if ($.get(game).awayTeam.logo) $$render(consequent_11);
								});
							}

							var span_9 = $.sibling(node_15, 2);
							var text_10 = $.only_child(span_9, true);
							var node_16 = $.sibling(span_9, 2);

							{
								var consequent_12 = ($$anchor) => {
									var span_10 = root_11();
									var text_11 = $.only_child(span_10, true);

									$.template_effect(($0) => $.set_text(text_11, $0), [() => formatOdds($.get(odds).moneyline.away)]);
									$.append($$anchor, span_10);
								};

								$.if(node_16, ($$render) => {
									if ($.get(odds)?.moneyline) $$render(consequent_12);
								});
							}

							$.reset(div_18);

							var node_17 = $.sibling(div_18, 2);

							{
								var consequent_13 = ($$anchor) => {
									var span_11 = root_12();
									var text_12 = $.only_child(span_11, true);

									$.template_effect(() => $.set_text(text_12, $.get(game).awayTeam.score));
									$.append($$anchor, span_11);
								};

								$.if(node_17, ($$render) => {
									if ($.get(game).awayTeam.score !== undefined) $$render(consequent_13);
								});
							}

							$.reset(div_17);

							var div_19 = $.sibling(div_17, 2);
							var div_20 = $.child(div_19);
							var node_18 = $.child(div_20);

							{
								var consequent_14 = ($$anchor) => {
									var img_3 = root_10();

									$.template_effect(() => {
										$.set_attribute(img_3, 'src', $.get(game).homeTeam.logo);
										$.set_attribute(img_3, 'alt', `${$.get(game).homeTeam.abbrev ?? ''} logo`);
									});

									$.append($$anchor, img_3);
								};

								$.if(node_18, ($$render) => {
									if ($.get(game).homeTeam.logo) $$render(consequent_14);
								});
							}

							var span_12 = $.sibling(node_18, 2);
							var text_13 = $.only_child(span_12, true);
							var node_19 = $.sibling(span_12, 2);

							{
								var consequent_15 = ($$anchor) => {
									var span_13 = root_11();
									var text_14 = $.only_child(span_13, true);

									$.template_effect(($0) => $.set_text(text_14, $0), [() => formatOdds($.get(odds).moneyline.home)]);
									$.append($$anchor, span_13);
								};

								$.if(node_19, ($$render) => {
									if ($.get(odds)?.moneyline) $$render(consequent_15);
								});
							}

							$.reset(div_20);

							var node_20 = $.sibling(div_20, 2);

							{
								var consequent_16 = ($$anchor) => {
									var span_14 = root_12();
									var text_15 = $.only_child(span_14, true);

									$.template_effect(() => $.set_text(text_15, $.get(game).homeTeam.score));
									$.append($$anchor, span_14);
								};

								$.if(node_20, ($$render) => {
									if ($.get(game).homeTeam.score !== undefined) $$render(consequent_16);
								});
							}

							$.reset(div_19);

							var div_21 = $.sibling(div_19, 2);
							var span_15 = $.child(div_21);
							var text_16 = $.child(span_15);
							var node_21 = $.sibling(text_16);

							{
								var consequent_17 = ($$anchor) => {
									var span_16 = root_13();
									var text_17 = $.only_child(span_16, true);

									$.template_effect(() => $.set_text(text_17, $.get(game).clock));
									$.append($$anchor, span_16);
								};

								$.if(node_21, ($$render) => {
									if ($.get(live) && $.get(game).clock) $$render(consequent_17);
								});
							}

							$.reset(span_15);

							var div_22 = $.sibling(span_15, 2);
							var node_22 = $.child(div_22);

							{
								var consequent_18 = ($$anchor) => {
									var span_17 = root_14();
									var text_18 = $.only_child(span_17);

									$.template_effect(($0, $1, $2) => $.set_text(text_18, `${$0 ?? ''}: ${$1 ?? ''} / ${$2 ?? ''}`), [
										() => s('nfl.overUnder', { line: $.get(odds).overUnder.line.toString() }),
										() => formatOdds($.get(odds).overUnder.over),
										() => formatOdds($.get(odds).overUnder.under)
									]);

									$.append($$anchor, span_17);
								};

								$.if(node_22, ($$render) => {
									if ($.get(odds)?.overUnder && !$.get(live)) $$render(consequent_18);
								});
							}

							var node_23 = $.sibling(node_22, 2);

							{
								var consequent_20 = ($$anchor) => {
									var span_18 = root_15();
									var text_19 = $.child(span_18);
									var node_24 = $.sibling(text_19);

									{
										var consequent_19 = ($$anchor) => {
											var text_20 = $.text();

											$.template_effect(($0, $1) => $.set_text(text_20, `• ${$0 ?? ''}: ${$1 ?? ''}`), [
												() => s('nfl.liquidity'),
												() => formatCurrency($.get(odds).moneyline.liquidity)
											]);

											$.append($$anchor, text_20);
										};

										$.if(node_24, ($$render) => {
											if ($.get(odds).moneyline.liquidity) $$render(consequent_19);
										});
									}

									$.reset(span_18);

									$.template_effect(($0, $1) => $.set_text(text_19, `${$0 ?? ''}: ${$1 ?? ''} `), [
										() => s('nfl.volume'),
										() => formatCurrency($.get(odds).moneyline.volume)
									]);

									$.append($$anchor, span_18);
								};

								$.if(node_23, ($$render) => {
									if ($.get(odds)?.moneyline?.volume) $$render(consequent_20);
								});
							}

							$.reset(div_22);
							$.reset(div_21);
							$.reset(div_16);

							$.template_effect(
								($0) => {
									$.set_class(div_16, 1, `px-4 py-3 ${$.get(live) ? 'bg-red-50 dark:bg-red-900/10' : ''}`);
									$.set_text(text_10, $.get(game).awayTeam.abbrev);
									$.set_text(text_13, $.get(game).homeTeam.abbrev);

									$.set_class(span_15, 1, `text-xs ${$.get(live)
										? 'font-medium text-red-600 dark:text-red-400'
										: 'text-gray-600 dark:text-gray-400'}`);

									$.set_text(text_16, `${$0 ?? ''} `);
								},
								[() => getGameStatus($.get(game))]
							);

							$.append($$anchor, div_16);
						});

						$.append($$anchor, fragment_6);
					});

					$.reset(div_15);

					var node_25 = $.sibling(div_15, 2);

					{
						var consequent_21 = ($$anchor) => {
							var div_23 = root_17();
							var a_1 = $.child(div_23);
							var text_21 = $.only_child(a_1, true);

							$.reset(div_23);
							$.template_effect(($0) => $.set_text(text_21, $0), [() => s('nfl.oddsTooltip')]);
							$.append($$anchor, div_23);
						};

						$.if(node_25, ($$render) => {
							if ($.get(oddsData)?.odds && $.get(oddsData).odds.length > 0) $$render(consequent_21);
						});
					}

					$.append($$anchor, fragment_5);
				};

				$.if(node_12, ($$render) => {
					if ($.get(loading)) $$render(consequent_8); else if ($.get(data)?.error) $$render(consequent_9, 1); else if (!$.get(data)?.games || $.get(data).games.length === 0) $$render(consequent_10, 2); else $$render(alternate_3, -1);
				});
			}

			$.reset(div_11);
			$.append($$anchor, div_11);
		};

		$.if(node_11, ($$render) => {
			if ($.get(expanded)) $$render(consequent_22);
		});
	}

	$.reset(div);

	$.template_effect(
		($0, $1) => {
			$.set_attribute(button, 'aria-expanded', $.get(expanded));
			$.set_attribute(button, 'aria-label', $0);
			$.set_text(text, $1);
			$.set_text(text_1, $.get(summaryText));
		},
		[
			() => $.get(expanded)
				? s('nfl.collapse') || 'Collapse NFL scores'
				: s('nfl.expand') || 'Expand NFL scores',
			() => s('nfl.title')
		]
	);

	$.delegated('click', button, () => $.set(expanded, !$.get(expanded)));
	$.append($$anchor, div);
	$.pop();
}

$.delegate(['click']);