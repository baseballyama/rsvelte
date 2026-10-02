import * as $ from 'svelte/internal/server';

export default function Main($$renderer) {
	$$renderer.select(
		{ class: 'foo', value: 'foo' },
		($$renderer) => {
			$$renderer.option({ value: 'foo' }, ($$renderer) => {
				$$renderer.push(`foo`);
			});
		},
		'svelte-18avu97'
	);
}