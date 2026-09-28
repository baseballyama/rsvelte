import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.select({ multiple: true, value: null }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`option`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ multiple: true, value: undefined }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`option`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ multiple: true, value: 123 }, ($$renderer) => {
		$$renderer.option({}, ($$renderer) => {
			$$renderer.push(`option`);
		});
	});
}