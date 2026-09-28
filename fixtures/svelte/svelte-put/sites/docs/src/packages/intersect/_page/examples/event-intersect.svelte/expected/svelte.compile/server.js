import * as $ from 'svelte/internal/server';
import { intersect } from '@svelte-put/intersect';

export default function Event_intersect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let detail = void 0;

		function onIntersect(e) {
			detail = e.detail;
		}

		$$renderer.push(`<div class="hl-info mx-auto flex h-80 w-4/5 flex-col items-center justify-between"><!--[-->`);

		const each_array = $.ensure_array_like(new Array(2));

		for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
			let _ = each_array[$$index];

			$$renderer.push(`<p>`);

			if (detail) {
				$$renderer.push(`<!--[0--><span>Scrolling ${$.escape(detail?.direction)}</span> &amp; <span>${$.escape(detail?.entries[0]?.isIntersecting ? 'entering' : 'leaving')}</span>`);
			} else {
				$$renderer.push('<!--[-1-->');
			}

			$$renderer.push(`<!--]--></p>`);
		}

		$$renderer.push(`<!--]--></div>`);
	});
}