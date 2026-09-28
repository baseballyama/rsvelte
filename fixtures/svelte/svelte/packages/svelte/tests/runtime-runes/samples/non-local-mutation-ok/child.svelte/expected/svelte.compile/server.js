import * as $ from 'svelte/internal/server';

export default function Child($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { klass, getter_setter } = $$props;

		$$renderer.push(`<button>mutate</button>`);
	});
}