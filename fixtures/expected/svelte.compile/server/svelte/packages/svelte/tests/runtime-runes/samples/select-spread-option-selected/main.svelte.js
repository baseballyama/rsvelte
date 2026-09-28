import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let others = { onclick: () => {} };

	$$renderer.select({ ...others }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`o1`);
		});

		$$renderer.option({ selected: true }, ($$renderer) => {
			$$renderer.push(`o2`);
		});
	});
}