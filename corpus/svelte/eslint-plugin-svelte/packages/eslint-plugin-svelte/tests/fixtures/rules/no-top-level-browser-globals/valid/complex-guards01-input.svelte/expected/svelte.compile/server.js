import * as $ from 'svelte/internal/server';
import { browser, dev } from '$app/environment';

export default function Complex_guards01_input($$renderer) {
	if (browser && dev) {
		$$renderer.push(`<!--[0--><div>${$.escape(localStorage.getItem('myCat'))}</div>`);
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}