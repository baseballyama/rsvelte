import * as $ from 'svelte/internal/server';

export default function Echo($$renderer, $$props) {
	let dummy = 0;

	function increment() {
		dummy = 1;
	}

	$$renderer.push(`<!--[-->`);
	$.slot($$renderer, $$props, 'default', { dummy }, null);
	$$renderer.push(`<!--]--> <button></button>`);
}