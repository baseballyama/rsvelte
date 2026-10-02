import * as $ from 'svelte/internal/server';
import { SelectItem, TimePicker, TimePickerSelect } from "carbon-components-svelte";

export default function TimePickerFixture($$renderer) {
	let value = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TimePicker($$renderer, {
			'data-testid': 'time-picker',
			labelText: 'Meeting time',
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				TimePickerSelect($$renderer, {
					value: 'pm',
					labelText: 'AM/PM',
					children: ($$renderer) => {
						SelectItem($$renderer, { value: 'am', text: 'AM' });
						$$renderer.push(`<!----> `);
						SelectItem($$renderer, { value: 'pm', text: 'PM' });
						$$renderer.push(`<!---->`);
					},
					$$slots: { default: true }
				});
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
}