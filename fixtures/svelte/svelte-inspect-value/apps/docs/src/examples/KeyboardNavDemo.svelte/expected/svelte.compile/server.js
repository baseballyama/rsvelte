import * as $ from 'svelte/internal/server';
import Inspect from '@components/Inspect.svelte';

export default function KeyboardNavDemo($$renderer, $$props) {
	let { $$slots, $$events, ...props } = $$props;

	let values = {
		nestedObject: {
			'': 'Try spamming your right arrow key or enter!',
			foo: 'foo',
			bar: 'bar',
			baz: {
				foo: 'foo',
				bar: 'bar',
				baz: {
					foo: 'foo',
					bar: 'bar',
					baz: { foo: 'foo', bar: 'bar', baz: [[[]]] }
				}
			}
		},
		nestedArray: [1, 2, 3, [4, [5, 6, 7, [8, 9, [0]]]]],
		lorem: 'Try typing "lorem" when another node is focused.\nThis node should be focused.'
	};

	Inspect($$renderer, $.spread_props([
		props,
		{
			values,
			expandLevel: 0,
			typeToFocus: true,
			disableKeynav: false
		}
	]));
}