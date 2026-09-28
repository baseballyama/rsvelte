import * as $ from 'svelte/internal/server';

export default function Select($$renderer, $$props) {
	let { attrs } = $$props;

	$$renderer.select({ multiple: true, ...attrs }, ($$renderer) => {
		$$renderer.option({ value: '1' }, ($$renderer) => {
			$$renderer.push(`option 1`);
		});

		$$renderer.option({ value: '2' }, ($$renderer) => {
			$$renderer.push(`option 2`);
		});
	});
}