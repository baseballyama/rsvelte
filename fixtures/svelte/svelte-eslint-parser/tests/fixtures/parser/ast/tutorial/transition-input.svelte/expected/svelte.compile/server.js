import * as $ from 'svelte/internal/server';
import { fade } from 'svelte/transition';

export default function Transition_input($$renderer) {
	let visible = true;

	$$renderer.push(`<label><input type="checkbox"${$.attr('checked', visible, true)}/> visible</label> `);

	if (visible) {
		$$renderer.push(`<!--[0--><p>Fades in and out</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}