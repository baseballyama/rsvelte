import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let count = 1;

		function track(value) {
			let val = value;

			return value;
		}

		if (track(count)) {
			$$renderer.push('<!--[0-->');
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]--> <button></button>`);
	});
}