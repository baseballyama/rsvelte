import * as $ from 'svelte/internal/server';
import { Select, Field } from "../../src/index";
import { users } from "../data/userlist";

export default function Select_1($$renderer) {
	let v1 = "";
	let v2 = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Select with a top label</h3> `);

		Field($$renderer, {
			label: 'Details',
			children: ($$renderer) => {
				Select($$renderer, {
					options: users,
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

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Select with a side label</h3> `);

		Field($$renderer, {
			label: 'Details',
			position: 'left',
			children: ($$renderer) => {
				Select($$renderer, {
					options: users,
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
			children: ($$renderer) => {
				Select($$renderer, { disabled: true, options: users });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Error',
			position: 'left',
			error: true,
			children: ($$renderer) => {
				Select($$renderer, { error: true, options: users, title: 'Invalid option' });
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