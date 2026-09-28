import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Inspect from '@components/Inspect.svelte';

var rest_excludes = new Set(['$$slots', '$$events', '$$legacy']);

export default function KeyboardNavDemo($$anchor, $$props) {
	let props = $.rest_props($$props, rest_excludes);

	let values = $.proxy({
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
	});

	Inspect($$anchor, $.spread_props(() => props, {
		get values() {
			return values;
		},
		expandLevel: 0,
		typeToFocus: true,
		disableKeynav: false
	}));
}