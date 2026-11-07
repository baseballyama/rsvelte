import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Combo, Button } from "../../src/index";
import { users, usersLarge } from "../data/userlist";
import UserOption from "../custom/UserOption.svelte";

var root = $.from_html(`<div class="demo-box"><h3>Combo with a simple list</h3> <!> <!> <!></div> <div class="demo-box"><h3>Combo with a dynamic value</h3> <!> <!></div> <div class="demo-box"><h3>Combo with a side label</h3> <!></div> <div class="demo-box"><h3>Combo with a template</h3> <!></div> <div class="demo-box"><h3>Combo with a custom "textField"</h3> <!></div> <div class="demo-box"><h3>Combo without a value</h3> <!></div> <div class="demo-box"><h3>Combo with a value that's not in options</h3> <!></div> <div class="demo-box"><h3>Combo without options</h3> <!></div> <div class="demo-box"><h3>Combo with clear button</h3> <!></div> <div class="demo-box"><h3>Combo with hidden options</h3> <!></div> <div class="demo-box"><h3>Perfomance on a large list</h3> <!> <h3>Combo with ids: '0', '000', '0E1'</h3> <!></div>`, 1);

export default function Combo_1($$anchor, $$props) {
	$.push($$props, true);

	let value = $.state("");
	const values = [104, 103, 102, ""];

	function changeValue() {
		$.set(value, values[(values.indexOf($.get(value)) + 1) % values.length], true);
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

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Field(node, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},
				value: 104
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Field(node_1, {
		label: 'Disabled',
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},
				disabled: true,
				value: 104
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Error',
		error: true,
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},
				error: true,
				value: 104,
				title: 'Invalid option'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.sibling($.child(div_1), 2);

	Button(node_3, {
		onclick: changeValue,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Change the value');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Field(node_4, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},

				get value() {
					return $.get(value);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_5 = $.sibling($.child(div_2), 2);

	Field(node_5, {
		label: 'Owner',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},
				value: 104
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.sibling($.child(div_3), 2);

	Field(node_6, {
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

				Combo($$anchor, {
					get options() {
						return users;
					},
					value: 104,
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_7 = $.sibling($.child(div_4), 2);

	Field(node_7, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},
				value: 104,
				textField: 'email'
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_8 = $.sibling($.child(div_5), 2);

	Field(node_8, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_9 = $.sibling($.child(div_6), 2);

	Field(node_9, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},
				value: 4
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_10 = $.sibling($.child(div_7), 2);

	Field(node_10, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_11 = $.sibling($.child(div_8), 2);

	Field(node_11, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get options() {
					return users;
				},
				value: 104,
				clear: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_12 = $.sibling($.child(div_9), 2);

	Field(node_12, {
		children: ($$anchor, $$slotProps) => {
			Combo($$anchor, {
				get textOptions() {
					return users;
				},

				get options() {
					return renderedUsers;
				},
				value: 87,
				clearButton: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_9);

	var div_10 = $.sibling(div_9, 2);
	var node_13 = $.sibling($.child(div_10), 2);

	Field(node_13, {
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

				Combo($$anchor, {
					get options() {
						return usersLarge;
					},
					value: 9000,
					dropdown: { virtualized: true },
					children,
					$$slots: { default: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 4);

	Field(node_14, {
		children: ($$anchor, $$slotProps) => {
			{
				let $0 = $.derived(() => ["0", "000", "0E1"].map((id) => ({ id, label: `"${id}" option` })));

				Combo($$anchor, {
					get options() {
						return $.get($0);
					}
				});
			}
		},
		$$slots: { default: true }
	});

	$.reset(div_10);
	$.append($$anchor, fragment);
	$.pop();
}