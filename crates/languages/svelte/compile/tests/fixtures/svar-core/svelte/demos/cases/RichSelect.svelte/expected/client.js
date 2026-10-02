import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, RichSelect } from "../../src/index";
import { users, usersLarge } from "../data/userlist";
import UserOption from "../custom/UserOption.svelte";

var root = $.from_html(`<!> <br/> <!>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><h3>RichSelect with a simple list</h3> <!></div> <div class="demo-box"><h3>RichSelect with a side label</h3> <!> <!> <!></div> <div class="demo-box"><h3>RichSelect overflow</h3> <!></div> <div class="demo-box"><h3>RichSelect with a template</h3> <!></div> <div class="demo-box"><h3>RichSelect with a custom "textField"</h3> <!></div> <div class="demo-box"><h3>RichSelect without a value</h3> <!></div> <div class="demo-box"><h3>RichSelect without options</h3> <!></div> <div class="demo-box"><h3>RichSelect with clear button</h3> <!></div> <div class="demo-box"><h3>RichSelect with hidden options</h3> <!></div> <div class="demo-box"><h3>Perfomance on a large list</h3> <!></div>`, 1);

export default function RichSelect_1($$anchor) {
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
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
				get options() {
					return users;
				},
				value: 104
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_1 = $.sibling($.child(div_1), 2);

	Field(node_1, {
		label: 'Owner',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
				get options() {
					return users;
				},
				value: 104
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Field(node_2, {
		label: 'Disabled',
		position: 'left',
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
				get options() {
					return users;
				},
				disabled: true,
				value: 104
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Field(node_3, {
		label: 'Error',
		position: 'left',
		error: true,
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
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

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.sibling($.child(div_2), 2);

	Field(node_4, {
		width: '150px',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_5 = $.first_child(fragment_5);

			RichSelect(node_5, {
				get options() {
					return users;
				},
				value: 105
			});

			var node_6 = $.sibling(node_5, 4);

			{
				const children = ($$anchor, option = $.noop) => {
					$.next();

					var text = $.text();

					$.template_effect(() => $.set_text(text, option().label));
					$.append($$anchor, text);
				};

				RichSelect(node_6, {
					get options() {
						return users;
					},
					value: 105,
					children,
					$$slots: { default: true }
				});
			}

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_7 = $.sibling($.child(div_3), 2);

	Field(node_7, {
		children: ($$anchor, $$slotProps) => {
			{
				const children = ($$anchor, option = $.noop) => {
					UserOption($$anchor, {
						get data() {
							return option();
						}
					});
				};

				RichSelect($$anchor, {
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
	var node_8 = $.sibling($.child(div_4), 2);

	Field(node_8, {
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
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
	var node_9 = $.sibling($.child(div_5), 2);

	Field(node_9, {
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
				get options() {
					return users;
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_10 = $.sibling($.child(div_6), 2);

	Field(node_10, {
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {});
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_11 = $.sibling($.child(div_7), 2);

	Field(node_11, {
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
				get options() {
					return users;
				},
				value: 104,
				clear: true
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var div_8 = $.sibling(div_7, 2);
	var node_12 = $.sibling($.child(div_8), 2);

	Field(node_12, {
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
				get textOptions() {
					return users;
				},

				get options() {
					return renderedUsers;
				},
				value: 87
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_8);

	var div_9 = $.sibling(div_8, 2);
	var node_13 = $.sibling($.child(div_9), 2);

	Field(node_13, {
		children: ($$anchor, $$slotProps) => {
			RichSelect($$anchor, {
				get options() {
					return usersLarge;
				},
				value: 1000,
				dropdown: { virtualized: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_9);
	$.append($$anchor, fragment);
}