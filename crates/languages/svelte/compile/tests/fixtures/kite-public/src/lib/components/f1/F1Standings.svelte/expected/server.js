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

export default function F1Standings($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let loading = true;
		let data = null;
		let error = null;
		let expanded = false;
		let refreshing = false;

		async function fetchStandings() {
			try {
				const response = await fetch('/api/widgets/f1/standings');

				if (response.ok) {
					const result = await response.json();

					data = result.data;
					error = null;
				} else {
					error = 'Failed to load standings';
				}
			} catch(err) {
				console.error('Failed to fetch F1 standings:', err);
				error = 'Failed to load standings';
			} finally {
				loading = false;
				refreshing = false;
			}
		}

		async function handleRefresh() {
			refreshing = true;
			await fetchStandings();
		}

		const summaryText = $.derived(() => {
			if (!data) return s('f1.standings.loading');

			return `${data.drivers.length} ${s('f1.drivers')} • ${data.constructors.length} ${s('f1.constructors')}`;
		});

		// Get top 3 drivers for preview
		const topDrivers = $.derived(() => {
			if (!data) return [];

			return data.drivers.slice(0, 3);
		});

		onMount(() => {
			fetchStandings();

			// Refresh every 5 minutes
			const interval = setInterval(fetchStandings, 300000);

			return () => clearInterval(interval);
		});

		$$renderer.push(`<div class="mb-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50"><div class="flex w-full items-center justify-between px-4 py-3"><button class="flex flex-1 items-center gap-2 text-left transition-colors hover:opacity-80">`);
		IconTrophy($$renderer, { class: 'h-4 w-4 text-gray-600 dark:text-gray-400' });
		$$renderer.push(`<!----> <span class="text-sm font-medium text-gray-900 dark:text-gray-100">${$.escape(s('f1.standings.title'))}</span> <span class="text-xs text-gray-600 dark:text-gray-400">${$.escape(summaryText())}</span> `);

		if (expanded) {
			$$renderer.push('<!--[0-->');
			IconChevronUp($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		} else {
			$$renderer.push('<!--[-1-->');
			IconChevronDown($$renderer, { class: 'ml-auto h-5 w-5 text-gray-600 dark:text-gray-400' });
		}

		$$renderer.push(`<!--]--></button> `);

		if (!loading) {
			$$renderer.push(`<!--[0--><button${$.attr('disabled', refreshing, true)} class="rounded p-1 text-gray-600 transition-colors hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-gray-700"${$.attr('aria-label', s('f1.standings.title'))}>`);
			IconRefresh($$renderer, { class: `h-4 w-4 ${refreshing ? 'animate-spin' : ''}` });
			$$renderer.push(`<!----></button>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--></div> `);

		if (!expanded && topDrivers().length > 0) {
			$$renderer.push(`<!--[0--><div class="border-t border-gray-200 px-4 py-2 dark:border-gray-700"><div class="space-y-1"><!--[-->`);

			const each_array = $.ensure_array_like(topDrivers());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let driver = each_array[index];

				$$renderer.push(`<div class="flex items-center justify-between text-xs"><div class="flex items-center gap-2"><span class="text-gray-600 dark:text-gray-400">${$.escape(index + 1)}.</span> <span class="font-medium text-gray-900 dark:text-gray-100">${$.escape(driver.driver.name)}</span> <span class="text-gray-500 dark:text-gray-500">${$.escape(driver.driver.code)}</span></div> <div class="flex items-center gap-3"><span class="text-gray-600 dark:text-gray-400">${$.escape(driver.wins)} ${$.escape(s('f1.wins'))}</span> <span class="min-w-[2rem] text-right font-bold text-gray-900 dark:text-gray-100">${$.escape(driver.points)} ${$.escape(s('f1.points'))}</span></div></div>`);
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
				$$renderer.push(`<!--[2--><div class="p-4"><h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">${$.escape(s('f1.driverStandings'))}</h3> <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="border-b border-gray-200 dark:border-gray-700"><tr class="text-left text-xs text-gray-600 dark:text-gray-400"><th class="pb-2 pr-4">${$.escape(s('f1.position'))}</th><th class="pb-2 pr-4">${$.escape(s('f1.driver'))}</th><th class="pb-2 pr-4">${$.escape(s('f1.team'))}</th><th class="pb-2 pr-4 text-right">${$.escape(s('f1.points'))}</th><th class="pb-2 text-right">${$.escape(s('f1.wins'))}</th></tr></thead><tbody><!--[-->`);

				const each_array_1 = $.ensure_array_like(data.drivers);

				for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
					let driver = each_array_1[$$index_1];

					$$renderer.push(`<tr class="border-b border-gray-100 last:border-0 dark:border-gray-700/50"><td class="py-2 pr-4"><span${$.attr_class(`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${driver.position <= 3
						? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
						: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`)}>${$.escape(driver.position)}</span></td><td class="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100"><div class="flex items-center gap-2"><span>${$.escape(driver.driver.name)}</span> <span class="text-xs text-gray-500 dark:text-gray-400">${$.escape(driver.driver.code)}</span></div></td><td class="py-2 pr-4 text-gray-600 dark:text-gray-400">${$.escape(driver.constructor.name)}</td><td class="py-2 pr-4 text-right font-semibold text-gray-900 dark:text-gray-100">${$.escape(driver.points)}</td><td class="py-2 text-right text-gray-600 dark:text-gray-400">${$.escape(driver.wins)}</td></tr>`);
				}

				$$renderer.push(`<!--]--></tbody></table></div></div> <div class="border-t border-gray-200 p-4 dark:border-gray-700"><h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">${$.escape(s('f1.constructorStandings'))}</h3> <div class="overflow-x-auto"><table class="w-full text-sm"><thead class="border-b border-gray-200 dark:border-gray-700"><tr class="text-left text-xs text-gray-600 dark:text-gray-400"><th class="pb-2 pr-4">${$.escape(s('f1.position'))}</th><th class="pb-2 pr-4">${$.escape(s('f1.team'))}</th><th class="pb-2 pr-4 text-right">${$.escape(s('f1.points'))}</th><th class="pb-2 text-right">${$.escape(s('f1.wins'))}</th></tr></thead><tbody><!--[-->`);

				const each_array_2 = $.ensure_array_like(data.constructors);

				for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
					let constructor = each_array_2[$$index_2];

					$$renderer.push(`<tr class="border-b border-gray-100 last:border-0 dark:border-gray-700/50"><td class="py-2 pr-4"><span${$.attr_class(`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${constructor.position <= 3
						? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
						: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`)}>${$.escape(constructor.position)}</span></td><td class="py-2 pr-4 font-medium text-gray-900 dark:text-gray-100">${$.escape(constructor.constructor.name)}</td><td class="py-2 pr-4 text-right font-semibold text-gray-900 dark:text-gray-100">${$.escape(constructor.points)}</td><td class="py-2 text-right text-gray-600 dark:text-gray-400">${$.escape(constructor.wins)}</td></tr>`);
				}

				$$renderer.push(`<!--]--></tbody></table></div></div>`);
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