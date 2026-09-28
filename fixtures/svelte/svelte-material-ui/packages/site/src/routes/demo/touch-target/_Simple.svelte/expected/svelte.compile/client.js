import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Wrapper from '@smui/touch-target';
import Button from '@smui/button';
import IconButton from '@smui/icon-button';
import Fab from '@smui/fab';
import Chip, { ChipSet, Text } from '@smui/chips';
import Checkbox from '@smui/checkbox';
import Radio from '@smui/radio';
import Switch from '@smui/switch';
import { Label, Icon } from '@smui/common';

var root = $.from_html(`<div style="display: flex; flex-wrap: wrap; align-items: center;"><!> <!> <!> <!> <!> <!> <!> <!></div> <pre class="status"> </pre>`, 1);

export default function _Simple($$anchor) {
	const binding_group = [];
	let clicked = $.state(0);
	let checked = $.state(false);
	let selected = $.state('on');
	let switchChecked = $.state(false);
	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Wrapper(node, {
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				onclick: () => $.update(clicked),
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Button');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Wrapper(node_1, {
		children: ($$anchor, $$slotProps) => {
			IconButton($$anchor, {
				onclick: () => $.update(clicked),
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('favorite');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Wrapper(node_2, {
		children: ($$anchor, $$slotProps) => {
			Fab($$anchor, {
				onclick: () => $.update(clicked),
				mini: true,
				touch: true,
				children: ($$anchor, $$slotProps) => {
					Icon($$anchor, {
						class: 'material-icons',
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('favorite');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Wrapper(node_3, {
		children: ($$anchor, $$slotProps) => {
			{
				const chip = ($$anchor, chip = $.noop) => {
					Chip($$anchor, {
						get chip() {
							return chip();
						},
						onclick: () => $.update(clicked),
						touch: true,
						children: ($$anchor, $$slotProps) => {
							Text($$anchor, {
								tabindex: 0,
								children: ($$anchor, $$slotProps) => {
									$.next();

									var text_3 = $.text();

									$.template_effect(() => $.set_text(text_3, chip()));
									$.append($$anchor, text_3);
								},
								$$slots: { default: true }
							});
						},
						$$slots: { default: true }
					});
				};

				ChipSet($$anchor, {
					chips: ['Chip'],
					style: 'display: inline-flex;',
					chip,
					$$slots: { chip: true }
				});
			}
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_3, 2);

	Wrapper(node_4, {
		children: ($$anchor, $$slotProps) => {
			Checkbox($$anchor, {
				touch: true,
				get checked() {
					return $.get(checked);
				},

				set checked($$value) {
					$.set(checked, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Wrapper(node_5, {
		children: ($$anchor, $$slotProps) => {
			Radio($$anchor, {
				value: 'on',
				touch: true,
				get group() {
					return $.get(selected);
				},

				set group($$value) {
					$.set(selected, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_5, 2);

	Wrapper(node_6, {
		children: ($$anchor, $$slotProps) => {
			Radio($$anchor, {
				value: 'off',
				touch: true,
				get group() {
					return $.get(selected);
				},

				set group($$value) {
					$.set(selected, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Wrapper(node_7, {
		children: ($$anchor, $$slotProps) => {
			Switch($$anchor, {
				get checked() {
					return $.get(switchChecked);
				},

				set checked($$value) {
					$.set(switchChecked, $$value, true);
				}
			});
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var pre = $.sibling(div, 2);
	var text_4 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_4, `Clicked: ${$.get(clicked) ?? ''}, Checked: ${$.get(checked) ?? ''}, Selected: ${$.get(selected) ?? ''}, Switched: ${$.get(switchChecked) ?? ''}`));
	$.append($$anchor, fragment);
}