import * as $ from 'svelte/internal/server';

export default function Select($$renderer, $$props) {
	let { children, $$slots, $$events, ...rest } = $$props;

	$$renderer.select(
		{ name: 'pets', id: 'pet-select1', ...rest },
		($$renderer) => {
			children($$renderer);
			$$renderer.push(`<!---->`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);
}