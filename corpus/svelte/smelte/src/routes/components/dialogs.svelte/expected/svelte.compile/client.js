import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Button from "components/Button";
import Dialog from "components/Dialog";
import Code from "docs/Code.svelte";
import dialog from "examples/dialog.txt";

var root = $.from_html(`<div class="text-gray-700 dark:text-gray-100">I'm not sure about today's weather.</div>`);
var root_1 = $.from_html(`<h5 slot="title">What do you think?</h5>`);
var root_2 = $.from_html(`<div slot="actions"><!> <!></div>`);
var root_3 = $.from_html(`<div class="text-gray-700 dark:text-gray-100">Doubt it.</div>`);
var root_4 = $.from_html(`<h5 slot="title">Do you think you can close me by clicking outside?</h5>`);
var root_5 = $.from_html(`<!> <!> <div class="py-2"><!></div> <div class="py-2"><!></div> <!>`, 1);

export default function Dialogs($$anchor) {
	let showDialog = false;
	let showDialog2 = false;
	var fragment = root_5();
	var node = $.first_child(fragment);

	Dialog(node, {
		get value() {
			return showDialog;
		},

		set value($$value) {
			showDialog = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var h5 = root_1();

				$.append($$anchor, h5);
			},

			actions: ($$anchor, $$slotProps) => {
				var div_1 = root_2();
				var node_1 = $.child(div_1);

				Button(node_1, {
					text: true,
					$$events: { click: () => showDialog = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Disagree');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				var node_2 = $.sibling(node_1, 2);

				Button(node_2, {
					text: true,
					$$events: { click: () => showDialog = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_1 = $.text('Agree');

						$.append($$anchor, text_1);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			}
		}
	});

	var node_3 = $.sibling(node, 2);

	Dialog(node_3, {
		persistent: true,
		get value() {
			return showDialog2;
		},

		set value($$value) {
			showDialog2 = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var div_2 = root_3();

			$.append($$anchor, div_2);
		},

		$$slots: {
			default: true,
			title: ($$anchor, $$slotProps) => {
				var h5_1 = root_4();

				$.append($$anchor, h5_1);
			},

			actions: ($$anchor, $$slotProps) => {
				var div_3 = root_2();
				var node_4 = $.child(div_3);

				Button(node_4, {
					text: true,
					$$events: { click: () => showDialog2 = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_2 = $.text('Yes');

						$.append($$anchor, text_2);
					},
					$$slots: { default: true }
				});

				var node_5 = $.sibling(node_4, 2);

				Button(node_5, {
					text: true,
					$$events: { click: () => showDialog2 = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text_3 = $.text('No');

						$.append($$anchor, text_3);
					},
					$$slots: { default: true }
				});

				$.reset(div_3);
				$.append($$anchor, div_3);
			}
		}
	});

	var div_4 = $.sibling(node_3, 2);
	var node_6 = $.child(div_4);

	Button(node_6, {
		$$events: { click: () => showDialog = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_4 = $.text('Show dialog');

			$.append($$anchor, text_4);
		},
		$$slots: { default: true }
	});

	$.reset(div_4);

	var div_5 = $.sibling(div_4, 2);
	var node_7 = $.child(div_5);

	Button(node_7, {
		color: 'secondary',
		$$events: { click: () => showDialog2 = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_5 = $.text('Show persistent dialog');

			$.append($$anchor, text_5);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var node_8 = $.sibling(div_5, 2);

	Code(node_8, {
		get code() {
			return dialog;
		}
	});

	$.append($$anchor, fragment);
}