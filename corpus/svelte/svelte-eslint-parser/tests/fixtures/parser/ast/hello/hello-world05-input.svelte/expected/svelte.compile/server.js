import * as $ from 'svelte/internal/server';
import { quintOut } from 'svelte/easing';
import { fade, draw, fly } from 'svelte/transition';
import { expand } from './custom-transitions.js';
import { inner, outer } from './shape.js';

export default function Hello_world05_input($$renderer) {
	let visible = true;

	if (visible) {
		$$renderer.push(`<!--[0--><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 103 124" class="svelte-1ylurb2"><g opacity="0.2"><path style="stroke: #ff3e00; fill: #ff3e00; stroke-width: 50;"${$.attr('d', outer)} class="svelte-1ylurb2"></path><path style="stroke:#ff3e00; stroke-width: 1.5"${$.attr('d', inner)} class="svelte-1ylurb2"></path></g></svg> <div class="centered svelte-1ylurb2"><!--[-->`);

		const each_array = $.ensure_array_like('SVELTE');

		for (let i = 0, $$length = each_array.length; i < $$length; i++) {
			let char = each_array[i];

			$$renderer.push(`<span class="svelte-1ylurb2">${$.escape(char)}</span>`);
		}

		$$renderer.push(`<!--]--></div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]--> <label class="svelte-1ylurb2"><input type="checkbox"${$.attr('checked', visible, true)}/> toggle me</label> <link href="https://fonts.googleapis.com/css?family=Overpass:100,400" rel="stylesheet"/>`);
}