import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

var root = $.from_html(`<svelte-css-wrapper style="display: contents"><!></svelte-css-wrapper>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	{
		$.css_props(node, () => ({ '--custom-cssprop': 'foo' }));

		Component(node.lastChild, {
			bare: true,
			shorthand,
			text1: 'val1',
			text2: 'val2',
			text3: `a${a ?? ''}b${b ?? ''}`,
			textEmpty: '',
			literal: true,
			strLiteral: 'foo',
			complex: { a },
			'a-dashed-complex': { a },
			$$events: { click: (e) => e }
		});

		$.reset(node);
	}

	$.append($$anchor, fragment);
}