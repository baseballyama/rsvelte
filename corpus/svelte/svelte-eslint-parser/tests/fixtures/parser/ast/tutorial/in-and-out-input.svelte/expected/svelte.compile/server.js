import * as $ from 'svelte/internal/server';
import { fade, fly } from 'svelte/transition';

export default function In_and_out_input($$renderer) {
	let visible = true;

	$$renderer.push(`<label><input type="checkbox"${$.attr('checked', visible, true)}/> visible</label> `);

	if (visible) {
		$$renderer.push(`<!--[0--><p>Flies in and out</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}