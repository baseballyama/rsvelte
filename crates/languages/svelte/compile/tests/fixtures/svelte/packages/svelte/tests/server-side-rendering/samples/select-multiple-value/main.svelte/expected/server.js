import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.select({ multiple: true, value: ['a', 'c'] }, ($$renderer) => {
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
}