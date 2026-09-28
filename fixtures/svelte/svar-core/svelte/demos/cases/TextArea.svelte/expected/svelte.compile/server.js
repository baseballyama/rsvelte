import * as $ from 'svelte/internal/server';
import { TextArea, Field } from "../../src/index";

export default function TextArea_1($$renderer) {
	let v1 = "";
	let v2 = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Area with a top label</h3> `);

		Field($$renderer, {
			label: 'Details',
			children: ($$renderer) => {
				TextArea($$renderer, {
					placeholder: 'Type here',
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
			label: 'Disabled',
			children: ($$renderer) => {
				TextArea($$renderer, {
					disabled: true,
					placeholder: 'Type here',
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
			label: 'Readonly',
			children: ($$renderer) => {
				TextArea($$renderer, {
					readonly: true,
					placeholder: 'Type here',
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
				TextArea($$renderer, {
					error: true,
					placeholder: 'Type here',
					title: 'It can\'t be empty',
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

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Area with a side label</h3> `);

		Field($$renderer, {
			label: 'Details',
			position: 'left',
			children: ($$renderer) => {
				TextArea($$renderer, {
					placeholder: 'Type here',
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

		$$renderer.push(`<!----></div>`);
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}