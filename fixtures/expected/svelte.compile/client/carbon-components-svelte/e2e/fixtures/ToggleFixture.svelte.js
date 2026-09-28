import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Toggle } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function ToggleFixture($$anchor) {
	let toggled = false;
	var fragment = root();
	var node = $.first_child(fragment);

	Toggle(node, {
		'data-testid': 'toggle-notifications',
		labelText: 'Enable notifications',
		get toggled() {
			return toggled;
		},

		set toggled($$value) {
			toggled = $$value;
		}
	});

	var node_1 = $.sibling(node, 2);

	Toggle(node_1, {
		'data-testid': 'toggle-disabled',
		labelText: 'Disabled toggle',
		disabled: true
	});

	$.append($$anchor, fragment);
}