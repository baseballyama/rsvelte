import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let count = 0;
	let button = void 0;

	function do_thing() {
		button?.click();

		return false;
	}

	$$renderer.push(`<button>${$.escape(count)}</button> `);

	if (do_thing()) {
		$$renderer.push('<!--[0-->');
	} else {
		$$renderer.push('<!--[-1-->');
	}

	$$renderer.push(`<!--]-->`);
}