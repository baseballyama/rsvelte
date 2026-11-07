import * as $ from 'svelte/internal/server';
import LazyImg from '$lib/core/components/image/lazy-img.svelte';
import { date } from '$lib/core/utils';

export default function _OrderTracking($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { tracks } = $$props;

		$$renderer.push(`<div><h3 class="mb-4">Timeline</h3> <div class="flex flex-col gap-2"><!--[-->`);

		const each_array = $.ensure_array_like(tracks);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let t = each_array[$$index];

			$$renderer.push(`<div><div class="mb-2 flex items-start gap-4"><div class="h-5 w-5 shrink-0 overflow-hidden rounded-full">`);

			if (t.icon) {
				$$renderer.push('<!--[0-->');

				LazyImg($$renderer, {
					src: t.icon,
					width: '20',
					height: '20',
					alt: `${$.stringify(t.title)} icon`,
					class: 'h-full w-full bg-zinc-100 object-contain object-center'
				});
			} else {
				$$renderer.push(`<!--[-1--><div class="h-full w-full bg-zinc-200"></div>`);
			}

			$$renderer.push(`<!--]--></div> <h6 class="flex-1 gap-1 capitalize">${$.escape(t.title)}</h6></div> <div class="flex gap-4"><div class="flex w-5 items-center justify-center"><div class="h-full min-h-[24px] w-[2px] bg-zinc-200"></div></div> <div class="flex flex-1 flex-col gap-1">`);

			if (t.comment) {
				$$renderer.push(`<!--[0--><p class="first-letter:uppercase">${$.escape(t.comment)}</p>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--> <span class="text-xs text-zinc-500">${$.escape(date(t.time))}</span></div></div></div>`);
		}

		$$renderer.push(`<!--]--></div></div>`);
	});
}