import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let label = 'hello';

	$$renderer.push(`<select><optgroup label="Fruits"><span class="group-header">${$.escape(label)}</span> `);

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

	$$renderer.push(` `);

	$$renderer.option({ value: 'b' }, ($$renderer) => {
		$$renderer.push(`Plain option`);
	});

	$$renderer.push(`<!></optgroup><optgroup label="Static Group">`);

	$$renderer.option({ value: 'c' }, ($$renderer) => {
		$$renderer.push(`Another option`);
	});

	$$renderer.push(`</optgroup></select> <button></button>`);
}