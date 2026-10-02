import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TextInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!> <div data-testid="text-input-fluid-counter-case"><!></div>`, 1);

export default function TextInputFixture($$anchor) {
	let value = "";
	var fragment = root();
	var node = $.first_child(fragment);

	TextInput(node, {
		'data-testid': 'text-input-username',
		labelText: 'User name',
		placeholder: 'Enter your name',
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	TextInput(node_1, {
		'data-testid': 'text-input-disabled',
		labelText: 'Disabled field',
		placeholder: 'Cannot edit',
		disabled: true
	});

	var node_2 = $.sibling(node_1, 2);

	TextInput(node_2, {
		'data-testid': 'text-input-invalid',
		labelText: 'Invalid field',
		placeholder: 'Has error',
		invalid: true,
		invalidText: 'This field is required'
	});

	var div = $.sibling(node_2, 2);
	var node_3 = $.child(div);

	TextInput(node_3, {
		fluid: true,
		labelText: 'Nickname',
		maxCount: 10,
		value: 'abc'
	});

	$.reset(div);
	$.append($$anchor, fragment);
}