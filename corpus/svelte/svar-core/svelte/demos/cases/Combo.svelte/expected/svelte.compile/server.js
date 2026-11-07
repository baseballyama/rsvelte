import * as $ from 'svelte/internal/server';
import { Field, Combo, Button } from "../../src/index";
import { users, usersLarge } from "../data/userlist";
import UserOption from "../custom/UserOption.svelte";

export default function Combo_1($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		let value = "";
		const values = [104, 103, 102, ""];

		function changeValue() {
			value = values[(values.indexOf(value) + 1) % values.length];
		}

		const renderedUsers = [
			{
				id: 103,
				label: "Ned Stark",
				email: "winterhell@gmail.com",
				avatar: "https://cdn.svar.dev/demos/assets/avatar/491902305.jpg"
			},

			{
				id: 104,
				label: "Lord Varys",
				email: "little.birds@gmail.com",
				avatar: "https://cdn.svar.dev/demos/assets/avatar/005471511.jpg"
			}
		];

		$$renderer.push(`<div class="demo-box"><h3>Combo with a simple list</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, { options: users, value: 104 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Disabled',
			children: ($$renderer) => {
				Combo($$renderer, { options: users, disabled: true, value: 104 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			label: 'Error',
			error: true,
			children: ($$renderer) => {
				Combo($$renderer, {
					options: users,
					error: true,
					value: 104,
					title: 'Invalid option'
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo with a dynamic value</h3> `);

		Button($$renderer, {
			onclick: changeValue,
			children: ($$renderer) => {
				$$renderer.push(`<!---->Change the value`);
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, { options: users, value });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo with a side label</h3> `);

		Field($$renderer, {
			label: 'Owner',
			position: 'left',
			children: ($$renderer) => {
				Combo($$renderer, { options: users, value: 104 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo with a template</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				{
					function children($$renderer, { option }) {
						UserOption($$renderer, { data: option });
					}

					Combo($$renderer, {
						options: users,
						value: 104,
						children,
						$$slots: { default: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo with a custom "textField"</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, { options: users, value: 104, textField: 'email' });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo without a value</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, { options: users });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo with a value that's not in options</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, { options: users, value: 4 });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo without options</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, {});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo with clear button</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, { options: users, value: 104, clear: true });
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Combo with hidden options</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, {
					textOptions: users,
					options: renderedUsers,
					value: 87,
					clearButton: true
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div> <div class="demo-box"><h3>Perfomance on a large list</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				{
					function children($$renderer, { option }) {
						UserOption($$renderer, { data: option });
					}

					Combo($$renderer, {
						options: usersLarge,
						value: 9000,
						dropdown: { virtualized: true },
						children,
						$$slots: { default: true }
					});
				}
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----> <h3>Combo with ids: '0', '000', '0E1'</h3> `);

		Field($$renderer, {
			children: ($$renderer) => {
				Combo($$renderer, {
					options: ["0", "000", "0E1"].map((id) => ({ id, label: `"${id}" option` }))
				});
			},
			$$slots: { default: true }
		});

		$$renderer.push(`<!----></div>`);
	});
}