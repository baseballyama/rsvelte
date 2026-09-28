import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let heading = 'h1';
	let tag = 'div';

	$.element($$renderer, heading, void 0, () => {
		$$renderer.push(`Foo`);
	});

	$$renderer.push(` `);

	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`Bar`);
	});
}