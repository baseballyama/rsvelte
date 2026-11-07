import * as $ from 'svelte/internal/server';
import { ColorSelect, Field } from "../../src/index";

export default function ColorSelect_1($$renderer) {
	let color = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>The selected color: ${$.escape(color ? color : "")}</h3> `);

		Field($$renderer, {
			label: 'Select a color',
			children: ($$renderer) => {
				ColorSelect($$renderer, {
					title: 'Colors can be reconfigured',
					get value() {
						return color;
					},

					set value($$value) {
						color = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Custom colors</h3> `);

		Field($$renderer, {
			label: 'Your color',
			position: 'left',
			children: ($$renderer) => {
				ColorSelect($$renderer, {
					colors: ["#65D3B3", "#FFC975", "#58C3FE"],
					placeholder: 'Select a color...'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			position: 'left',
			children: ($$renderer) => {
				ColorSelect($$renderer, {
					colors: ["#65D3B3", "#FFC975", "#58C3FE"],
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
				ColorSelect($$renderer, {
					colors: ["#65D3B3", "#FFC975", "#58C3FE"],
					placeholder: 'Select a color...',
					error: true
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Clear icon</h3> `);

		Field($$renderer, {
			label: 'Select a color',
			children: ($$renderer) => {
				ColorSelect($$renderer, {
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