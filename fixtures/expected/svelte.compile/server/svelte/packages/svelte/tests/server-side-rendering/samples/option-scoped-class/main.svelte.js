import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.select({ value: 'foo' }, ($$renderer) => {
		$$renderer.option(
			{ class: 'opt', value: 'foo' },
			($$renderer) => {
				$$renderer.push(`foo`);
			},
			'svelte-rgsspy'
		);
	});
}