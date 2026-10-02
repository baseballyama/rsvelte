import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, MultiCombo } from "../../src/index";
import { users, usersLarge } from "../data/userlist";
import UserOption from "../custom/UserOption.svelte";

var root = $.from_html(`<h3>MultiCombo with keepText</h3> <!>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><h3>MultiCombo with a simple list</h3> <!></div> <div class="demo-box"><h3>MultiCombo with checkboxes</h3> <!></div> <div class="demo-box"><h3>MultiCombo with a side label</h3> <!> <!> <!></div> <div class="demo-box"><h3>MultiCombo with a template</h3> <!></div> <div class="demo-box"><h3>MultiCombo with a custom "textField"</h3> <!></div> <div class="demo-box"><h3>MultiCombo without a value</h3> <!></div> <div class="demo-box"><h3>MultiCombo without options</h3> <!></div> <div class="demo-box"><h3>MultiCombo with hidden options</h3> <!></div> <div class="demo-box"><!></div> <div class="demo-box"><h3>Perfomance on a large list</h3> <!></div>`, 1);

export default function MultiCombo_1($$anchor) {
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

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				get options() {
					return users;
				},
				value: [104]
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Field(node_1, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				checkboxes: true,
				get options() {
					return users;
				},
				value: [104]
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_2 = $.sibling($.child(div_2), 2);

	Field(node_2, {
		label: 'Owner',
		position: 'left',
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				get options() {
					return users;
				},
				value: [104]
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Disabled',
		position: 'left',
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				get options() {
					return users;
				},
				disabled: true,
				value: [104]
			});
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		label: 'Error',
		error: true,
		position: 'left',
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				title: 'Invalid option',
				get options() {
					return users;
				},
				error: true,
				value: [104]
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_5 = $.sibling($.child(div_3), 2);

	Field(node_5, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, $$arg0) => {
					let option = () => ($$arg0?.()).option;

					UserOption($$anchor, {
						get data() {
							return option();
						}
					});
				};

				MultiCombo($$anchor, {
					get options() {
						return users;
					},
					value: [104],
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_6 = $.sibling($.child(div_4), 2);

	Field(node_6, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				get options() {
					return users;
				},
				value: [104],
				textField: 'email'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_7 = $.sibling($.child(div_5), 2);

	Field(node_7, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				get options() {
					return users;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_8 = $.sibling($.child(div_6), 2);

	Field(node_8, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_9 = $.sibling($.child(div_7), 2);

	Field(node_9, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			MultiCombo($$anchor, {
				get textOptions() {
					return users;
				},

				get options() {
					return renderedUsers;
				},
				value: [87]
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_10 = $.child(div_8);

	Field(node_10, {
		width: '500px',
		children: ($$anchor, $$slotProps) => {
			var fragment_12 = root();
			var node_11 = $.sibling($.first_child(fragment_12), 2);

			MultiCombo(node_11, {
				keepText: true,
				get options() {
					return users;
				},
				value: [87]
			});

			$.append($$anchor, fragment_12);
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_12 = $.sibling($.child(div_9), 2);

	{
		const children = ($$anchor, $$arg0) => {
			let option = () => ($$arg0?.()).option;

			UserOption($$anchor, {
				get data() {
					return option();
				}
			});
		};

		MultiCombo(node_12, {
			get options() {
				return usersLarge;
			},
			value: [9000],
			dropdown: { virtualized: true },
			children,
			$$slots: { default: true }
		});
	}

	$.reset(div_9);
	$.append($$anchor, fragment);
}