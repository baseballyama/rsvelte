import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Label, Input, Button, InputAddon, ButtonGroup, Checkbox } from "flowbite-svelte";

var root = $.from_html(`<!> <!>`, 1);
var root_1 = $.from_html(`<!> <!> <!>`, 1);
var root_2 = $.from_html(`<!> <!> <!> <!> <!> <!> <!> <!>`, 1);
var root_3 = $.from_html(`<div><!> <!></div> <div><!> <!></div> <div><!> <!></div> <div class="pt-8"><!> <!></div> <div><!> <!></div>`, 1);

export default function Group($$anchor) {
	var fragment = root_3();
	var div = $.first_child(fragment);
	var node = $.child(div);

	Label(node, {
		class: 'mb-2',
		for: 'input-addon-sm',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Small additional text');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ButtonGroup(node_1, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_2 = $.first_child(fragment_1);

			InputAddon(node_2, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('@');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Input(node_3, {
				id: 'input-addon-sm',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);

	var div_1 = $.sibling(div, 2);
	var node_4 = $.child(div_1);

	Label(node_4, {
		class: 'mb-2',
		for: 'input-addon-md',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Default additional text');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	var node_5 = $.sibling(node_4, 2);

	ButtonGroup(node_5, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_6 = $.first_child(fragment_2);

			Input(node_6, {
				id: 'input-addon-md',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			var node_7 = $.sibling(node_6, 2);

			InputAddon(node_7, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('.com');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_1);

	var div_2 = $.sibling(div_1, 2);
	var node_8 = $.child(div_2);

	Label(node_8, {
		class: 'mb-2',
		for: 'input-addon-lg',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Large additional text');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	var node_9 = $.sibling(node_8, 2);

	ButtonGroup(node_9, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root_1();
			var node_10 = $.first_child(fragment_3);

			InputAddon(node_10, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('@');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Input(node_11, {
				id: 'input-addon-lg',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			var node_12 = $.sibling(node_11, 2);

			InputAddon(node_12, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('.com');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_2);

	var div_3 = $.sibling(div_2, 2);
	var node_13 = $.child(div_3);

	Label(node_13, {
		for: 'input-addon-button',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_7 = $.text('Grouped with button');

			$.append($$anchor, text_7);
		},
		$$slots: { default: true }
	});

	var node_14 = $.sibling(node_13, 2);

	ButtonGroup(node_14, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root_1();
			var node_15 = $.first_child(fragment_4);

			InputAddon(node_15, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('@');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			var node_16 = $.sibling(node_15, 2);

			Input(node_16, {
				id: 'input-addon-button',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			var node_17 = $.sibling(node_16, 2);

			Button(node_17, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Search');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_3);

	var div_4 = $.sibling(div_3, 2);
	var node_18 = $.child(div_4);

	Label(node_18, {
		for: 'input-addon-crazy',
		class: 'mb-2',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_10 = $.text('Crazy example');

			$.append($$anchor, text_10);
		},
		$$slots: { default: true }
	});

	var node_19 = $.sibling(node_18, 2);

	ButtonGroup(node_19, {
		class: 'w-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root_2();
			var node_20 = $.first_child(fragment_5);

			InputAddon(node_20, {
				children: ($$anchor, $$slotProps) => {
					Checkbox($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_21 = $.sibling(node_20, 2);

			Button(node_21, {
				color: 'primary',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Search');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			InputAddon(node_22, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('http://');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			Input(node_23, {
				id: 'input-addon-crazy',
				type: 'email',
				placeholder: 'john.doe@mail.com'
			});

			var node_24 = $.sibling(node_23, 2);

			InputAddon(node_24, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('@');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_25 = $.sibling(node_24, 2);

			InputAddon(node_25, {
				children: ($$anchor, $$slotProps) => {
					Checkbox($$anchor, {});
				},
				$$slots: { default: true }
			});

			var node_26 = $.sibling(node_25, 2);

			Button(node_26, {
				color: 'blue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Send');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			var node_27 = $.sibling(node_26, 2);

			InputAddon(node_27, {
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('kg');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);
	$.append($$anchor, fragment);
}