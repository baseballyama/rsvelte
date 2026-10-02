import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import LocalStorage from "carbon-components-svelte/LocalStorage/LocalStorage.svelte";

var root = $.from_html(`<div data-testid="default-storage"><!></div> <div data-testid="storage-object"><!></div>`, 1);

export default function LocalStorage_test($$anchor) {
	// Example values for testing
	const primitiveValue = "test-value";

	const objectValue = { theme: "dark", fontSize: 16 };
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	LocalStorage(node, { value: primitiveValue });
	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.child(div_1);

	LocalStorage(node_1, {
		key: 'theme-settings',
		get value() {
			return objectValue;
		}
	});

	$.reset(div_1);
	$.append($$anchor, fragment);
}