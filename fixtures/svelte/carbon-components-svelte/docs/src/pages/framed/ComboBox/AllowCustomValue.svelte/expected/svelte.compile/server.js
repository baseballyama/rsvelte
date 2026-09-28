import * as $ from 'svelte/internal/server';
import { ComboBox, Stack } from "carbon-components-svelte";

export default function AllowCustomValue($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let selectedId = undefined;
		let value = "";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			Stack($$renderer, {
				gap: 2,
				children: ($$renderer) => {
					ComboBox($$renderer, {
						allowCustomValue: true,
						labelText: 'Favorite fruit',
						placeholder: 'Select or enter a fruit',
						helperText: 'You can select from the list or type your own',
						items: [
							{ id: "0", text: "Apple" },
							{ id: "1", text: "Banana" },
							{ id: "2", text: "Orange" },
							{ id: "3", text: "Strawberry" }
						],

						shouldFilterItem: (item, value) => {
							if (!value) return true;

							return item.text.toLowerCase().includes(value.toLowerCase());
						},

						get selectedId() {
							return selectedId;
						},

						set selectedId($$value) {
							selectedId = $$value;
							$$settled = false;
						},

						get value() {
							return value;
						},

						set value($$value) {
							value = $$value;
							$$settled = false;
						}
					});

					$$renderer.push(`<!----> <div><div><strong>Selected ID:</strong> ${$.escape(selectedId ?? "none")}</div> <div><strong>Current value:</strong> ${$.escape(value || "empty")}</div></div>`);
				},
				$$slots: { default: true }
			});
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}