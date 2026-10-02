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

export default function NFLStandings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = true;
		let data = null;
		let refreshing = false;
		let expanded = false;

		async function fetchStandings() {
			try {
				const response = await fetch('/api/widgets/nfl/standings');

				if (response.ok) {
					const result = await response.json();

					data = result;
					console.log('NFL Standings loaded:', result.conferences?.length, 'conferences');
				} else {
					console.error('NFL Standings API error:', response.status);
				}
			} catch(error) {
				console.error('Failed to fetch NFL standings:', error);
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function handleRefresh() {
			refreshing = true;
			await fetchStandings();
		}

		function getStreakIcon(streak) {
			if (streak.startsWith('W')) return IconTrendingUp;
			if (streak.startsWith('L')) return IconTrendingDown;

			return IconMinus;
		}

		function getStreakColor(streak) {
			if (streak.startsWith('W')) return 'text-green-600 dark:text-green-400';
			if (streak.startsWith('L')) return 'text-red-600 dark:text-red-400';

			return 'text-gray-600 dark:text-gray-400';
		}

		// Get summary of conferences and teams
		const summaryText = $.derived(() => {
			if (!data?.conferences || data.conferences.length === 0) return s('nfl.standings.loading');

			const totalDivisions = data.conferences.reduce((acc, conf) => acc + conf.divisions.length, 0);
			const totalTeams = data.conferences.reduce((acc, conf) => acc + conf.divisions.reduce((divAcc, div) => divAcc + div.teams.length, 0), 0);

			return `${data.conferences.length} ${s('nfl.standings.conferences')} • ${totalDivisions} ${s('nfl.standings.divisions')} • ${totalTeams} ${s('nfl.standings.teams')}`;
		});

		// Get top 3 teams across all divisions for preview
		const topTeams = $.derived(() => {
			if (!data?.conferences) return [];

			const allTeams = data.conferences.flatMap((conf) => conf.divisions.flatMap((div) => div.teams));

			return allTeams.sort((a, b) => b.winPercent - a.winPercent).slice(0, 3);
		});

		onMount(() => {
			fetchStandings();

			// Refresh every 5 minutes
			const interval = setInterval(fetchStandings, 300000);

			return () => clearInterval(interval);
		});

		$$renderer.push(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80"${$.attr('aria-expanded', expanded)}${$.attr('aria-label', expanded
			? s('nfl.standings.collapse') || 'Collapse NFL standings'
			: s('nfl.standings.expand') || 'Expand NFL standings')}>`);

		IconMedal($$renderer, { class: 'size-4 text-gray-600 dark:text-gray-400' });
		$$renderer.push(`<!----> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('nfl.standings.title'))}</span> <span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(summaryText())}</span> `);

		if (expanded) {
			$$renderer.push('<!--[0-->');
			IconChevronUp($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		} else {
			$$renderer.push('<!--[-1-->');
			IconChevronDown($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (!loading) {
			$$renderer.push(`<!--[0--><button${$.attr('disabled', refreshing, true)} class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"${$.attr('aria-label', s('nfl.standings.refresh'))}>`);
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

				if (team.logo) {
					$$renderer.push(`<!--[0--><img${$.attr('src', team.logo)}${$.attr('alt', `${$.stringify(team.abbrev)} logo`)} class="h-4 w-4 object-contain"/>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(team.abbrev)}</span></div> <div class="flex items-center gap-3"><span class="text-gray-600 dark:text-gray-400">${$.escape(team.wins)}-${$.escape(team.losses)}${$.escape(team.ties > 0 ? `-${team.ties}` : '')}</span> <span class="min-w-[2.5rem] text-right font-bold text-gray-900 dark:text-gray-100">${$.escape(team.winPercent.toFixed(3))}</span></div></div>`);
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
				$$renderer.push(`<!--[1--><div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>${$.escape(s('nfl.standings.noData'))}</p></div>`);
			} else if (!data?.conferences || data.conferences.length === 0) {
				$$renderer.push(`<!--[2--><div class="p-4 text-center text-sm text-gray-600 dark:text-gray-400"><p>${$.escape(s('nfl.standings.noData'))}</p></div>`);
			} else {
				$$renderer.push(`<!--[-1--><div class="overflow-x-auto"><!--[-->`);

				const each_array_1 = $.ensure_array_like(data.conferences);

				for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
					let conference = each_array_1[$$index_3];

					$$renderer.push(`<!--[-->`);

					const each_array_2 = $.ensure_array_like(conference.divisions);

					for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
						let division = each_array_2[$$index_2];

						$$renderer.push(`<div class="border-b border-gray-200 last:border-b-0 dark:border-gray-700"><div class="bg-gray-100 px-4 py-2 dark:bg-gray-700"><span class="text-xs font-semibold text-gray-900 dark:text-gray-100">${$.escape(division.name)}</span> <span class="ml-2 text-xs text-gray-600 dark:text-gray-400">(${$.escape(conference.name)})</span></div> <div class="overflow-x-auto"><table class="w-full text-xs"><thead class="border-b border-gray-200 bg-white text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300"><tr><th class="px-3 py-2 text-left font-medium">${$.escape(s('nfl.standings.header.rank'))}</th><th class="px-3 py-2 text-left font-medium">${$.escape(s('nfl.standings.header.team'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nfl.standings.header.w'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nfl.standings.header.l'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nfl.standings.header.t'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nfl.standings.header.pct'))}</th><th class="px-2 py-2 text-center font-medium hidden sm:table-cell">${$.escape(s('nfl.standings.header.pf'))}</th><th class="px-2 py-2 text-center font-medium hidden sm:table-cell">${$.escape(s('nfl.standings.header.pa'))}</th><th class="px-2 py-2 text-center font-medium hidden sm:table-cell">${$.escape(s('nfl.standings.header.diff'))}</th><th class="px-2 py-2 text-center font-medium">${$.escape(s('nfl.standings.header.strk'))}</th></tr></thead><tbody class="bg-white dark:bg-gray-800"><!--[-->`);

						const each_array_3 = $.ensure_array_like(division.teams);

						for (let index = 0, $$length = each_array_3.length; index < $$length; index++) {
							let team = each_array_3[index];
							const StreakIcon = getStreakIcon(team.streak);

							$$renderer.push(`<tr class="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-700"><td class="px-3 py-2 text-gray-700 dark:text-gray-300">${$.escape(index + 1)}</td><td class="px-3 py-2"><div class="flex items-center gap-2">`);

							if (team.logo) {
								$$renderer.push(`<!--[0--><img${$.attr('src', team.logo)}${$.attr('alt', `${$.stringify(team.abbrev)} logo`)} class="h-5 w-5 object-contain"/>`);
							} else {
								$$renderer.push('<!--[-1-->');
							}

							$$renderer.push(`<!--]--> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(team.abbrev)}</span></div></td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300">${$.escape(team.wins)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300">${$.escape(team.losses)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300">${$.escape(team.ties)}</td><td class="px-2 py-2 text-center font-bold text-gray-900 dark:text-gray-100">${$.escape(team.winPercent.toFixed(3))}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell">${$.escape(team.pointsFor)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell">${$.escape(team.pointsAgainst)}</td><td class="px-2 py-2 text-center text-gray-700 dark:text-gray-300 hidden sm:table-cell"><span${$.attr_class(team.pointsDifferential > 0
								? 'text-green-600 dark:text-green-400'
								: team.pointsDifferential < 0 ? 'text-red-600 dark:text-red-400' : '')}>${$.escape(team.pointsDifferential > 0 ? '+' : '')}${$.escape(team.pointsDifferential)}</span></td><td class="px-2 py-2 text-center"><div${$.attr_class(`flex items-center justify-center gap-1 ${$.stringify(getStreakColor(team.streak))}`)}>`);

							if (StreakIcon) {
								$$renderer.push('<!--[-->');
								StreakIcon($$renderer, { class: 'h-3 w-3' });
								$$renderer.push('<!--]-->');
							} else {
								$$renderer.push('<!--[!-->');
								$$renderer.push('<!--]-->');
							}

							$$renderer.push(` <span class="font-medium">${$.escape(team.streak)}</span></div></td></tr>`);
						}

						$$renderer.push(`<!--]--></tbody></table></div></div>`);
					}

					$$renderer.push(`<!--]-->`);
				}

				$$renderer.push(`<!--]--></div> <div class="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-600 dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-400"><div class="flex flex-wrap gap-x-3 gap-y-1"><span><strong>${$.escape(s('nfl.standings.header.w'))}:</strong> ${$.escape(s('nfl.standings.legend.w'))}</span> <span><strong>${$.escape(s('nfl.standings.header.l'))}:</strong> ${$.escape(s('nfl.standings.legend.l'))}</span> <span><strong>${$.escape(s('nfl.standings.header.t'))}:</strong> ${$.escape(s('nfl.standings.legend.t'))}</span> <span><strong>${$.escape(s('nfl.standings.header.pct'))}:</strong> ${$.escape(s('nfl.standings.legend.pct'))}</span> <span class="hidden sm:inline"><strong>${$.escape(s('nfl.standings.header.pf'))}:</strong> ${$.escape(s('nfl.standings.legend.pf'))}</span> <span class="hidden sm:inline"><strong>${$.escape(s('nfl.standings.header.pa'))}:</strong> ${$.escape(s('nfl.standings.legend.pa'))}</span> <span class="hidden sm:inline"><strong>${$.escape(s('nfl.standings.header.diff'))}:</strong> ${$.escape(s('nfl.standings.legend.diff'))}</span> <span><strong>${$.escape(s('nfl.standings.header.strk'))}:</strong> ${$.escape(s('nfl.standings.legend.strk'))}</span></div></div>`);
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}