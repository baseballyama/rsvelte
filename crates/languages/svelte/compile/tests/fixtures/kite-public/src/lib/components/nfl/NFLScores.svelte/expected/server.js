import * as $ from 'svelte/internal/server';

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

export default function NFLScores($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = true;
		let data = null;
		let oddsData = null;
		let refreshing = false;
		let expanded = false;

		async function fetchScores() {
			try {
				const response = await fetch('/api/widgets/nfl/scores');

				if (response.ok) {
					const result = await response.json();

					data = result;
					console.log('NFL Scores loaded:', result.games?.length, 'games');
				} else {
					console.error('NFL Scores API error:', response.status);
				}
			} catch(error) {
				console.error('Failed to fetch NFL scores:', error);
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function fetchOdds() {
			try {
				const response = await fetch('/api/widgets/nfl/polymarket');

				if (response.ok) {
					const result = await response.json();

					oddsData = result;
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
			refreshing = true;
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
			if (!data?.games || data.games.length === 0) return s('nfl.noGames');

			const liveCount = data.games.filter(isLive).length;
			const finalCount = data.games.filter((g) => g.state === 'post').length;
			const upcomingCount = data.games.filter((g) => g.state === 'pre').length;

			if (liveCount > 0) {
				const liveText = liveCount === 1
					? s('nfl.gamesCount', { count: liveCount.toString() })
					: s('nfl.gamesCountPlural', { count: liveCount.toString() });

				const totalText = data.games.length === 1
					? s('nfl.gamesCount', { count: data.games.length.toString() })
					: s('nfl.gamesCountPlural', { count: data.games.length.toString() });

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
			return (data?.games || []).slice(0, 3);
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

		$$renderer.push(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"${$.attr('aria-expanded', expanded)}${$.attr('aria-label', expanded
			? s('nfl.collapse') || 'Collapse NFL scores'
			: s('nfl.expand') || 'Expand NFL scores')}>`);

		IconBallFootball($$renderer, { class: 'size-4 text-gray-600 dark:text-gray-400' });
		$$renderer.push(`<!----> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('nfl.title'))}</span> <span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(summaryText())}</span> `);

		if (expanded) {
			$$renderer.push('<!--[0-->');
			IconChevronUp($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		} else {
			$$renderer.push('<!--[-1-->');
			IconChevronDown($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (!loading) {
			$$renderer.push(`<!--[0--><button${$.attr('disabled', refreshing, true)} class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"${$.attr('aria-label', s('nfl.refresh'))}>`);
			IconRefresh($$renderer, { class: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!expanded && data?.games && data.games.length > 0) {
			$$renderer.push(`<!--[0--><div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="flex gap-3 overflow-x-auto"><!--[-->`);

			const each_array = $.ensure_array_like(collapsedGames());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let game = each_array[$$index];

				$$renderer.push(`<!---->`);

				{
					const live = isLive(game);
					const odds = getOddsForGame(game, oddsData);

					$$renderer.push(`<div class="flex min-w-[140px] flex-col gap-1 rounded border border-gray-200 bg-white p-2 text-xs dark:border-gray-600 dark:bg-gray-800"><div class="flex items-center justify-between gap-1"><div class="flex items-center gap-1">`);

					if (game.awayTeam.logo) {
						$$renderer.push(`<!--[0--><img${$.attr('src', game.awayTeam.logo)}${$.attr('alt', game.awayTeam.abbrev)} class="h-4 w-4 object-contain"/>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(game.awayTeam.abbrev)}</span></div> `);

					if (odds?.moneyline) {
						$$renderer.push('<!--[0-->');

						Tooltip($$renderer, {
							text: getOddsTooltip(odds),
							position: 'top',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-[10px] text-gray-600 dark:text-gray-400">${$.escape(formatOdds(odds.moneyline.away))}</span>`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push(`<!--[-1--><span class="text-gray-900 dark:text-gray-100">${$.escape(game.awayTeam.score ?? '-')}</span>`);
					}

					$$renderer.push(`<!--]--></div> <div class="flex items-center justify-between gap-1"><div class="flex items-center gap-1">`);

					if (game.homeTeam.logo) {
						$$renderer.push(`<!--[0--><img${$.attr('src', game.homeTeam.logo)}${$.attr('alt', game.homeTeam.abbrev)} class="h-4 w-4 object-contain"/>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(game.homeTeam.abbrev)}</span></div> `);

					if (odds?.moneyline) {
						$$renderer.push('<!--[0-->');

						Tooltip($$renderer, {
							text: getOddsTooltip(odds),
							position: 'top',
							children: ($$renderer) => {
								$$renderer.push(`<span class="text-[10px] text-gray-600 dark:text-gray-400">${$.escape(formatOdds(odds.moneyline.home))}</span>`);
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push(`<!--[-1--><span class="text-gray-900 dark:text-gray-100">${$.escape(game.homeTeam.score ?? '-')}</span>`);
					}

					$$renderer.push(`<!--]--></div> <div class="border-t border-gray-200 pt-1 text-center dark:border-gray-600"><span${$.attr_class(live
						? 'font-medium text-red-600 dark:text-red-400'
						: 'text-gray-600 dark:text-gray-400')}>${$.escape(getGameStatus(game))}</span></div></div>`);
				}

				$$renderer.push(`<!---->`);
			}

			$$renderer.push(`<!--]--></div> `);

			if (oddsData?.odds && oddsData.odds.length > 0) {
				$$renderer.push(`<!--[0--><div class="mt-2 text-center"><a href="https://polymarket.com/sports/nfl" target="_blank" rel="noopener noreferrer" class="text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300">${$.escape(s('nfl.oddsTooltip'))}</a></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (expanded) {
			$$renderer.push(`<!--[0--><div class="border-t border-gray-200 dark:border-gray-700">`);

			if (loading) {
				$$renderer.push(`<!--[0--><div class="flex items-center justify-center py-8">`);

				IconLoader2($$renderer, {
					class: 'h-6 w-6 animate-spin text-gray-600 dark:text-gray-400'
				});

				$$renderer.push(`<!----></div>`);
			} else if (data?.error) {
				$$renderer.push(`<!--[1--><div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>Unable to load scores. Please try again later.</p></div>`);
			} else if (!data?.games || data.games.length === 0) {
				$$renderer.push(`<!--[2--><div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>No games scheduled for today.</p></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="divide-y divide-gray-200 dark:divide-gray-700"><!--[-->`);

				const each_array_1 = $.ensure_array_like(data.games);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let game = each_array_1[$$index_1];

					$$renderer.push(`<!---->`);

					{
						const live = isLive(game);
						const odds = getOddsForGame(game, oddsData);

						$$renderer.push(`<div${$.attr_class(`px-4 py-3 ${live ? 'bg-red-50 dark:bg-red-900/10' : ''}`)}><div class="mb-2 flex items-center justify-between"><div class="flex items-center gap-2">`);

						if (game.awayTeam.logo) {
							$$renderer.push(`<!--[0--><img${$.attr('src', game.awayTeam.logo)}${$.attr('alt', `${$.stringify(game.awayTeam.abbrev)} logo`)} class="h-6 w-6 object-contain"/>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(game.awayTeam.abbrev)}</span> `);

						if (odds?.moneyline) {
							$$renderer.push(`<!--[0--><span class="ml-auto text-xs text-gray-600 dark:text-gray-400">${$.escape(formatOdds(odds.moneyline.away))}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (game.awayTeam.score !== undefined) {
							$$renderer.push(`<!--[0--><span class="text-lg font-bold text-gray-900 dark:text-gray-100">${$.escape(game.awayTeam.score)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="mb-2 flex items-center justify-between"><div class="flex items-center gap-2">`);

						if (game.homeTeam.logo) {
							$$renderer.push(`<!--[0--><img${$.attr('src', game.homeTeam.logo)}${$.attr('alt', `${$.stringify(game.homeTeam.abbrev)} logo`)} class="h-6 w-6 object-contain"/>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(game.homeTeam.abbrev)}</span> `);

						if (odds?.moneyline) {
							$$renderer.push(`<!--[0--><span class="ml-auto text-xs text-gray-600 dark:text-gray-400">${$.escape(formatOdds(odds.moneyline.home))}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> `);

						if (game.homeTeam.score !== undefined) {
							$$renderer.push(`<!--[0--><span class="text-lg font-bold text-gray-900 dark:text-gray-100">${$.escape(game.homeTeam.score)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div> <div class="flex items-center justify-between text-center"><span${$.attr_class(`text-xs ${live
							? 'font-medium text-red-600 dark:text-red-400'
							: 'text-gray-600 dark:text-gray-400'}`)}>${$.escape(getGameStatus(game))} `);

						if (live && game.clock) {
							$$renderer.push(`<!--[0--><span class="ml-1">${$.escape(game.clock)}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></span> <div class="flex flex-col items-end gap-0.5">`);

						if (odds?.overUnder && !live) {
							$$renderer.push(`<!--[0--><span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(s('nfl.overUnder', { line: odds.overUnder.line.toString() }))}: ${$.escape(formatOdds(odds.overUnder.over))} / ${$.escape(formatOdds(odds.overUnder.under))}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (odds?.moneyline?.volume) {
							$$renderer.push(`<!--[0--><span class="text-[10px] text-gray-500 dark:text-gray-500">${$.escape(s('nfl.volume'))}: ${$.escape(formatCurrency(odds.moneyline.volume))} `);

							if (odds.moneyline.liquidity) {
								$$renderer.push(`<!--[0-->• ${$.escape(s('nfl.liquidity'))}: ${$.escape(formatCurrency(odds.moneyline.liquidity))}`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--></span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--></div></div></div>`);
					}

					$$renderer.push(`<!---->`);
				}

				$$renderer.push(`<!--]--></div> `);

				if (oddsData?.odds && oddsData.odds.length > 0) {
					$$renderer.push(`<!--[0--><div class="border-t border-gray-200 px-4 py-2 text-center dark:border-gray-700"><a href="https://polymarket.com/sports/nfl" target="_blank" rel="noopener noreferrer" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300">${$.escape(s('nfl.oddsTooltip'))}</a></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}