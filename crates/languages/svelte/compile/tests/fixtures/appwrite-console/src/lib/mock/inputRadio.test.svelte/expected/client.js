import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InputRadio } from '$lib/elements/forms';

var root = $.from_html(`<!> <!> <!>`, 1);

export default function InputRadio_test($$anchor) {
	var fragment = root();
	var node = $.first_child(fragment);

	InputRadio(node, {
		label: 'one',
		id: 'one',
		group: 'radio',
		value: '1',
		name: 'radio'
	});

	var node_1 = $.sibling(node, 2);

	InputRadio(node_1, {
		label: 'two',
		id: 'two',
		group: 'radio',
		value: '2',
		name: 'radio'
	});

	var node_2 = $.sibling(node_1, 2);

	InputRadio(node_2, {
		label: 'three',
		id: 'three',
		group: 'radio',
		value: '3',
		name: 'radio'
	});

	$.append($$anchor, fragment);
}