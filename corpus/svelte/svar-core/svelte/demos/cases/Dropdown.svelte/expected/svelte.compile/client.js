import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Field, Dropdown, Calendar, RadioButtonGroup, Button } from "../../src/index";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div class="demo-box"><div class="label svelte-7yu0ai">Select dropdown position</div> <!> <div class="label svelte-7yu0ai">Select dropdown align</div> <!> <div class="dropdown-box svelte-7yu0ai"><!></div></div>`);

export default function Dropdown_1($$anchor, $$props) {
	$.push($$props, true);

	const positions = ["bottom", "top", "left", "right"].map((id) => ({ id, label: id }));
	const alignOptions = ["start", "center", "end"].map((id) => ({ id, label: id }));
	let popup = $.state(void 0);
	let position = $.state("bottom");
	let align = $.state("start");
	var div = root_1();
	var node = $.sibling($.child(div), 2);

	RadioButtonGroup(node, {
		get options() {
			return positions;
		},
		type: 'inline',
		get value() {
			return $.get(position);
		},

		set value($$value) {
			$.set(position, $$value, true);
		}
	});

	var node_1 = $.sibling(node, 4);

	RadioButtonGroup(node_1, {
		get options() {
			return alignOptions;
		},
		type: 'inline',
		get value() {
			return $.get(align);
		},

		set value($$value) {
			$.set(align, $$value, true);
		}
	});

	var div_1 = $.sibling(node_1, 2);
	var node_2 = $.child(div_1);

	Field(node_2, {
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_3 = $.first_child(fragment);

			Button(node_3, {
				css: 'my-button',
				onclick: () => $.set(popup, true),
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Click to show a dropdown');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			{
				var consequent = ($$anchor) => {
					Dropdown($$anchor, {
						width: '300px',
						get position() {
							return $.get(position);
						},

						get align() {
							return $.get(align);
						},
						oncancel: () => $.set(popup, false),
						css: 'my-dropdown',
						children: ($$anchor, $$slotProps) => {
							Calendar($$anchor, {});
						},
						$$slots: { default: true }
					});
				};

				$.if(node_4, ($$render) => {
					if ($.get(popup)) $$render(consequent);
				});
			}

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);
	$.reset(div);
	$.append($$anchor, div);
	$.pop();
}