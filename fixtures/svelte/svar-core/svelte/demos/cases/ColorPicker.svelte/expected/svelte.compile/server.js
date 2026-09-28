import * as $ from 'svelte/internal/server';
import { ColorBoard, ColorPicker, Field } from "../../src/index";

export default function ColorPicker_1($$renderer) {
	let value = "#48C8E2";
	let selectedColor = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>The current color: ${$.escape(value || "")}</h3> <div style="width:300px; height: auto;">`);

		ColorBoard($$renderer, {
			get value() {
				return value;
			},

			set value($$value) {
				value = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div> <h3>The selected form color: ${$.escape(selectedColor || "")}</h3> <div style="width:300px; height: auto;">`);

		ColorBoard($$renderer, {
			get value() {
				return selectedColor;
			},

			set value($$value) {
				selectedColor = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></div></div> <div class="demo-box"><h3>Custom color select forms:</h3> `);

		Field($$renderer, {
			label: 'Your color',
			position: 'left',
			children: ($$renderer) => {
				ColorPicker($$renderer, { value: '#5D59BA', placeholder: 'Select a color...' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			position: 'left',
			children: ($$renderer) => {
				ColorPicker($$renderer, {
					placeholder: 'Select a color...',
					disabled: true,
					value: '#65D3B3'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Error',
			position: 'left',
			error: true,
			children: ($$renderer) => {
				ColorPicker($$renderer, { placeholder: 'Select a color...', error: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Clear button',
			position: 'left',
			children: ($$renderer) => {
				ColorPicker($$renderer, {
					value: '#65D3B3',
					placeholder: 'Select a color...',
					clear: true
				});
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