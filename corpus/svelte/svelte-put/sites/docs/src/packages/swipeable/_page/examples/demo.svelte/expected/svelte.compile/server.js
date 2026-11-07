import * as $ from 'svelte/internal/server';
import { swipeable } from '@svelte-put/swipeable';
import { slide } from 'svelte/transition';

export default function Demo($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		// :::focus
		// :::highlight
		// :::
		// :::
		const ITEMS = new Array(4).fill(undefined).map(() => ({
			id: 'crypto' in globalThis
				? crypto.randomUUID()
				: Math.random().toString(36).slice(2),
			title: 'Message from Universe',
			excerpt: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. \
			Repudiandae blanditiis nulla perspiciatis quas necessitatibus deleniti! Sapiente fuge...'
		}));

		let items = structuredClone(ITEMS);
		let direction = null;

		function swipestart(e) {
			direction = e.detail.direction;
		}

		function swipeend(e) {
			const { passThreshold } = e.detail;

			if (passThreshold) {
				const id = e.target.dataset.id;

				items = items.filter((i) => i.id !== id);
			}
		}

		function reset() {
			items = structuredClone(ITEMS);
			direction = null;
		}

		$$renderer.push(`<div class="flex items-baseline justify-between gap-4"><p class="mt-0">Swipe left to archive, swipe right to delete</p> <button class="c-btn c-btn--outlined">Reset</button></div> <ul class="relative mt-8 overflow-hidden border border-current p-2"><!--[-->`);

		const each_array = $.ensure_array_like(items);

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let { id, title, excerpt } = each_array[$$index];

			$$renderer.push(`<li${$.attr_class('relative', void 0, {
				'bg-error-bg': direction === 'right',
				'bg-info-bg': direction === 'left'
			})}>`);

			if (direction === 'right') {
				$$renderer.push(`<!--[0--><div class="i i-[trash] absolute left-4 top-1/2 z-0 h-6 w-6 -translate-y-1/2 text-white"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]-->  <article class="z-px border-outline bg-bg-100 relative touch-pan-y space-y-1 border p-4"${$.attr('data-id', id)}${$.attr_style('', { left: 'var(--swipe-distance-x)' })}><p class="flex items-center gap-2 leading-normal"><i class="i i-[envelope-simple] h-6 w-6"></i> <span>>></span> <span class="font-medium">${$.escape(title)}</span></p> <hr/> <p class="text-sm leading-relaxed">${$.escape(excerpt)}</p></article> `);

			if (direction === 'left') {
				$$renderer.push(`<!--[0--><div class="i i-[archive] absolute right-4 top-1/2 z-0 h-6 w-6 -translate-y-1/2 text-white"></div>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></li>`);
		}

		$$renderer.push(`<!--]--></ul>`);
	});
}