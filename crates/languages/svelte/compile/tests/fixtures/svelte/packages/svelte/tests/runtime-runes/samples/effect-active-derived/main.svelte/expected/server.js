import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = false;

		const fn = () => {
			if (false) {}

			return value;
		};

		let outer = false;
		let inner = false;
		let v = $.derived(() => inner ? fn() : false);

		$$renderer.push(`<button>toggle outer</button> <button>toggle inner</button> <button>reset</button> `);

		if (outer && v()) {
			$$renderer.push(`<!--[0--><p>v is true</p>`);
		} else {
			$$renderer.push('<!--[-1-->');
		}

		$$renderer.push(`<!--]-->`);
	});
}