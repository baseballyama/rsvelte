import * as $ from 'svelte/internal/server';
import { Text, Field } from "../../src/index";

export default function Field_1($$renderer) {
	let v1 = "";
	let v2 = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Top Fields</h3> `);

		Field($$renderer, {
			label: 'Text',
			children: ($$renderer) => {
				Text($$renderer, {
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

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Error',
			error: true,
			children: ($$renderer) => {
				Text($$renderer, {
					error: true,
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

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Required',
			required: true,
			children: ($$renderer) => {
				Text($$renderer, {
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

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Left Field</h3> `);

		Field($$renderer, {
			label: 'Text',
			position: 'left',
			children: ($$renderer) => {
				Text($$renderer, {
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
			label: 'Error',
			position: 'left',
			error: true,
			children: ($$renderer) => {
				Text($$renderer, {
					error: true,
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
			label: 'Required',
			position: 'left',
			required: true,
			children: ($$renderer) => {
				Text($$renderer, {
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

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Nested Field controls</h3> `);

		Field($$renderer, {
			label: 'Each control is associated with its closest Field label',
			children: ($$renderer) => {
				Field($$renderer, {
					label: 'First Name',
					position: 'left',
					children: ($$renderer) => {
						Text($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!----> `);

				Field($$renderer, {
					label: 'Last Name',
					position: 'left',
					children: ($$renderer) => {
						Text($$renderer, {});
					},
					$$slots: { default: true }
				});

				$$renderer.push(`<!---->`);
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