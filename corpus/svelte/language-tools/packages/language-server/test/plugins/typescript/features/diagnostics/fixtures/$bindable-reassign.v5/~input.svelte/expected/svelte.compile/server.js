import * as $ from 'svelte/internal/server';

export default function Input($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let { foo = void 0, foo2 } = $$props;

		function onClick() {
			foo = 42;
		}

		$$renderer.push(`<button>Click me</button>`);
		$.bind_props($$props, { foo });
	});
}