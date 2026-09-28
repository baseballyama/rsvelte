import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const a = new (class {
			foo = 0;
		})();
	});
}