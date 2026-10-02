import * as $ from 'svelte/internal/server';

export default function Input($$renderer) {
	$.css_props($$renderer, true, { '--custom-cssprop': 'foo' }, () => {
		Component($$renderer, {
			bare: true,
			shorthand,
			text1: 'val1',
			text2: 'val2',
			text3: `a${$.stringify(a)}b${$.stringify(b)}`,
			textEmpty: '',
			literal: true,
			strLiteral: 'foo',
			complex: { a },
			'a-dashed-complex': { a }
		});
	});
}