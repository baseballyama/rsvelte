import * as $ from 'svelte/internal/server';

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

export default function NHLStandings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = true;
		let data = null;
		let refreshing = false;
		let expanded = false;

		async function fetchStandings() {
			try {
				const response = await fetch('/api/widgets/nhl/standings');

				if (response.ok) {
					const result = await response.json();

					data = result;
					console.log('NHL Standings loaded:', result.divisions?.length, 'divisions');
				} else {
					console.error('NHL Standings API error:', response.status);
				}
			} catch(error) {
				console.error('Failed to fetch NHL standings:', error);
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function handleRefresh() {
			refreshing = true;
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
			if (!data?.divisions || data.divisions.length === 0) return s('nhl.standings.loading');

			const totalTeams = data.divisions.reduce((acc, div) => acc + div.teams.length, 0);

			return `${data.divisions.length} ${s('nhl.standings.divisions')} • ${totalTeams} ${s('nhl.standings.teams')}`;
		});

		// Get top 3 teams across all divisions for preview
		const topTeams = $.derived(() => {
			if (!data?.divisions) return [];

			const allTeams = data.divisions.flatMap((div) => div.teams);

			return allTeams.sort((a, b) => b.points - a.points).slice(0, 3);
		});

		onMount(() => {
			fetchStandings();

			// Refresh every 5 minutes
			const interval = setInterval(fetchStandings, 300000);

			return () => clearInterval(interval);
		});

		$$renderer.push(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"${$.attr('aria-expanded', expanded)}${$.attr('aria-label', expanded
			? s('nhl.standings.collapse') || 'Collapse NHL standings'
			: s('nhl.standings.expand') || 'Expand NHL standings')}>`);

		IconMedal($$renderer, { class: 'size-4 text-gray-600 dark:text-gray-400' });
		$$renderer.push(`<!----> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('nhl.standings.title'))}</span> <span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(summaryText())}</span> `);

		if (expanded) {
			$$renderer.push('<!--[0-->');
			IconChevronUp($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		} else {
			$$renderer.push('<!--[-1-->');
			IconChevronDown($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (!loading) {
			$$renderer.push(`<!--[0--><button${$.attr('disabled', refreshing, true)} class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"${$.attr('aria-label', s('nhl.standings.refresh'))}>`);
			IconRefresh($$renderer, { class: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!expanded && topTeams().length > 0) {
			$$renderer.push(`<!--[0--><div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="space-y-1"><!--[-->`);

			const each_array = $.ensure_array_like(topTeams());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let team = each_array[index];

				$$renderer.push(`<div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><span class="text-gray-600 dark:text-gray-400">${$.escape(index + 1)}.</span> `);

				if (team.teamLogo) {
					$$renderer.push(`<!--[0--><img${$.attr('src', team.teamLogo)}${$.attr('alt', `${$.stringify(team.teamId)} logo`)} class="h-4 w-4 object-contain"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(team.teamId)}</span></div> <div class="flex items-center gap-3"><span class="text-gray-600 dark:text-gray-400">${$.escape(team.wins)}-${$.escape(team.losses)}-${$.escape(team.otLosses)}</span> <span class="min-w-[2rem] text-right font-bold text-gray-900 dark:text-gray-100">${$.escape(team.points)} ${$.escape(s('nhl.standings.points'))}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div></div>`);
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
				$$renderer.push(`<!--[1--><div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>${$.escape(s('nhl.standings.error'))}</p></div>`);
			} else if (!data?.divisions || data.divisions.length === 0) {
				$$renderer.push(`<!--[2--><div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>${$.escape(s('nhl.standings.noData'))}</p></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="overflow-x-auto"><!--[-->`);

				const each_array_1 = $.ensure_array_like(data.divisions);

				for (let $$index_2 = 0, $$length = each_array_1.length; $$index_2 < $$length; $$index_2++) {
					let division = each_array_1[$$index_2];

					$$renderer.push(`<div class="border-b border-gray-200 last:border-b-0 dark:border-gray-700"><div class="bg-gray-100 px-4 py-2 dark:bg-gray-700"><span class="text-xs font-semibold text-gray-900 dark:text-gray-100">${$.escape(division.name)}</span> <span class="ml-2 text-xs text-gray-600 dark:text-gray-400">(${$.escape(division.conference)})</span></div> <div class="overflow-x-auto"><table class="w-full text-xs"><thead class="border-b border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"><tr><th class="px-3 py-2 text-left font-medium">${$.escape(s('nhl.standings.header.rank'))}</th><th class="px-3 py-2 text-left font-medium">${$.escape(s('nhl.standings.header.team'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nhl.standings.header.gp'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nhl.standings.header.w'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nhl.standings.header.l'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nhl.standings.header.ot'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nhl.standings.header.pts'))}</th><th class="px-2 py-2 text-center font-medium hidden sm:table-cell">${$.escape(s('nhl.standings.header.diff'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nhl.standings.header.strk'))}</th></tr></thead><tbody class="bg-white dark:bg-gray-800"><!--[-->`);

					const each_array_2 = $.ensure_array_like(division.teams);

					for (let index = 0, $$length = each_array_2.length; index < $$length; index++) {
						let team = each_array_2[index];
						const StreakIcon = getStreakIcon(team.streakCode);

						$$renderer.push(`<tr class="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"><td class="px-3 py-2 text-gray-700 dark:text-gray-300">${$.escape(index + 1)}</td><td class="px-3 py-2"><div class="flex items-center gap-2">`);

						if (team.teamLogo) {
							$$renderer.push(`<!--[0--><img${$.attr('src', team.teamLogo)}${$.attr('alt', `${$.stringify(team.teamId)} logo`)} class="h-5 w-5 object-contain"/>`);
						} else {
							$$renderer.push('<!--[-1-->');
						}

						$$renderer.push(`<!--]--> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(team.teamId)}</span></div></td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300">${$.escape(team.gamesPlayed)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300">${$.escape(team.wins)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300">${$.escape(team.losses)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300">${$.escape(team.otLosses)}</td><td class="px-2 py-2 text-center font-bold text-gray-900 dark:text-gray-100">${$.escape(team.points)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell"><span${$.attr_class(team.goalDifferential > 0
							? 'text-green-600 dark:text-green-400'
							: team.goalDifferential < 0 ? 'text-red-600 dark:text-red-400' : '')}>${$.escape(team.goalDifferential > 0 ? '+' : '')}${$.escape(team.goalDifferential)}</span></td><td class="px-2 py-2 text-center"><div${$.attr_class(`flex items-center justify-center gap-1 ${$.stringify(getStreakColor(team.streakCode))}`)}>`);

						if (StreakIcon) {
							$$renderer.push('<!--[-->');
							StreakIcon($$renderer, { class: 'h-3 w-3' });
							$$renderer.push('<!--]-->');
						} else {
							$$renderer.push('<!--[!-->');
							$$renderer.push('<!--]-->');
						}

						$$renderer.push(` <span class="font-medium">${$.escape(team.streakCount)}</span></div></td></tr>`);
					}

					$$renderer.push(`<!--]--></tbody></table></div></div>`);
				}

				$$renderer.push(`<!--]--></div> <div class="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"><div class="flex flex-wrap gap-x-3 gap-y-1"><span><strong>${$.escape(s('nhl.standings.header.gp'))}:</strong> ${$.escape(s('nhl.standings.legend.gp'))}</span> <span><strong>${$.escape(s('nhl.standings.header.w'))}:</strong> ${$.escape(s('nhl.standings.legend.w'))}</span> <span><strong>${$.escape(s('nhl.standings.header.l'))}:</strong> ${$.escape(s('nhl.standings.legend.l'))}</span> <span><strong>${$.escape(s('nhl.standings.header.ot'))}:</strong> ${$.escape(s('nhl.standings.legend.ot'))}</span> <span><strong>${$.escape(s('nhl.standings.header.pts'))}:</strong> ${$.escape(s('nhl.standings.legend.pts'))}</span> <span class="hidden sm:inline"><strong>${$.escape(s('nhl.standings.header.diff'))}:</strong> ${$.escape(s('nhl.standings.legend.diff'))}</span> <span><strong>${$.escape(s('nhl.standings.header.strk'))}:</strong> ${$.escape(s('nhl.standings.legend.strk'))}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}