import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { LocalStorage, TextInput } from "carbon-components-svelte";

var root = $.from_html(`<!> <div data-testid="display-value"> </div> <!> <button type="button" data-testid="clear-item">Clear item</button> <button type="button" data-testid="clear-all">Clear all</button>`, 1);

export default function LocalStorageFixture($$anchor) {
	let value = "initial";
	let storage;
	var fragment = root();
	var node = $.first_child(fragment);

	$.bind_this(
		LocalStorage(node, {
			key: 'e2e-local-storage-key',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
			}
		}),
		($$value) => storage = $$value,
		() => storage
	);

	var div = $.sibling(node, 2);
	var text = $.only_child(div, true);
	var node_1 = $.sibling(div, 2);

	TextInput(node_1, {
		'data-testid': 'value-input',
		labelText: 'Value',
		hideLabel: true,
		get value() {
			return value;
		},

		set value($$value) {
			value = $$value;
		}
	});

	var button = $.sibling(node_1, 2);
	var button_1 = $.sibling(button, 2);

	$.template_effect(() => $.set_text(text, value));
	$.event('click', button, () => storage?.clearItem());
	$.event('click', button_1, () => storage?.clearAll());
	$.append($$anchor, fragment);
}