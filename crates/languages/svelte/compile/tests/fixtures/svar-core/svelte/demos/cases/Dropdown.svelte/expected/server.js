import * as $ from 'svelte/internal/server';
import { Field, Dropdown, Calendar, RadioButtonGroup, Button } from "../../src/index";

export default function Dropdown_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		const positions = ["bottom", "top", "left", "right"].map((id) => ({ id, label: id }));
		const alignOptions = ["start", "center", "end"].map((id) => ({ id, label: id }));
		let popup = void 0;
		let position = "bottom";
		let align = "start";
		let $$settled = true;
		let $$inner_renderer;

		function $$render_inner($$renderer) {
			$$renderer.push(`<div class="demo-box"><div class="label svelte-7yu0ai">Select dropdown position</div> `);

			RadioButtonGroup($$renderer, {
				options: positions,
				type: 'inline',
				get value() {
					return position;
				},

				set value($$value) {
					position = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="label svelte-7yu0ai">Select dropdown align</div> `);

			RadioButtonGroup($$renderer, {
				options: alignOptions,
				type: 'inline',
				get value() {
					return align;
				},

				set value($$value) {
					align = $$value;
					$$settled = false;
				}
			});

			$$renderer.push(`<!----> <div class="dropdown-box svelte-7yu0ai">`);

			Field($$renderer, {
				children: ($$renderer) => {
					Button($$renderer, {
						css: 'my-button',
						onclick: () => popup = true,
						children: ($$renderer) => {
							$$renderer.push(`<!---->Click to show a dropdown`);
						},
						$$slots: { default: true }
					});

					$$renderer.push(`<!----> `);

					if (popup) {
						$$renderer.push('<!--[0-->');

						Dropdown($$renderer, {
							width: '300px',
							position,
							align,
							oncancel: () => popup = false,
							css: 'my-dropdown',
							children: ($$renderer) => {
								Calendar($$renderer, {});
							},
							$$slots: { default: true }
						});
					} else {
						$$renderer.push('<!--[-1-->');
					}

					$$renderer.push(`<!--]-->`);
				},
				$$slots: { default: true }
			});

			$$renderer.push(`<!----></div></div>`);
		}

		do {
			$$settled = true;
			$$inner_renderer = $$renderer.copy();
			$$render_inner($$inner_renderer);
		} while (!$$settled);

		$$renderer.subsume($$inner_renderer);
	});
}