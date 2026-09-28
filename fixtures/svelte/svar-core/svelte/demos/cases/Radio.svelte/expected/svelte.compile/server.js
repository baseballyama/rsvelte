import * as $ from 'svelte/internal/server';
import { RadioButton, RadioButtonGroup, Field } from "../../src/index";

export default function Radio($$renderer) {
	let value = 1;

	let options = [
		{ id: 1, label: "Option 1" },
		{ id: 2, label: "Option 2" },
		{ id: 3, label: "Option 3" },
		{ id: 4, label: "Option 4" },
		{ id: 5, label: "Option 5" }
	];

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>RadioButton</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				RadioButton($$renderer, { label: 'Option 1', value: true, name: 'a1' });
				$$renderer.push(`<!----> `);
				RadioButton($$renderer, { label: 'Option 2', name: 'a1' });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>RadioButton with side label</h3> `);

		Field($$renderer, {
			label: 'Radio 1',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				RadioButton($$renderer, { name: 'a2' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Radio 2',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				RadioButton($$renderer, { name: 'a2' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				RadioButton($$renderer, { label: 'Default', disabled: true, name: 'a2' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Checked',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				RadioButton($$renderer, { label: 'Checked', value: true, name: 'a2' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>RadioButton group ( ${$.escape(value)} )</h3> `);

		Field($$renderer, {
			label: 'Radio group',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				RadioButtonGroup($$renderer, {
					options,
					get value() {
						return value;
					},

					set value($$value) {
						value = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>RadioButton group: inline</h3> `);

		Field($$renderer, {
			label: 'Radio group',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				RadioButtonGroup($$renderer, { options, type: 'inline', value: 3 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>RadioButton group: grid</h3> `);

		Field($$renderer, {
			label: 'Radio group',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				RadioButtonGroup($$renderer, { options, type: 'grid', value: 4 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}