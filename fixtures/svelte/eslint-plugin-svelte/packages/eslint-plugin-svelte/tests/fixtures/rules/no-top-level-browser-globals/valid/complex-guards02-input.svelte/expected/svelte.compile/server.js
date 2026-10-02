import * as $ from 'svelte/internal/server';
import { browser, dev } from '$app/environment';

export default function Complex_guards02_input($$renderer) {
	if (!browser || !dev) {
		$$renderer.push(`<!--[0--><div>DEV</div>`);
	} else {
		$$renderer.push(`<!--[-1--><div>${$.escape(localStorage.getItem('myCat'))}</div>`);
	}

	$$renderer.push(`<!--]-->`);
}