import * as $ from 'svelte/internal/server';
import { Switch, Field } from "../../src/index";

export default function Switch_1($$renderer) {
	let v1 = true;
	let v2 = false;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Switch Button</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Switch($$renderer, {
					get value() {
						return v1;
					},

					set value($$value) {
						v1 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Switch Button with a side label</h3> `);

		Field($$renderer, {
			label: `Switch: ${$.stringify(v2)}`,
			position: 'left',
			type: 'switch',
			children: ($$renderer) => {
				Switch($$renderer, {
					get value() {
						return v2;
					},

					set value($$value) {
						v2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			position: 'left',
			type: 'switch',
			children: ($$renderer) => {
				Switch($$renderer, { disabled: true });
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