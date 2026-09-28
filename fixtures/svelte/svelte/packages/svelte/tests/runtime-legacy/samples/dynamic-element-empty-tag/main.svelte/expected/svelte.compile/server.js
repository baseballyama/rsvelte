import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let tag = '';

	$.element($$renderer, tag, void 0, () => {
		$$renderer.push(`Foo`);
	});
}