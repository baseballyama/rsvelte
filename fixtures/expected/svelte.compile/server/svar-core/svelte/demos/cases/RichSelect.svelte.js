import * as $ from 'svelte/internal/server';
import { Field, RichSelect } from "../../src/index";
import { users, usersLarge } from "../data/userlist";
import UserOption from "../custom/UserOption.svelte";

export default function RichSelect_1($$renderer) {
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

	$$renderer.push(`<div class="demo-box"><h3>RichSelect with a simple list</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			RichSelect($$renderer, { options: users, value: 104 });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect with a side label</h3> `);

	Field($$renderer, {
		label: 'Owner',
		position: 'left',
		children: ($$renderer) => {
			RichSelect($$renderer, { options: users, value: 104 });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Field($$renderer, {
		label: 'Disabled',
		position: 'left',
		children: ($$renderer) => {
			RichSelect($$renderer, { options: users, disabled: true, value: 104 });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Field($$renderer, {
		label: 'Error',
		position: 'left',
		error: true,
		children: ($$renderer) => {
			RichSelect($$renderer, {
				options: users,
				error: true,
				value: 104,
				title: 'Invalid option'
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect overflow</h3> `);

	Field($$renderer, {
		width: '150px',
		children: ($$renderer) => {
			RichSelect($$renderer, { options: users, value: 105 });
			$$renderer.push(`<!----> <br/> `);

			{
				function children($$renderer, option) {
					$$renderer.push(`<!---->${$.escape(option.label)}`);
				}

				RichSelect($$renderer, {
					options: users,
					value: 105,
					children,
					$$slots: { default: true }
				});
			}

			$$renderer.push(`<!---->`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect with a template</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			{
				function children($$renderer, option) {
					UserOption($$renderer, { data: option });
				}

				RichSelect($$renderer, {
					options: users,
					value: 104,
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect with a custom "textField"</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			RichSelect($$renderer, { options: users, value: 104, textField: 'email' });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect without a value</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			RichSelect($$renderer, { options: users });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect without options</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			RichSelect($$renderer, {});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect with clear button</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			RichSelect($$renderer, { options: users, value: 104, clear: true });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>RichSelect with hidden options</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			RichSelect($$renderer, { textOptions: users, options: renderedUsers, value: 87 });
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div> <div class="demo-box"><h3>Perfomance on a large list</h3> `);

	Field($$renderer, {
		children: ($$renderer) => {
			RichSelect($$renderer, {
				options: usersLarge,
				value: 1000,
				dropdown: { virtualized: true }
			});
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div>`);
}