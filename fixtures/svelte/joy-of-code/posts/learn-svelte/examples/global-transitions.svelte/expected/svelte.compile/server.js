import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Global_transitions($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let play = false;
		let replay = false;

		$$renderer.push(`<div class="container">`);

		if (play) {
			$$renderer.push(`<!--[0--><!---->`);

			{
				$$renderer.push(`<div class="items svelte-flcjwr"><!--[-->`);

				const each_array = $.ensure_array_like(Array(50));

				for (let i = 0, $$length = each_array.length; i < $$length; i++) {
					$$renderer.push(`<div>${$.escape(i + 1)}</div>`);
				}

				$$renderer.push(`<!--]--></div>`);
			}

			$$renderer.push(`<!---->`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button class="svelte-flcjwr">Replay</button></div>`);
	});
}