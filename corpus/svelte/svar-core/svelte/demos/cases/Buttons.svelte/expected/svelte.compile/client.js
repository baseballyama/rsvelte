import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`Click me<br/>a few times`, 1);
var root_1 = $.from_html(`<div class="demo-box"><h3>Default button</h3> <!> <!></div> <div class="demo-box"><h3>Primary button</h3> <!> <!></div> <div class="demo-box"><h3>Secondary button</h3> <!> <!></div> <div class="demo-box"><h3>Danger button</h3> <!> <!></div> <div class="demo-box"><h3>Link button</h3> <p><!></p> <p><!></p> <p><!></p></div> <div class="demo-box"><h3>Block buttons</h3> <p><!></p> <p><!></p> <div style="display:flex;"><!> &nbsp; <!></div></div> <div class="demo-box"><h3>Icon buttons</h3> <div class="demo-row"><!> <!> <!> <!> <!> <!> <!> <!></div></div> <div class="demo-box"><h3>Multi-line button</h3> <p><!></p></div>`, 1);

export default function Buttons($$anchor, $$props) {
	$.push($$props, true);

	const { showNotice } = getContext("wx-helpers");

	function onclick() {
		showNotice({ text: "Button clicked" });
	}

	var fragment = root_1();
	var div = $.first_child(fragment);
	var node = $.sibling($.child(div), 2);

	Button(node, {
		onclick,
		title: 'Click me and I will do nothing',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Click Me');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		disabled: true,
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Click Me');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_2 = $.sibling($.child(div_1), 2);

	Button(node_2, {
		type: 'primary',
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Click Me');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Button(node_3, {
		type: 'primary',
		disabled: true,
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Click Me');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_4 = $.sibling($.child(div_2), 2);

	Button(node_4, {
		type: 'secondary',
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Click Me');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	Button(node_5, {
		type: 'secondary',
		disabled: true,
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Click Me');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_6 = $.sibling($.child(div_3), 2);

	Button(node_6, {
		type: 'danger',
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_6 = $.text('Click Me');

			$.append($$anchor, text_6);
		},
		$$slots: { default: true }
	});

	var node_7 = $.sibling(node_6, 2);

	Button(node_7, {
		type: 'danger',
		disabled: true,
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Click Me');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var p = $.sibling($.child(div_4), 2);
	var node_8 = $.child(p);

	Button(node_8, {
		type: 'link',
		icon: 'wxi-alert',
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('Click Me');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var node_9 = $.child(p_1);

	Button(node_9, {
		type: 'link',
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('Click Me');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	$.reset(p_1);

	var p_2 = $.sibling(p_1, 2);
	var node_10 = $.child(p_2);

	Button(node_10, {
		type: 'link',
		disabled: true,
		onclick,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Click Me');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	$.reset(p_2);
	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var p_3 = $.sibling($.child(div_5), 2);
	var node_11 = $.child(p_3);

	Button(node_11, {
		type: 'primary block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Click Me');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	$.reset(p_3);

	var p_4 = $.sibling(p_3, 2);
	var node_12 = $.child(p_4);

	Button(node_12, {
		type: 'secondary block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Click Me');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	$.reset(p_4);

	var div_6 = $.sibling(p_4, 2);
	var node_13 = $.child(div_6);

	Button(node_13, {
		type: 'secondary block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('Click Me');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	Button(node_14, {
		type: 'primary block',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Click Me');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);
	$.reset(div_5);

	var div_7 = $.sibling(div_5, 2);
	var div_8 = $.sibling($.child(div_7), 2);
	var node_15 = $.child(div_8);

	Button(node_15, {
		icon: 'wxi-alert',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_15 = $.text('With Icon');

			$.append($$anchor, text_15);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_15, 2);

	Button(node_16, {
		type: 'primary',
		icon: 'wxi-alert',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_16 = $.text('With Icon');

			$.append($$anchor, text_16);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	Button(node_17, {
		type: 'secondary',
		icon: 'wxi-alert',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_17 = $.text('With Icon');

			$.append($$anchor, text_17);
		},
		$$slots: { default: true }
	});

	var node_18 = $.sibling(node_17, 2);

	Button(node_18, { icon: 'wxi-alert' });

	var node_19 = $.sibling(node_18, 2);

	Button(node_19, { type: 'primary', icon: 'wxi-alert' });

	var node_20 = $.sibling(node_19, 2);

	Button(node_20, { type: 'secondary', icon: 'wxi-alert' });

	var node_21 = $.sibling(node_20, 2);

	Button(node_21, { type: 'danger', icon: 'wxi-alert' });

	var node_22 = $.sibling(node_21, 2);

	Button(node_22, { disabled: true, icon: 'wxi-alert' });
	$.reset(div_8);
	$.reset(div_7);

	var div_9 = $.sibling(div_7, 2);
	var p_5 = $.sibling($.child(div_9), 2);
	var node_23 = $.child(p_5);

	Button(node_23, {
		type: 'primary',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var fragment_1 = root();

			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(p_5);
	$.reset(div_9);
	$.append($$anchor, fragment);
	$.pop();
}