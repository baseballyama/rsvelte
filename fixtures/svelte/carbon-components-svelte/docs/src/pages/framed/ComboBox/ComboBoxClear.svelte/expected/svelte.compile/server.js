import * as $ from 'svelte/internal/server';
import { Button, ComboBox } from "carbon-components-svelte";

export default function ComboBoxClear($$renderer) {
	let ref;

	ComboBox($$renderer, {
		labelText: 'Contact',
		placeholder: 'Select contact method',
		selectedId: '1',
		items: [
			{ id: "0", text: "Slack" },
			{ id: "1", text: "Email" },
			{ id: "2", text: "Fax" }
		]
	});

	$$renderer.push(`<!----> <br/> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Clear`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Clear (no focus)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Button($$renderer, {
		children: ($$renderer) => {
			$$renderer.push(`<!---->Clear (reopen menu)`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!---->`);
}