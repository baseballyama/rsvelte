import * as $ from 'svelte/internal/server';
import { Button, ComboBox } from "carbon-components-svelte";

export default function ReactiveComboBox($$renderer) {
	let selectedId = "1";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		ComboBox($$renderer, {
			labelText: 'Contact',
			placeholder: 'Select contact method',
			items: [
				{ id: "0", text: "Slack" },
				{ id: "1", text: "Email" },
				{ id: "2", text: "Fax" }
			],

			get selectedId() {
				return selectedId;
			},

			set selectedId($$value) {
				selectedId = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----> <br/> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set to undefined (unselected)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Button($$renderer, {
			children: ($$renderer) => {
				$$renderer.push(`<!---->Set to 2 (Fax)`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!---->`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}