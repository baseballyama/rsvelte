import * as $ from 'svelte/internal/server';
import { onMount } from 'svelte';

export default function PreloadingIndicator($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let p = 0;
		let visible = false;

		onMount(() => {
			visible = true;

			function next() {
				p += 0.1;

				const remaining = 1 - p;

				if (remaining > 0.15) setTimeout(next, 500 / remaining);
			}

			setTimeout(next, 250);
		});

		if (visible) {
			$$renderer.push(`<!--[0--><div class="progress-container svelte-1mgdynx"><div class="progress svelte-1mgdynx"${$.attr_style(`width: ${$.stringify(p * 100)}%`)}></div></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> `);

		if (p >= 0.4) {
			$$renderer.push(`<!--[0--><div class="fade svelte-1mgdynx"></div>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}