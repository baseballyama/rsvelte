import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import IconButton, { Icon } from '@smui/icon-button';
import Button, { Label } from '@smui/button';

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<div style="display: flex; align-items: center;"><!></div> <div style="display: flex; align-items: center;"><!> &nbsp; <!></div> <div style="display: flex; align-items: center;"><!>&nbsp;Using events instead of bound variables.</div> <pre class="status"> </pre>`, 1);

export default function _Toggle($$anchor) {
	let toggleClicked = $.state(0);
	let initialOff = $.state(false);
	let initialOn = $.state(true);
	let usingEvents = $.state(false);
	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.child(div);

	IconButton(node, {
		onclick: () => $.update(toggleClicked),
		toggle: true,
		get pressed() {
			return $.get(initialOff);
		},

		set pressed($$value) {
			$.set(initialOff, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_1 = $.first_child(fragment_1);

			Icon(node_1, {
				class: 'material-icons',
				on: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('star');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Icon(node_2, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('star_border');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.child(div_1);

	IconButton(node_3, {
		onclick: () => $.update(toggleClicked),
		toggle: true,
		get pressed() {
			return $.get(initialOn);
		},

		set pressed($$value) {
			$.set(initialOn, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_4 = $.first_child(fragment_2);

			Icon(node_4, {
				class: 'material-icons',
				on: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('alarm_on');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			var node_5 = $.sibling(node_4, 2);

			Icon(node_5, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('alarm_off');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_6 = $.sibling(node_3, 2);

	Button(node_6, {
		onclick: () => $.set(initialOn, !$.get(initialOn)),
		children: ($$anchor, $$slotProps) => {
			Label($$anchor, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Toggle Programmatically');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_7 = $.child(div_2);

	IconButton(node_7, {
		onclick: () => {
			$.update(toggleClicked);
			$.set(usingEvents, !$.get(usingEvents));
		},

		get pressed() {
			return $.get(usingEvents);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_8 = $.first_child(fragment_4);

			Icon(node_8, {
				class: 'material-icons',
				on: true,
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('bookmark');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_9 = $.sibling(node_8, 2);

			Icon(node_9, {
				class: 'material-icons',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('bookmark_border');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.next();
	$.reset(div_2);

	var pre = $.sibling(div_2, 2);
	var text_7 = $.only_child(pre);

	$.template_effect(() => $.set_text(text_7, `Clicked: ${$.get(toggleClicked) ?? ''}`));
	$.append($$anchor, fragment);
}