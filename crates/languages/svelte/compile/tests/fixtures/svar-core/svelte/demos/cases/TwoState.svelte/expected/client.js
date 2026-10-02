import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TwoState } from "../../src/index";
import { getContext } from "svelte";

var root = $.from_html(`<span slot="active">Working...</span>`);
var root_1 = $.from_html(`<div class="demo-box"><h3>Default TwoState Button</h3> <!> <!></div> <div class="demo-box"><h3>Primary TwoState Button</h3> <!> <!></div> <div class="demo-box"><h3>Secondary TwoState Button</h3> <!> <!></div> <div class="demo-box"><h3>Danger TwoState Button</h3> <!> <!></div> <div class="demo-box"><h3>Icon TwoState Buttons</h3> <div class="demo-row"><!> <!> <!> <!> <!> <!> <!> <!></div></div> <div class="demo-box"><h3>Disabled</h3> <p><!> <!></p> <p><!> <!></p></div>`, 1);

export default function TwoState_1($$anchor, $$props) {
	$.push($$props, true);

	const { showNotice } = getContext("wx-helpers");

	function onclick() {
		showNotice({ text: "TwoState clicked" });
	}

	var fragment = root_1();
	var div = $.first_child(fragment);

	{
		const active = ($$anchor) => {
			var span = root();

			$.append($$anchor, span);
		};

		var node = $.sibling($.child(div), 2);

		TwoState(node, {
			onclick,
			get active() {
				return active;
			},

			children: ($$anchor, $$slotProps) => {
				$.next();

				var text = $.text('Click Me');

				$.append($$anchor, text);
			},
			$$slots: { default: true }
		});

		var node_1 = $.sibling(node, 2);

		TwoState(node_1, {
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
	}

	var div_1 = $.sibling(div, 2);
	var node_2 = $.sibling($.child(div_1), 2);

	TwoState(node_2, {
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

	TwoState(node_3, {
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

	TwoState(node_4, {
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

	TwoState(node_5, {
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

	TwoState(node_6, {
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

	TwoState(node_7, {
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
	var div_5 = $.sibling($.child(div_4), 2);
	var node_8 = $.child(div_5);

	TwoState(node_8, {
		icon: 'wxi-alert',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_8 = $.text('With Icon');

			$.append($$anchor, text_8);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	TwoState(node_9, {
		type: 'primary',
		icon: 'wxi-alert',
		iconActive: 'wxi-check',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_9 = $.text('With Icon');

			$.append($$anchor, text_9);
		},
		$$slots: { default: true }
	});

	var node_10 = $.sibling(node_9, 2);

	TwoState(node_10, {
		type: 'secondary',
		icon: 'wxi-alert',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('With Icon');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_11 = $.sibling(node_10, 2);

	TwoState(node_11, { icon: 'wxi-alert' });

	var node_12 = $.sibling(node_11, 2);

	TwoState(node_12, { type: 'primary', icon: 'wxi-alert' });

	var node_13 = $.sibling(node_12, 2);

	TwoState(node_13, { type: 'secondary', icon: 'wxi-alert' });

	var node_14 = $.sibling(node_13, 2);

	TwoState(node_14, { type: 'danger', icon: 'wxi-alert' });

	var node_15 = $.sibling(node_14, 2);

	TwoState(node_15, { disabled: true, icon: 'wxi-alert' });
	$.reset(div_5);
	$.reset(div_4);

	var div_6 = $.sibling(div_4, 2);
	var p = $.sibling($.child(div_6), 2);
	var node_16 = $.child(p);

	TwoState(node_16, {
		type: 'primary',
		value: true,
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_11 = $.text('Primary On');

			$.append($$anchor, text_11);
		},
		$$slots: { default: true }
	});

	var node_17 = $.sibling(node_16, 2);

	TwoState(node_17, {
		type: 'primary',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_12 = $.text('Primary Off');

			$.append($$anchor, text_12);
		},
		$$slots: { default: true }
	});

	$.reset(p);

	var p_1 = $.sibling(p, 2);
	var node_18 = $.child(p_1);

	TwoState(node_18, {
		title: 'disabled button',
		type: 'secondary',
		value: true,
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_13 = $.text('Secondary On');

			$.append($$anchor, text_13);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	TwoState(node_19, {
		type: 'secondary',
		disabled: true,
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_14 = $.text('Secondary Off');

			$.append($$anchor, text_14);
		},
		$$slots: { default: true }
	});

	$.reset(p_1);
	$.reset(div_6);
	$.append($$anchor, fragment);
	$.pop();
}