import * as $ from 'svelte/internal/server';
import { LocalStorage, TextInput } from "carbon-components-svelte";

export default function LocalStorageFixture($$renderer) {
	let value = "initial";
	let storage;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		LocalStorage($$renderer, {
			key: 'e2e-local-storage-key',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <div data-testid="display-value">${$.escape(value)}</div> `);

		TextInput($$renderer, {
			'data-testid': 'value-input',
			labelText: 'Value',
			hideLabel: true,
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <button type="button" data-testid="clear-item">Clear item</button> <button type="button" data-testid="clear-all">Clear all</button>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}