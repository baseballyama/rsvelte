import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let label = 'hello';
	let count = 42;

	$$renderer.push(`<select>`);

	$$renderer.option(
		{ value: 'a' },
		($$renderer) => {
			$$renderer.push(`<span>${$.escape(label)}</span> ${$.escape(label)}`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.option({ value: 'b' }, ($$renderer) => {
		$$renderer.push(`Plain text`);
	});

	$$renderer.push(`</select> <button></button>`);
}