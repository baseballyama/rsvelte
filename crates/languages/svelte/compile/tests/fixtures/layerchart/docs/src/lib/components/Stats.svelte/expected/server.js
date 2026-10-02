import * as $ from 'svelte/internal/server';
import { ScrollingValue } from 'svelte-ux';
import { IsInViewport, useInterval } from 'runed';
import { format } from '@layerstack/utils';
import { getStats } from '$lib/stats.remote';

export default function Stats($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const query = getStats();
		let npmEl = void 0;
		const inViewport = new IsInViewport(() => npmEl);
		const interval = useInterval(8000);

		const stats = $.derived(() => query.current
			? [
				{
					label: ' Downloads',
					value: query.current.npmDownloads,
					link: 'https://npmjs.com/package/layerchart',
					intervals: ['Weekly', 'Monthly', 'Lifetime']
				},

				{
					label: 'GitHub Stars',
					value: query.current.githubStars,
					link: 'https://github.com/techniq/layerchart'
				},

				{
					label: 'Discord Members',
					value: query.current.discordMembers,
					link: 'https://discord.gg/697JhMPD3t'
				},

				{
					label: 'Bluesky Followers',
					value: query.current.bskyFollowers,
					link: 'https://bsky.app/profile/techniq.dev'
				}
			].filter((s) => s.value != null)
			: []);

		if (query.loading || query.error || !query.current) {
			$$renderer.push(`<!--[0--><div class="grid grid-cols-2 md:grid-cols-4 items-center justify-items-center px-1 py-2 rounded-xl outline m-4 outline-surface-100 h-36 md:h-18 animate-pulse"></div>`);
		} else {
			$$renderer.push(`<!--[-1--><div class="flex flex-wrap items-center justify-evenly px-1 py-2 rounded-xl outline m-4 outline-surface-content/10"><!--[-->`);

			const each_array = $.ensure_array_like(stats());

			for (let index = 0, $$length = each_array.length; index < $$length; index++) {
				let { label, value, link, intervals } = each_array[index];

				$$renderer.push(`<a${$.attr('href', link)} target="_blank" class="flex flex-col justify-center items-center rounded-xl border border-transparent hover:bg-surface-100/50 hover:border-primary/20 whitespace-nowrap w-1/2 md:w-auto">`);

				if (intervals) {
					$$renderer.push(`<!--[0--><div class="h-14 w-36 text-center pt-1">`);

					ScrollingValue($$renderer, {
						value: interval.counter,
						axis: 'y',
						children: ($$renderer) => {
							const intervalIndex = interval.counter % intervals.length;

							$$renderer.push(`<div class="text-lg font-bold text-surface-content">${$.escape(format(query.current.npmDownloads[intervalIndex], 'metric', { fractionDigits: 1 }).toLowerCase() + '+')}</div> <div class="text-xs text-surface-content/60 text-center">${$.escape(intervals[intervalIndex])}
								${$.escape(label)}</div>`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----></div>`);
				} else {
					$$renderer.push(`<!--[-1--><div class="flex flex-col items-center px-4 py-2 text-lg"><span class="font-bold text-surface-content">${$.escape(format(value, 'metric', { fractionDigits: 1 }).toLowerCase() + '+')}</span> <span class="text-xs text-surface-content/60">${$.escape(label)}</span></div>`);
				}

				$$renderer.push(`<!--]--></a> `);

				if (index < stats().length - 1) {
					$$renderer.push(`<!--[0--><div class="w-0.5 h-12 bg-surface-content/5 hidden md:block"></div>`);
				} else {
					$$renderer.push('<!--[-1-->');
				}

				$$renderer.push(`<!--]-->`);
			}

			$$renderer.push(`<!--]--></div>`);
		}

		$$renderer.push(`<!--]-->`);
	});
}