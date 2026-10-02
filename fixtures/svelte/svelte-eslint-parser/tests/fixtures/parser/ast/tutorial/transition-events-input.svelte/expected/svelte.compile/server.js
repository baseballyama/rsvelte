import * as $ from 'svelte/internal/server';
import { fly } from 'svelte/transition';

export default function Transition_events_input($$renderer) {
	let visible = true;
	let status = 'waiting...';

	$$renderer.push(`<p>status: ${$.escape(status)}</p> <label><input type="checkbox"${$.attr('checked', visible, true)}/> visible</label> `);

	if (visible) {
		$$renderer.push(`<!--[0--><p>Flies in and out</p>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}