import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Tooltip, { Wrapper } from '@smui/tooltip';
import Button from '@smui/button';
import Fab from '@smui/fab';
import Checkbox from '@smui/checkbox';
import Radio from '@smui/radio';
import { Label, Icon } from '@smui/common';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<span tabindex="0" role="button">I'm a span element.</span> <!>`, 1);
var root_2 = $.from_html(`<div style="background-color: var(--mdc-theme-secondary); color: var(--mdc-theme-on-secondary); padding: 10px;" tabindex="0" role="button">I'm a div element.</div> <!>`, 1);
var root_3 = $.from_html(`<div class="container svelte-1asciut" style="display: flex; flex-wrap: wrap; align-items: center;"><!> <!> <!> <!> <!> <!></div> <!> <pre class="status"> </pre>`, 1);

export default function _Simple($$anchor) {
	const binding_group = [];
	let clicked = $.state(0);
	let checked = $.state(false);
	let selected = $.state('on');
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Wrapper(node, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Button(node_1, {
				onclick: () => $.update(clicked),
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

			var node_2 = $.sibling(node_1, 2);

			Tooltip(node_2, {
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Tooltip on a button.');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node, 2);

	Wrapper(node_3, {
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_4 = $.first_child(fragment_4);

			Fab(node_4, {
				onclick: () => $.update(clicked),
				mini: true,
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

			var node_5 = $.sibling(node_4, 2);

			Tooltip(node_5, {
				unbounded: true,
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_3 = $.text('Tooltip on a FAB.');

							$.append($$anchor, text_3);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Wrapper(node_6, {
		children: ($$anchor, $$slotProps) => {
			var fragment_7 = root();
			var node_7 = $.first_child(fragment_7);

			Checkbox(node_7, {
				get checked() {
					return $.get(checked);
				},

				set checked($$value) {
					$.set(checked, $$value, true);
				}
			});

			var node_8 = $.sibling(node_7, 2);

			Tooltip(node_8, {
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_4 = $.text('Tooltip on a checkbox.');

							$.append($$anchor, text_4);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_7);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_6, 2);

	Wrapper(node_9, {
		children: ($$anchor, $$slotProps) => {
			var fragment_9 = root();
			var node_10 = $.first_child(fragment_9);

			Radio(node_10, {
				value: 'on',
				get group() {
					return $.get(selected);
				},

				set group($$value) {
					$.set(selected, $$value, true);
				}
			});

			var node_11 = $.sibling(node_10, 2);

			Tooltip(node_11, {
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_5 = $.text('Tooltip on a radio button.');

							$.append($$anchor, text_5);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_9);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_9, 2);

	Wrapper(node_12, {
		children: ($$anchor, $$slotProps) => {
			var fragment_11 = root();
			var node_13 = $.first_child(fragment_11);

			Radio(node_13, {
				value: 'off',
				get group() {
					return $.get(selected);
				},

				set group($$value) {
					$.set(selected, $$value, true);
				}
			});

			var node_14 = $.sibling(node_13, 2);

			Tooltip(node_14, {
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_6 = $.text('Tooltip on another radio button.');

							$.append($$anchor, text_6);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_11);
		},
		$$slots: { default: true }
	});

	var node_15 = $.sibling(node_12, 2);

	Wrapper(node_15, {
		children: ($$anchor, $$slotProps) => {
			var fragment_13 = root_1();
			var node_16 = $.sibling($.first_child(fragment_13), 2);

			Tooltip(node_16, {
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_7 = $.text('Tooltip on a span.');

							$.append($$anchor, text_7);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_13);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var node_17 = $.sibling(div, 2);

	Wrapper(node_17, {
		children: ($$anchor, $$slotProps) => {
			var fragment_15 = root_2();
			var node_18 = $.sibling($.first_child(fragment_15), 2);

			Tooltip(node_18, {
				children: ($$anchor, $$slotProps) => {
					Label($$anchor, {
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_8 = $.text('Tooltip on a div.');

							$.append($$anchor, text_8);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_15);
		},
		$$slots: { default: true }
	});

	var pre = $.sibling(node_17, 2);
	var text_9 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_9, `Clicked: ${$.get(clicked) ?? ''}, Checked: ${$.get(checked) ?? ''}, Selected: ${$.get(selected) ?? ''}`));
	$.append($$anchor, fragment);
}