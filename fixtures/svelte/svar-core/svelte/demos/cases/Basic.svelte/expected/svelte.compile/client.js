import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Segmented, Calendar } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`<div class="demo-box"><h3>Buttons</h3> <!> <!> <!></div> <div class="demo-box"><h3>Segmented</h3> <!></div> <div class="demo-box"><h3>Calendar</h3> <div style="width: 280px;"><!></div></div>`, 1);

export default function Basic($$anchor, $$props) {
	$.push($$props, true);

	const { showNotice } = getContext("wx-helpers");

	function onclick() {
		showNotice({ text: "Button clicked" });
	}

	var fragment = root();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Button(node, {
		onclick,
		type: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Primary');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		onclick,
		type: 'secondary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Secondary');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick,
		type: 'danger',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Danger');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_3 = $.sibling($.child(div_1), 2);

	Segmented(node_3, {
		value: '2',
		options: [
			{ id: "1", label: "One" },
			{ id: "2", label: "Two" },
			{ id: "3", label: "Three" }
		]
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var div_3 = $.sibling($.child(div_2), 2);
	var node_4 = $.child(div_3);

	Calendar(node_4, { value: new Date(2025, 4, 1) });
	$.reset(div_3);
	$.reset(div_2);
	$.append($$anchor, fragment);
	$.pop();
}