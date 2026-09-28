import * as $ from 'svelte/internal/server';
import { Field, Slider } from "../../src/index";

export default function Slider_1($$renderer) {
	let valueA = 50;
	let valueB = 50;
	let valueC = 50;

	function onInput({ input, value, previous }) {
		if (input) {
			console.log(`Input change from ${previous} to ${value}`);
			valueB = value;
		}
	}

	function onChange({ input, value, previous }) {
		if (!input) {
			console.log(`Final input change from ${previous} to ${value}`);
			valueC = value;
		}
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Slider</h3> `);

		Field($$renderer, {
			label: 'Updates from binding',
			position: 'left',
			type: 'slider',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: `Progress: ${$.stringify(valueA)}%`,
					get value() {
						return valueA;
					},

					set value($$value) {
						valueA = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Updates from input `change` event',
			position: 'left',
			type: 'slider',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: `Progress: ${$.stringify(valueB)}%`,
					value: valueB,
					onchange: onInput
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Updates from `change` event',
			position: 'left',
			type: 'slider',
			children: ($$renderer) => {
				Slider($$renderer, {
					label: `Progress: ${$.stringify(valueC)}%`,
					value: valueC,
					onchange: onChange
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			position: 'left',
			type: 'slider',
			children: ($$renderer) => {
				Slider($$renderer, { disabled: true, value: 20 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Unset value',
			position: 'left',
			type: 'slider',
			children: ($$renderer) => {
				Slider($$renderer, { title: 'Default slider\'s value is 0' });
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