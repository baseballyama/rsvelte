import * as $ from 'svelte/internal/server';

import {
	IconChevronDown,
	IconChevronUp,
	IconLoader2,
	IconRefresh,
	IconTrophy
} from '@tabler/icons-svelte';

import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';
import Tooltip from '$lib/components/Tooltip.svelte';
import { language } from '$lib/stores/language.svelte.js';

export default function NHLScores($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = true;
		let data = null;
		let oddsData = null;
		let refreshing = false;
		let expanded = false;

		async function fetchScores() {
			try {
				const response = await fetch('/api/widgets/nhl/scores');

				if (response.ok) {
					const result = await response.json();

					data = result;
					console.log('NHL Scores loaded:', result.games?.length, 'games');
				} else {
					console.error('NHL Scores API error:', response.status);
				}
			} catch(error) {
				console.error('Failed to fetch NHL scores:', error);
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function fetchOdds() {
			try {
				const response = await fetch('/api/widgets/nhl/polymarket');

				if (response.ok) {
					const result = await response.json();

					oddsData = result;
					console.log('Polymarket odds loaded:', result.odds?.length, 'games');
				} else {
					console.error('Polymarket API error:', response.status);
				}
			} catch(error) {
				console.error('Failed to fetch Polymarket odds:', error);
			}
		}

		// Helper to match team by checking place name and common name in the Polymarket full name
		function matchesTeam(team, polymarketName) {
			if (!polymarketName) return false;

			const lowerPolyName = polymarketName.toLowerCase();

			// Check if place name (e.g., "Carolina") is in Polymarket name
			if (team.placeName && lowerPolyName.includes(team.placeName.toLowerCase())) {
				return true;
			}

			// Check if common name (e.g., "Hurricanes") is in Polymarket name
			if (team.commonName && lowerPolyName.includes(team.commonName.toLowerCase())) {
				return true;
			}

			// Fallback: check if the generic name is in Polymarket name
			if (team.name && lowerPolyName.includes(team.name.toLowerCase())) {
				return true;
			}

			return false;
		}

		// Helper to get odds for a specific game by matching team names
		// Takes oddsData as parameter to make it reactive
		function getOddsForGame(game, odds) {
			if (!odds?.odds) return undefined;

			const match = odds.odds.find((o) => {
				const homeMatch = matchesTeam(game.homeTeam, o.homeTeam);
				const awayMatch = matchesTeam(game.awayTeam, o.awayTeam);

				if (homeMatch && awayMatch) {
					console.log(`✓ Matched: ${game.awayTeam.name} @ ${game.homeTeam.name} with ${o.awayTeam} @ ${o.homeTeam}`);
				}

				return homeMatch && awayMatch;
			});

			if (!match) {
				console.log(`✗ No match for: ${game.awayTeam.name} @ ${game.homeTeam.name}`);
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
				parts.push(`${s('nhl.volume')}: ${formatCurrency(odds.moneyline.volume)}`);
			}

			if (odds.moneyline.liquidity) {
				parts.push(`${s('nhl.liquidity')}: ${formatCurrency(odds.moneyline.liquidity)}`);
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
				// Today - show time only
				return timeStr;
			} else if (diffDays === 1) {
				// Tomorrow
				return `${s('nhl.tomorrow')} ${timeStr}`;
			} else if (diffDays > 1 && diffDays <= 7) {
				// This week - show day name
				return date.toLocaleDateString(language.currentLocale, { weekday: 'short', hour: 'numeric', minute: '2-digit' });
			} else {
				// Further out - show full date
				return date.toLocaleDateString(language.currentLocale, {
					month: 'short',
					day: 'numeric',
					hour: 'numeric',
					minute: '2-digit'
				});
			}
		}

		function getGameStatus(game) {
			if (game.state === 'LIVE' || game.state === 'CRIT') {
				if (game.periodType === 'SO') return s('nhl.shootout');
				if (game.periodType === 'OT') return s('nhl.overtime');

				return s('nhl.period', { period: (game.period || '').toString() });
			}

			if (game.state === 'FUT' || game.state === 'PRE') {
				return formatGameTime(game.startTime);
			}

			if (game.state === 'FINAL') {
				if (game.periodType === 'SO') return s('nhl.finalShootout');
				if (game.periodType === 'OT') return s('nhl.finalOvertime');

				return s('nhl.final');
			}

			return game.state;
		}

		function isLive(game) {
			return game.state === 'LIVE' || game.state === 'CRIT';
		}

		// Get summary text for collapsed view
		const summaryText = $.derived(() => {
			if (!data?.games || data.games.length === 0) return s('nhl.noGames');

			const liveCount = data.games.filter(isLive).length;
			const finalCount = data.games.filter((g) => g.state === 'FINAL' || g.state === 'OFF').length;
			const upcomingCount = data.games.filter((g) => g.state === 'FUT' || g.state === 'PRE').length;

			if (liveCount > 0) {
				const liveText = s('nhl.gamesCount', { count: liveCount.toString() });
				const totalText = s('nhl.gamesCount', { count: data.games.length.toString() });

				return `${liveText} ${s('nhl.live')} • ${totalText} ${s('nhl.total')}`;
			} else if (upcomingCount > 0 && finalCount === 0) {
				return upcomingCount === 1
					? s('nhl.gamesCount', { count: upcomingCount.toString() })
					: s('nhl.gamesCountPlural', { count: upcomingCount.toString() });
			} else if (finalCount > 0 && upcomingCount === 0) {
				const completedText = finalCount === 1
					? s('nhl.gamesCount', { count: finalCount.toString() })
					: s('nhl.gamesCountPlural', { count: finalCount.toString() });

				return `${completedText} ${s('nhl.completed')}`;
			} else {
				const completedText = finalCount === 1
					? s('nhl.gamesCount', { count: finalCount.toString() })
					: s('nhl.gamesCountPlural', { count: finalCount.toString() });

				const upcomingText = upcomingCount === 1
					? s('nhl.gamesCount', { count: upcomingCount.toString() })
					: s('nhl.gamesCountPlural', { count: upcomingCount.toString() });

				return `${completedText} ${s('nhl.completed')} • ${upcomingText} ${s('nhl.upcoming')}`;
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
			? s('nhl.collapse') || 'Collapse NHL scores'
			: s('nhl.expand') || 'Expand NHL scores')}>`);

		IconTrophy($$renderer, { class: 'size-4 text-gray-600 dark:text-gray-400' });
		$$renderer.push(`<!----> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('nhl.title'))}</span> <span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(summaryText())}</span> `);

		if (expanded) {
			$$renderer.push('<!--[0-->');
			IconChevronUp($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		} else {
			$$renderer.push('<!--[-1-->');
			IconChevronDown($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (!loading) {
			$$renderer.push(`<!--[0--><button${$.attr('disabled', refreshing, true)} class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"${$.attr('aria-label', s('nhl.refresh'))}>`);
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
				$$renderer.push(`<!--[0--><div class="mt-2 text-center"><a href="https://polymarket.com/sports/nhl" target="_blank" rel="noopener noreferrer" class="text-[10px] text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300">${$.escape(s('nhl.oddsFrom'))}</a></div>`);
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
							$$renderer.push(`<!--[0--><span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(s('nhl.overUnder'))} ${$.escape(odds.overUnder.line)}: ${$.escape(formatOdds(odds.overUnder.over))} / ${$.escape(formatOdds(odds.overUnder.under))}</span>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> `);

						if (odds?.moneyline?.volume) {
							$$renderer.push(`<!--[0--><span class="text-[10px] text-gray-500 dark:text-gray-500">${$.escape(s('nhl.volume'))}: ${$.escape(formatCurrency(odds.moneyline.volume))} `);

							if (odds.moneyline.liquidity) {
								$$renderer.push(`<!--[0-->• ${$.escape(s('nhl.liquidity'))}: ${$.escape(formatCurrency(odds.moneyline.liquidity))}`);
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
					$$renderer.push(`<!--[0--><div class="border-t border-gray-200 px-4 py-2 text-center dark:border-gray-700"><a href="https://polymarket.com/sports/nhl" target="_blank" rel="noopener noreferrer" class="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-500 dark:hover:text-gray-300">${$.escape(s('nhl.oddsFrom'))}</a></div>`);
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