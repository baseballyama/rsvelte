import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let fruit = 'apple';
	let vegetable = 'carrot';

	$$renderer.push(`<select><optgroup label="Fruits"><span class="fruits-header">${$.escape(fruit)}</span> `);

	$$renderer.option(
		{ value: 'a' },
		($$renderer) => {
			$$renderer.push(`<span>${$.escape(fruit)}</span> ${$.escape(fruit)}`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(` `);

	$$renderer.option({ value: 'b' }, ($$renderer) => {
		$$renderer.push(`banana`);
	});

	$$renderer.push(`<!></optgroup><optgroup label="Vegetables"><em class="veggies-header">${$.escape(vegetable)}</em> `);

	$$renderer.option(
		{ value: 'c' },
		($$renderer) => {
			$$renderer.push(`<em>${$.escape(vegetable)}</em> ${$.escape(vegetable)}`);
		},
		void 0,
		void 0,
		void 0,
		void 0,
		true
	);

	$$renderer.push(` `);

	$$renderer.option({ value: 'd' }, ($$renderer) => {
		$$renderer.push(`Plain celery`);
	});

	$$renderer.push(`<!></optgroup></select> <button>Change</button>`);
}