import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$.element($$renderer, "div", void 0, () => {
		$$renderer.push(`Foo`);
	});
}