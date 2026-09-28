import * as $ from 'svelte/internal/server';

import {
	IconChevronDown,
	IconChevronUp,
	IconFlag,
	IconLoader2,
	IconRefresh
} from '@tabler/icons-svelte';

import { onMount } from 'svelte';
import { s } from '$lib/client/localization.svelte';

export default function F1Schedule($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = true;
		let data = null;
		let error = null;
		let expanded = false;
		let refreshing = false;

		async function fetchSchedule() {
			try {
				const response = await fetch('/api/widgets/f1/schedule');

				if (response.ok) {
					const result = await response.json();

					data = result.data;
					error = null;
				} else {
					error = 'Failed to load schedule';
				}
			} catch(err) {
				console.error('Failed to fetch F1 schedule:', err);
				error = 'Failed to load schedule';
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function handleRefresh() {
			refreshing = true;
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
			if (!data) return s('f1.schedule.loading');

			if (data.nextRace) {
				const daysUntil = getDaysUntil(data.nextRace.date, data.nextRace.time);

				if (daysUntil === 0) return s('f1.schedule.today');
				if (daysUntil === 1) return s('f1.schedule.tomorrow');

				return s('f1.schedule.inDays', { days: daysUntil.toString() });
			}

			return s('f1.schedule.seasonComplete');
		});

		// Get upcoming races for preview (next 3)
		const upcomingRaces = $.derived(() => {
			if (!data?.races) return [];

			return data.races.filter((r) => r.status === 'upcoming').slice(0, 3);
		});

		onMount(() => {
			fetchSchedule();

			// Refresh every 5 minutes
			const interval = setInterval(fetchSchedule, 300000);

			return () => clearInterval(interval);
		});

		$$renderer.push(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80">`);
		IconFlag($$renderer, { class: 'h-4 w-4 text-gray-600 dark:text-gray-400' });
		$$renderer.push(`<!----> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('f1.schedule.title'))}</span> <span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(summaryText())}</span> `);

		if (expanded) {
			$$renderer.push('<!--[0-->');
			IconChevronUp($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		} else {
			$$renderer.push('<!--[-1-->');
			IconChevronDown($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (!loading) {
			$$renderer.push(`<!--[0--><button${$.attr('disabled', refreshing, true)} class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"${$.attr('aria-label', s('f1.schedule.title'))}>`);
			IconRefresh($$renderer, { class: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!expanded && upcomingRaces().length > 0) {
			$$renderer.push(`<!--[0--><div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="space-y-1"><!--[-->`);

			const each_array = $.ensure_array_like(upcomingRaces());

			for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
				let race = each_array[$$index];
				const daysUntil = getDaysUntil(race.date, race.time);
				const isNext = race.round === data?.nextRace?.round;

				$$renderer.push(`<div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2">`);

				if (isNext) {
					$$renderer.push(`<!--[0--><span class="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-semibold text-white">${$.escape(s('f1.nextRace'))}</span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(race.name)}</span></div> <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400"><span>${$.escape(formatDate(race.date))}</span> `);

				if (daysUntil > 0) {
					$$renderer.push(`<!--[0--><span>`);

					if (daysUntil === 0) {
						$$renderer.push(`<!--[0-->${$.escape(s('f1.today'))}`);
					} else if (daysUntil === 1) {
						$$renderer.push(`<!--[1-->${$.escape(s('f1.tomorrow'))}`);
					} else {
						$$renderer.push(`<!--[-1-->${$.escape(daysUntil)} ${$.escape(s('f1.days'))}`);
					}

					$$renderer.push(`<!--]--></span>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]--></div></div>`);
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
			} else if (error) {
				$$renderer.push(`<!--[1--><div class="p-8 text-center text-red-600 dark:text-red-400">${$.escape(error)}</div>`);
			} else if (data) {
				$$renderer.push(`<!--[2--><div class="p-4"><div class="space-y-2"><!--[-->`);

				const each_array_1 = $.ensure_array_like(data.races);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let race = each_array_1[$$index_1];
					const isNext = race.round === data.nextRace?.round;
					const isLast = race.round === data.lastRace?.round;

					$$renderer.push(`<div${$.attr_class(`rounded-lg border p-3 ${isNext
						? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-900/20'
						: 'border-gray-200 dark:border-gray-700'}`)}><div class="flex items-start justify-between"><div class="flex-1"><div class="flex items-center gap-2"><span class="text-xs font-semibold text-gray-500 dark:text-gray-400">${$.escape(s('f1.round'))} ${$.escape(race.round)}</span> `);

					if (isNext) {
						$$renderer.push(`<!--[0--><span class="rounded-full bg-red-600 px-2 py-0.5 text-xs font-semibold text-white">${$.escape(s('f1.nextRace'))}</span>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="mt-1 font-semibold text-gray-900 dark:text-gray-100">${$.escape(race.name)}</div> <div class="mt-1 text-sm text-gray-600 dark:text-gray-400">${$.escape(race.circuit.location)}, ${$.escape(race.circuit.country)}</div> `);

					if (race.winner) {
						$$renderer.push(`<!--[0--><div class="mt-2 text-sm text-gray-600 dark:text-gray-400"><span class="font-medium">${$.escape(s('f1.winner'))}:</span> ${$.escape(race.winner.name)} <span class="text-gray-500 dark:text-gray-500">(${$.escape(race.winner.constructor)})</span></div>`);
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]--></div> <div class="text-right"><div class="font-semibold text-gray-900 dark:text-gray-100">${$.escape(formatDate(race.date))}</div> `);

					if (race.status === 'upcoming') {
						$$renderer.push('<!--[0-->');

						const days = getDaysUntil(race.date, race.time);

						$$renderer.push(`<div class="mt-1 text-sm text-gray-600 dark:text-gray-400">`);

						if (days <= 0) {
							$$renderer.push(`<!--[0-->${$.escape(s('f1.today'))}`);
						} else if (days === 1) {
							$$renderer.push(`<!--[1-->${$.escape(s('f1.tomorrow'))}`);
						} else {
							$$renderer.push(`<!--[-1-->${$.escape(days)} ${$.escape(s('f1.days'))}`);
						}

						$$renderer.push(`<!--]--></div>`);
					} else {
						$$renderer.push(`<!--[-1--><div class="mt-1 text-sm text-gray-500 dark:text-gray-500">${$.escape(s('f1.completed'))}</div>`);
					}

					$$renderer.push(`<!--]--></div></div></div>`);
				}

				$$renderer.push(`<!--]--></div></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div>`);
	});
}