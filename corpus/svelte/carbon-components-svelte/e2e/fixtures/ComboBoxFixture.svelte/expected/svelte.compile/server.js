import * as $ from 'svelte/internal/server';
import { ComboBox } from "carbon-components-svelte";

export default function ComboBoxFixture($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const items = [
			{ id: "0", text: "Slack" },
			{ id: "1", text: "Email" },
			{ id: "2", text: "Fax" }
		];

		function shouldFilterItem(item, value) {
			if (!value) return true;

			return item.text.toLowerCase().includes(value.toLowerCase());
		}

		$$renderer.push(`<button type="button" data-testid="outside-target">Outside target</button> `);

		ComboBox($$renderer, {
			'data-testid': 'combobox-contact',
			labelText: 'Contact',
			placeholder: 'Select contact method',
			items,
			shouldFilterItem
		});

		$$renderer.push(`<!----> <a href="#" data-testid="outside-link">Outside</a> `);

		ComboBox($$renderer, {
			'data-testid': 'combobox-select-on-focus',
			labelText: 'Select on focus',
			placeholder: 'Select',
			items,
			selectTextOnFocus: true,
			selectedId: '1',
			value: 'Email'
		});

		$$renderer.push(`<!----> <div data-testid="combobox-clear-reopen-wrapper">`);

		ComboBox($$renderer, {
			'data-testid': 'combobox-clear-reopen',
			labelText: 'Clear reopen',
			placeholder: 'Select',
			items,
			shouldFilterItem,
			openOnClear: true,
			selectedId: '1',
			value: 'Email'
		});

		$$renderer.push(`<!----></div>`);
	});
}