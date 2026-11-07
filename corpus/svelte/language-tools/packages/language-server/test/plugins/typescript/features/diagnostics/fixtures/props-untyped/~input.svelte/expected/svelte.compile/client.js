import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Component from './untyped-ts.svelte';

var root = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!> <!>`, 1);

export default function Input($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	Component(node, { typedAsAny: undefined, untyped: undefined });

	var node_1 = $.sibling(node, 2);

	Component(node_1, { typedAsAny: null, untyped: null });

	var node_2 = $.sibling(node_1, 2);

	Component(node_2, { typedAsAny: true, untyped: true });

	var node_3 = $.sibling(node_2, 2);

	Component(node_3, { typedAsAny: 123, untyped: 123 });

	var node_4 = $.sibling(node_3, 2);

	Component(node_4, { typedAsAny: 'string', untyped: 'string' });

	var node_5 = $.sibling(node_4, 2);

	Component(node_5, { typedAsAny: { some: 'object' }, untyped: { some: 'object' } });

	var node_6 = $.sibling(node_5, 2);

	Component(node_6, {
		typedAsAny: ['string', 'array'],
		untyped: ['string', 'array']
	});

	var node_7 = $.sibling(node_6, 2);

	Component(node_7, {
		typedAsAny: ['array', 123, false],
		untyped: ['array', 123, false]
	});

	var node_8 = $.sibling(node_7, 2);

	Component(node_8, {
		typedAsAny: ['array', 123, false],
		untyped: ['array', 123, false]
	});

	$.append($$anchor, fragment);
}