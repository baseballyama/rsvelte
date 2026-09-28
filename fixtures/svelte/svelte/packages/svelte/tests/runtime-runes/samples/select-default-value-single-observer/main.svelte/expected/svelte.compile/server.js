import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let value = 'a';
	let bound = 'a';
	let spread = 'a';
	let props = { defaultValue: 'b' };

	$$renderer.select({ value, defaultValue: 'b' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ value: bound, defaultValue: 'b' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ ...props, value: spread }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});
}