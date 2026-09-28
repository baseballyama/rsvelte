import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import SessionStorage from "carbon-components-svelte/SessionStorage/SessionStorage.svelte";

var root = $.from_html(`<div data-testid="default-storage"><!></div> <div data-testid="storage-object"><!></div>`, 1);

export default function SessionStorage_test($$anchor) {
	// Example values for testing
	const primitiveValue = "test-value";

	const objectValue = { theme: "dark", fontSize: 16 };
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	SessionStorage(node, { value: primitiveValue });
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	SessionStorage(node_1, {
		key: 'theme-settings',
		get value() {
			return objectValue;
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}