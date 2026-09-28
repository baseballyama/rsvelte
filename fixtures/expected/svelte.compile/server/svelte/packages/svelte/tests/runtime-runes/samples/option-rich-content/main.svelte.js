import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let selected = 'a';
	let label_a = 'Option';
	let label_b = 'Strong';

	$$renderer.select({ value: selected }, ($$renderer) => {
		$$renderer.option(
			{ value: 'a' },
			($$renderer) => {
				$$renderer.push(`<span>${$.escape(label_a)}</span> A`);
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
				$$renderer.push(`<strong>Strong</strong> B`);
			},
			void 0,
			void 0,
			void 0,
			void 0,
			true
		);

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`Plain C`);
		});
	});

	$$renderer.push(` <p>Selected: ${$.escape(selected)}</p> <button>Change A</button>`);
}