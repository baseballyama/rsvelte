import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.push(`<select>`);

	$$renderer.option(
		{ value: 'a' },
		($$renderer) => {
			$$renderer.push(`<strong>Bold</strong> Option`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.option(
		{ value: 'b' },
		($$renderer) => {
			$$renderer.push(`<em>Italic</em> Option`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.option({ value: 'c' }, ($$renderer) => {
		$$renderer.push(`Plain Option`);
	});

	$$renderer.push(`</select>`);
}