import * as $ from 'svelte/internal/server';
import { Counter, Field } from "../../src/index";

export default function Counter_1($$renderer) {
	let v1 = 5;
	let v2 = 3;
	let v3 = 29;
	let v4 = 0;

	function handleChange({ input, value }) {
		if (!input) v4 = value;
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box">`);

		Field($$renderer, {
			label: 'No initial value',
			children: ($$renderer) => {
				Counter($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Initial value',
			children: ($$renderer) => {
				Counter($$renderer, {
					get value() {
						return v1;
					},

					set value($$value) {
						v1 = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> <div>The value is: ${$.escape(v1)}</div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Custom step',
			children: ($$renderer) => {
				Counter($$renderer, {
					step: 3,
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
			label: 'With negative numbers',
			children: ($$renderer) => {
				Counter($$renderer, { min: -Infinity });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'With custom min and max values (-30, 30)',
			children: ($$renderer) => {
				Counter($$renderer, {
					min: -30,
					max: 30,
					get value() {
						return v3;
					},

					set value($$value) {
						v3 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Handling change event',
			children: ($$renderer) => {
				Counter($$renderer, { onchange: handleChange });
				$$renderer.push(`<!----> <div>The value is: ${$.escape(v4)}</div>`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			children: ($$renderer) => {
				Counter($$renderer, { disabled: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Readonly',
			children: ($$renderer) => {
				Counter($$renderer, { readonly: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Error',
			children: ($$renderer) => {
				Counter($$renderer, { error: true });
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