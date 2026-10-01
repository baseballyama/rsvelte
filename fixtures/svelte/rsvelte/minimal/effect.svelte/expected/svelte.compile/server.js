import * as $ from 'svelte/internal/server';

export default function Effect($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let n = 0;

		function f() {
			return 1;
		}

		$$renderer.push(`<button>${$.escape(n)} ${$.escape(f())}</button>`);
	});
}