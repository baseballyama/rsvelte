import * as $ from 'svelte/internal/server';

export default function Select_ts($$renderer) {
	let size = 1;
	let name = 'a';
	$$renderer.select({ value: size, onchange: (e) => size = e.currentTarget.selectedIndex }, ($$renderer) => {
		$$renderer.option({ value: 1 }, ($$renderer) => {
			$$renderer.push(`small`);
		});
		$$renderer.option({ value: 2 }, ($$renderer) => {
			$$renderer.push(`large`);
		});
	});
	$$renderer.push(` `);
	$$renderer.select({ value: name.toFixed(1) }, ($$renderer) => {
		$$renderer.option({}, name);
	});
}
