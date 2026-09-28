import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let div = void 0;
		const someData = '123';

		$$renderer.push(`<div>123</div>`);
		$.bind_props($$props, { someData });
	});
}