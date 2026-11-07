import * as $ from 'svelte/internal/server';

export default function Main($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		function with_writes(initialState) {
			const derive = initialState;

			return derive;
		}

		let data = { example: 'Example' };
		let my_derived = $.derived(() => with_writes({ example: data.example }));

		$$renderer.push(`<input${$.attr('value', data.example)}/>`);
	});
}