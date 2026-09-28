import * as $ from 'svelte/internal/server';
import { TimePicker, Field, Locale } from "../../src/index";
import { cn } from "@svar-ui/core-locales";

export default function TimePicker_1($$renderer) {
	let value = null;
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>TimePicker</h3> `);

		Field($$renderer, {
			label: 'Initial value',
			position: 'left',
			children: ($$renderer) => {
				TimePicker($$renderer, {
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

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Default value',
			position: 'left',
			children: ($$renderer) => {
				TimePicker($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>TimePicker with a side label</h3> `);

		Field($$renderer, {
			label: 'Time',
			position: 'left',
			children: ($$renderer) => {
				TimePicker($$renderer, { value });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			position: 'left',
			children: ($$renderer) => {
				TimePicker($$renderer, { value, disabled: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Error',
			position: 'left',
			error: true,
			children: ($$renderer) => {
				TimePicker($$renderer, { value, error: true, title: 'Invalid option' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>TimePicker with a dropdown that matches the input width</h3> `);

		Field($$renderer, {
			label: 'Time',
			position: 'left',
			children: ($$renderer) => {
				TimePicker($$renderer, { dropdown: { width: "100%" }, value });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>12-hour TimePicker</h3> `);

		Locale($$renderer, {
			words: {
				formats: { timeFormat: "%g:%i %a" },
				calendar: { clockFormat: 12 }
			},

			children: ($$renderer) => {
				Field($$renderer, {
					children: ($$renderer) => {
						TimePicker($$renderer, { value });
					},
					$$slots: { default: true }
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>CN locale</h3> `);

		Locale($$renderer, {
			words: cn,
			children: ($$renderer) => {
				Field($$renderer, {
					children: ($$renderer) => {
						TimePicker($$renderer, { value });
					},
					$$slots: { default: true }
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