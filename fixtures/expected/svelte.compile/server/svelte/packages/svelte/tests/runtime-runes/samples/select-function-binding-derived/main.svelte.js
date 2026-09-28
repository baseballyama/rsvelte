import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	let source = 'b';
	let value = $.derived(() => source);

	$$renderer.select({ value: (() => value())() }, ($$renderer) => {
		$$renderer.option({ value: 'a' }, ($$renderer) => {
			$$renderer.push(`a`);
		});

		$$renderer.option({ value: 'b' }, ($$renderer) => {
			$$renderer.push(`b`);
		});
	});
}