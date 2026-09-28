import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ButtonGroup, Button, GradientButton } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<div class="text-gray-900 dark:text-gray-100"><div class="py-4">Pills</div> <!> <div class="py-4">Standard buttons</div> <!> <div class="py-4">Outline</div> <!> <div class="py-4">Gradient with shadows</div> <!> <div class="py-4">Dualtone gradient</div> <!> <div class="py-4">Dualtone gradient pill</div> <!></div>`);

export default function More($$anchor) {
	var div = root_1();
	var node = $.sibling($.child(div), 2);

	ButtonGroup(node, {
		class: 'space-x-px',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			Button(node_1, {
				pill: true,
				color: 'purple',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Profile');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_2 = $.sibling(node_1, 2);

			Button(node_2, {
				pill: true,
				color: 'purple',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Settings');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_3 = $.sibling(node_2, 2);

			Button(node_3, {
				pill: true,
				color: 'purple',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('Messages');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node, 4);

	ButtonGroup(node_4, {
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node_5 = $.first_child(fragment_1);

			Button(node_5, {
				color: 'red',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_3 = $.text('Profile');

					$.append($$anchor, text_3);
				},
				$$slots: { default: true }
			});

			var node_6 = $.sibling(node_5, 2);

			Button(node_6, {
				color: 'green',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_4 = $.text('Settings');

					$.append($$anchor, text_4);
				},
				$$slots: { default: true }
			});

			var node_7 = $.sibling(node_6, 2);

			Button(node_7, {
				color: 'yellow',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_5 = $.text('Messages');

					$.append($$anchor, text_5);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_8 = $.sibling(node_4, 4);

	ButtonGroup(node_8, {
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root();
			var node_9 = $.first_child(fragment_2);

			Button(node_9, {
				outline: true,
				color: 'red',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_6 = $.text('Profile');

					$.append($$anchor, text_6);
				},
				$$slots: { default: true }
			});

			var node_10 = $.sibling(node_9, 2);

			Button(node_10, {
				outline: true,
				color: 'green',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_7 = $.text('Settings');

					$.append($$anchor, text_7);
				},
				$$slots: { default: true }
			});

			var node_11 = $.sibling(node_10, 2);

			Button(node_11, {
				outline: true,
				color: 'yellow',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_8 = $.text('Messages');

					$.append($$anchor, text_8);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	var node_12 = $.sibling(node_8, 4);

	ButtonGroup(node_12, {
		children: ($$anchor, $$slotProps) => {
			var fragment_3 = root();
			var node_13 = $.first_child(fragment_3);

			GradientButton(node_13, {
				shadow: true,
				color: 'green',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_9 = $.text('Profile');

					$.append($$anchor, text_9);
				},
				$$slots: { default: true }
			});

			var node_14 = $.sibling(node_13, 2);

			GradientButton(node_14, {
				shadow: true,
				color: 'pink',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_10 = $.text('Settings');

					$.append($$anchor, text_10);
				},
				$$slots: { default: true }
			});

			var node_15 = $.sibling(node_14, 2);

			GradientButton(node_15, {
				shadow: true,
				color: 'teal',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_11 = $.text('Messages');

					$.append($$anchor, text_11);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_3);
		},
		$$slots: { default: true }
	});

	var node_16 = $.sibling(node_12, 4);

	ButtonGroup(node_16, {
		class: 'space-x-px',
		children: ($$anchor, $$slotProps) => {
			var fragment_4 = root();
			var node_17 = $.first_child(fragment_4);

			GradientButton(node_17, {
				color: 'purpleToBlue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_12 = $.text('Profile');

					$.append($$anchor, text_12);
				},
				$$slots: { default: true }
			});

			var node_18 = $.sibling(node_17, 2);

			GradientButton(node_18, {
				color: 'cyanToBlue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_13 = $.text('Settings');

					$.append($$anchor, text_13);
				},
				$$slots: { default: true }
			});

			var node_19 = $.sibling(node_18, 2);

			GradientButton(node_19, {
				color: 'greenToBlue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_14 = $.text('Messages');

					$.append($$anchor, text_14);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_4);
		},
		$$slots: { default: true }
	});

	var node_20 = $.sibling(node_16, 4);

	ButtonGroup(node_20, {
		class: 'space-x-px',
		children: ($$anchor, $$slotProps) => {
			var fragment_5 = root();
			var node_21 = $.first_child(fragment_5);

			GradientButton(node_21, {
				pill: true,
				color: 'purpleToBlue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_15 = $.text('Profile');

					$.append($$anchor, text_15);
				},
				$$slots: { default: true }
			});

			var node_22 = $.sibling(node_21, 2);

			GradientButton(node_22, {
				pill: true,
				color: 'cyanToBlue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_16 = $.text('Settings');

					$.append($$anchor, text_16);
				},
				$$slots: { default: true }
			});

			var node_23 = $.sibling(node_22, 2);

			GradientButton(node_23, {
				pill: true,
				color: 'greenToBlue',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_17 = $.text('Messages');

					$.append($$anchor, text_17);
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_5);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, div);
}