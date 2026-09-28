import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	const props = { defaultValue: 'b' };

	$$renderer.select({ defaultValue: 'b' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ ...props }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue: 'b', value: 'a' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ multiple: '', defaultValue: ['a', 'c'] }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});

		$$renderer.option({ value: 'c' }, ($$renderer) => {
			$$renderer.push(`C`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ defaultValue: 'b' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});

	$$renderer.push(` `);

	$$renderer.select({ ...{ defaultValue: 'b' }, defaultValue: 'a' }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`A`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`B`);
		});
	});
}