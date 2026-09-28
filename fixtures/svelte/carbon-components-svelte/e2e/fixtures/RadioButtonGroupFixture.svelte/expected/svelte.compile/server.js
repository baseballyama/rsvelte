import * as $ from 'svelte/internal/server';
import { RadioButton, RadioButtonGroup } from "carbon-components-svelte";

export default function RadioButtonGroupFixture($$renderer) {
	let selected = "one";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		RadioButtonGroup($$renderer, {
			'data-testid': 'radio-group-choice',
			legendText: 'Choose one',
			get selected() {
				return selected;
			},

			set selected($$value) {
				selected = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				RadioButton($$renderer, { value: 'one', labelText: 'Option One' });
				$$renderer.push(`<!----> `);
				RadioButton($$renderer, { value: 'two', labelText: 'Option Two' });
				$$renderer.push(`<!----> `);
				RadioButton($$renderer, { value: 'three', labelText: 'Option Three' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <p data-testid="selected-value">Selected: ${$.escape(selected)}</p>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}