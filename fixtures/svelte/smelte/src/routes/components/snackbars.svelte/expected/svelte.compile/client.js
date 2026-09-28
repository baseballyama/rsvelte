import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import Snackbar, { notifier, Notifications } from "components/Snackbar";
import Button from "components/Button";
import TextField from "components/TextField";
import Code from "docs/Code.svelte";
import snackbars from "examples/snackbars.txt";

var root = $.from_html(`<div>Have a nice day.</div>`);
var root_1 = $.from_html(`<div slot="action"><!></div>`);
var root_2 = $.from_html(`<div>Something happened!</div>`);
var root_3 = $.from_html(`<div slot="action"></div>`);
var root_4 = $.from_html(`<blockquote class="pl-8 mt-2 mb-10 border-l-8 border-primary-300 text-lg" cite="https://material.io/components/snackbars/#usage"><p>Snackbars inform users of a process that an app has performed or will perform. They appear temporarily, towards the bottom of the screen. They shouldn’t interrupt the user experience, and they don’t require user input to disappear.</p> <h6 class="mt-8">Frequency</h6> <p>Only one snackbar may be displayed at a time.</p> <h6 class="mt-8">Actions</h6> <p>A snackbar can contain a single action. Because they disappear automatically, the action shouldn’t be “Dismiss” or “Cancel.”</p></blockquote> <!> <!> <!> <div class="py-2"><!></div> <div class="py-2"><!></div> <div class="py-2"><!></div> <p class="mt-10">Also Smelte comes with a simple notification queue implementation.</p> <!> <!> <!> <!> <!> <!>`, 1);

export default function Snackbars($$anchor, $$props) {
	$.push($$props, true);

	let showSnackbar = false;
	let showSnackbarTop = false;
	let showSnackbarBottomLeft = false;

	function notify() {
		notifier.notify(message);
		message = "";
	}

	function alert() {
		notifier.alert(message);
		message = "";
	}

	function error() {
		notifier.error(message);
		message = "";
	}

	let message = "";
	var fragment = root_4();
	var node = $.sibling($.first_child(fragment), 2);

	Snackbar(node, {
		get value() {
			return showSnackbar;
		},

		set value($$value) {
			showSnackbar = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},

		$$slots: {
			default: true,
			action: ($$anchor, $$slotProps) => {
				var div_1 = root_1();
				var node_1 = $.child(div_1);

				Button(node_1, {
					text: true,
					$$events: { click: () => showSnackbar = false },
					children: ($$anchor, $$slotProps) => {
						$.next();

						var text = $.text('Do something');

						$.append($$anchor, text);
					},
					$$slots: { default: true }
				});

				$.reset(div_1);
				$.append($$anchor, div_1);
			}
		}
	});

	var node_2 = $.sibling(node, 2);

	Snackbar(node_2, {
		color: 'alert',
		top: true,
		get value() {
			return showSnackbarTop;
		},

		set value($$value) {
			showSnackbarTop = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var div_2 = root();

			$.append($$anchor, div_2);
		},
		$$slots: { default: true }
	});

	var node_3 = $.sibling(node_2, 2);

	Snackbar(node_3, {
		noAction: true,
		color: 'error',
		timeout: 2000,
		left: true,
		get value() {
			return showSnackbarBottomLeft;
		},

		set value($$value) {
			showSnackbarBottomLeft = $$value;
		},

		children: ($$anchor, $$slotProps) => {
			var div_3 = root_2();

			$.append($$anchor, div_3);
		},

		$$slots: {
			default: true,
			action: ($$anchor, $$slotProps) => {
				var div_4 = root_3();

				$.append($$anchor, div_4);
			}
		}
	});

	var div_5 = $.sibling(node_3, 2);
	var node_4 = $.child(div_5);

	Button(node_4, {
		$$events: { click: () => showSnackbar = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Show snackbar');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div_5);

	var div_6 = $.sibling(div_5, 2);
	var node_5 = $.child(div_6);

	Button(node_5, {
		color: 'secondary',
		$$events: { click: () => showSnackbarTop = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_2 = $.text('Show snackbar on top');

			$.append($$anchor, text_2);
		},
		$$slots: { default: true }
	});

	$.reset(div_6);

	var div_7 = $.sibling(div_6, 2);
	var node_6 = $.child(div_7);

	Button(node_6, {
		color: 'alert',
		$$events: { click: () => showSnackbarBottomLeft = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_3 = $.text('Show snackbar on the bottom left');

			$.append($$anchor, text_3);
		},
		$$slots: { default: true }
	});

	$.reset(div_7);

	var node_7 = $.sibling(div_7, 4);

	TextField(node_7, {
		label: 'Message text',
		get value() {
			return message;
		},

		set value($$value) {
			message = $$value;
		}
	});

	var node_8 = $.sibling(node_7, 2);

	{
		let $0 = $.derived(() => !message);

		Button(node_8, {
			get disabled() {
				return $.get($0);
			},
			$$events: { click: notify },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_4 = $.text('Add Notification to queue');

				$.append($$anchor, text_4);
			},
			$$slots: { default: true }
		});
	}

	var node_9 = $.sibling(node_8, 2);

	{
		let $0 = $.derived(() => !message);

		Button(node_9, {
			get disabled() {
				return $.get($0);
			},
			color: 'alert',
			$$events: { click: alert },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_5 = $.text('Alert message');

				$.append($$anchor, text_5);
			},
			$$slots: { default: true }
		});
	}

	var node_10 = $.sibling(node_9, 2);

	{
		let $0 = $.derived(() => !message);

		Button(node_10, {
			get disabled() {
				return $.get($0);
			},
			color: 'error',
			$$events: { click: error },
			children: ($$anchor, $$slotProps) => {
				$.next();

				var text_6 = $.text('Error message');

				$.append($$anchor, text_6);
			},
			$$slots: { default: true }
		});
	}

	var node_11 = $.sibling(node_10, 2);

	Notifications(node_11, {});

	var node_12 = $.sibling(node_11, 2);

	Code(node_12, {
		get code() {
			return snackbars;
		}
	});

	$.append($$anchor, fragment);
	$.pop();
}