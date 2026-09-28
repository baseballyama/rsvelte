import * as $ from 'svelte/internal/server';
import { Field, MultiCombo } from "../../src/index";
import { users, usersLarge } from "../data/userlist";
import UserOption from "../custom/UserOption.svelte";

export default function MultiCombo_1($$renderer) {
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

	$$renderer.push(`<div class="demo-box"><h3>MultiCombo with a simple list</h3> `);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, { options: users, value: [104] });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>MultiCombo with checkboxes</h3> `);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, { checkboxes: true, options: users, value: [104] });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>MultiCombo with a side label</h3> `);

	Field($$renderer, {
		label: 'Owner',
		position: 'left',
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, { options: users, value: [104] });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Field($$renderer, {
		label: 'Disabled',
		position: 'left',
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, { options: users, disabled: true, value: [104] });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Field($$renderer, {
		label: 'Error',
		error: true,
		position: 'left',
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, {
				title: 'Invalid option',
				options: users,
				error: true,
				value: [104]
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>MultiCombo with a template</h3> `);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			{
				function children($$renderer, { option }) {
					UserOption($$renderer, { data: option });
				}

				MultiCombo($$renderer, {
					options: users,
					value: [104],
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>MultiCombo with a custom "textField"</h3> `);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, { options: users, value: [104], textField: 'email' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>MultiCombo without a value</h3> `);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, { options: users });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>MultiCombo without options</h3> `);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>MultiCombo with hidden options</h3> `);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			MultiCombo($$renderer, { textOptions: users, options: renderedUsers, value: [87] });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box">`);

	Field($$renderer, {
		width: '500px',
		children: ($$renderer) => {
			$$renderer.push(`<h3>MultiCombo with keepText</h3> `);
			MultiCombo($$renderer, { keepText: true, options: users, value: [87] });
			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>Perfomance on a large list</h3> `);

	{
		function children($$renderer, { option }) {
			UserOption($$renderer, { data: option });
		}

		MultiCombo($$renderer, {
			options: usersLarge,
			value: [9000],
			dropdown: { virtualized: true },
			children,
			$$slots: { default: true }
		});
	}

	$$renderer.push(`<!----></div>`);
}