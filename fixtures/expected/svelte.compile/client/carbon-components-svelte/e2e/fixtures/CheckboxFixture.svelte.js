import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Checkbox } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function CheckboxFixture($$anchor) {
	let checked = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Checkbox(node, {
		'data-testid': 'checkbox-agree',
		labelText: 'I agree to the terms',
		get checked() {
			return checked;
		},

		set checked($$value) {
			checked = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Checkbox(node_1, {
		'data-testid': 'checkbox-disabled',
		labelText: 'Disabled option',
		disabled: true
	});

	$.append($$anchor, fragment);
}