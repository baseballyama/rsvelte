import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	Component($$renderer, {
		propA: true,
		propB,
		propC: 'val1',
		propD: 'val2',
		propE: `a${$.stringify(a)}b${$.stringify(b)}`
	});
}