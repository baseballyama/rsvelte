import * as $ from 'svelte/internal/server';
import { Checkbox, Field, CheckboxGroup } from "../../src/index";

export default function Checkbox_1($$renderer) {
	let options = [
		{ id: 1, label: "Option 1" },
		{ id: 2, label: "Option 2" },
		{ id: 3, label: "Option 3" },
		{ id: 4, label: "Option 4" },
		{ id: 5, label: "Option 5" }
	];

	let v1 = true;
	let v2 = false;
	let v3 = true;
	let valueGroup1 = [1, 2];
	let valueGroup2 = [2, 3];
	let valueGroup3 = [3, 4];

	function print(v) {
		return v.join(", ");
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Checkbox</h3> Value:
	${$.escape(v1)} <p>`);

		Checkbox($$renderer, {
			label: 'Check',
			get value() {
				return v1;
			},

			set value($$value) {
				v1 = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></p> Value:
	${$.escape(v2)} <p>`);

		Checkbox($$renderer, {
			label: 'Uncheck',
			get value() {
				return v2;
			},

			set value($$value) {
				v2 = $$value;
				$$settled = false;
			}
		});

		$$renderer.push(`<!----></p></div> <div class="demo-box"><h3>Checkbox with a side label</h3> `);

		Field($$renderer, {
			label: 'Checkbox',
			type: 'checkbox',
			position: 'left',
			children: ($$renderer) => {
				Checkbox($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			type: 'checkbox',
			position: 'left',
			children: ($$renderer) => {
				Checkbox($$renderer, { label: 'Default', disabled: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			type: 'checkbox',
			position: 'left',
			children: ($$renderer) => {
				Checkbox($$renderer, {
					label: 'Checked',
					disabled: true,
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

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Checkbox group: ${$.escape(print(valueGroup1))}</h3> `);

		Field($$renderer, {
			label: 'Check group',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				CheckboxGroup($$renderer, {
					options,
					get value() {
						return valueGroup1;
					},

					set value($$value) {
						valueGroup1 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Checkbox group inline: ${$.escape(print(valueGroup2))}</h3> `);

		Field($$renderer, {
			label: 'Check group',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				CheckboxGroup($$renderer, {
					options,
					type: 'inline',
					get value() {
						return valueGroup2;
					},

					set value($$value) {
						valueGroup2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Checkbox group grid: ${$.escape(print(valueGroup3))}</h3> `);

		Field($$renderer, {
			label: 'Check group',
			position: 'left',
			type: 'checkbox',
			children: ($$renderer) => {
				CheckboxGroup($$renderer, {
					options,
					type: 'grid',
					get value() {
						return valueGroup3;
					},

					set value($$value) {
						valueGroup3 = $$value;
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