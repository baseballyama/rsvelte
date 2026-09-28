import * as $ from 'svelte/internal/server';
import { Text, Field } from "../../src/index";

export default function Text_1($$renderer) {
	let text2 = "";
	let password2 = "";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		$$renderer.push(`<div class="demo-box"><h3>Text with a top label</h3> `);

		Field($$renderer, {
			label: 'First name',
			children: ($$renderer) => {
				Text($$renderer, {
					placeholder: 'Type here',
					get value() {
						return text2;
					},

					set value($$value) {
						text2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Last name',
			children: ($$renderer) => {
				Text($$renderer, {
					placeholder: 'Type here',
					get value() {
						return text2;
					},

					set value($$value) {
						text2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Last name',
			children: ($$renderer) => {
				Text($$renderer, {
					disabled: true,
					placeholder: 'Type here',
					get value() {
						return text2;
					},

					set value($$value) {
						text2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Last name',
			error: true,
			children: ($$renderer) => {
				Text($$renderer, {
					error: true,
					placeholder: 'Type here',
					title: 'Invalid value',
					get value() {
						return text2;
					},

					set value($$value) {
						text2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Text with a side label</h3> `);

		Field($$renderer, {
			label: 'First name',
			position: 'left',
			children: ($$renderer) => {
				Text($$renderer, {
					get value() {
						return text2;
					},

					set value($$value) {
						text2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Last name',
			position: 'left',
			children: ($$renderer) => {
				Text($$renderer, {
					get value() {
						return text2;
					},

					set value($$value) {
						text2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Number input with a side label</h3> `);

		Field($$renderer, {
			label: 'Number',
			position: 'left',
			children: ($$renderer) => {
				Text($$renderer, { type: 'number' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Password input with a side label</h3> `);

		Field($$renderer, {
			label: 'Password',
			position: 'left',
			children: ($$renderer) => {
				Text($$renderer, {
					type: 'password',
					get value() {
						return password2;
					},

					set value($$value) {
						password2 = $$value;
						$$settled = false;
					}
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Icon inside of the text control</h3> `);

		Field($$renderer, {
			label: 'Start Date',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, { icon: 'wxi-calendar', css: 'wx-icon-left' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'End Date',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, { icon: 'wxi-calendar' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Text control with clear button</h3> `);

		Field($$renderer, {
			label: 'First name',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, { placeholder: 'Type here', clear: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Number',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, { type: 'number', clear: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Number and icon',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, { type: 'number', clear: true, icon: 'wxi-calendar' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Number and icon left',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, {
					type: 'number',
					clear: true,
					icon: 'wxi-calendar',
					css: 'wx-icon-left'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'End Date',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, { icon: 'wxi-calendar', clear: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Start Date',
			position: 'top',
			children: ($$renderer) => {
				Text($$renderer, { icon: 'wxi-calendar', css: 'wx-icon-left', clear: true });
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