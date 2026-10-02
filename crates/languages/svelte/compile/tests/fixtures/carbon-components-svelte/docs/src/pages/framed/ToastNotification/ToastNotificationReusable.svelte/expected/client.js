import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, ButtonSet, Stack, ToastNotification } from "carbon-components-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function ToastNotificationReusable($$anchor, $$props) {
	$.push($$props, true);

	let open = false;
	let kind = "error";
	let title = "Error";
	let subtitle = "An internal server error occurred.";
	let caption = new Date().toLocaleString();

	function showError() {
		kind = "error";
		title = "Error";
		subtitle = "An internal server error occurred.";
		caption = new Date().toLocaleString();
		open = true;
	}

	function showSuccess() {
		kind = "success";
		title = "Success";
		subtitle = "Your settings have been saved.";
		caption = new Date().toLocaleString();
		open = true;
	}

	function showWarning() {
		kind = "warning";
		title = "Warning";
		subtitle = "Please review your changes before continuing.";
		caption = new Date().toLocaleString();
		open = true;
	}

	Stack($$anchor, {
		gap: 5,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node = $.first_child(fragment_1);

			ButtonSet(node, {
				children: ($$anchor, $$slotProps) => {
					var fragment_2 = root();
					var node_1 = $.first_child(fragment_2);

					Button(node_1, {
						$$events: { click: showSuccess },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text = $.text('Show success');

							$.append($$anchor, text);
						},
						$$slots: { default: true }
					});

					var node_2 = $.sibling(node_1, 2);

					Button(node_2, {
						kind: 'ghost',
						$$events: { click: showWarning },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_1 = $.text('Show warning');

							$.append($$anchor, text_1);
						},
						$$slots: { default: true }
					});

					var node_3 = $.sibling(node_2, 2);

					Button(node_3, {
						kind: 'danger-ghost',
						$$events: { click: showError },
						children: ($$anchor, $$slotProps) => {
							$.next();

							var text_2 = $.text('Show error');

							$.append($$anchor, text_2);
						},
						$$slots: { default: true }
					});

					$.append($$anchor, fragment_2);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node, 2);

			ToastNotification(node_4, {
				get kind() {
					return kind;
				},

				get title() {
					return title;
				},

				get subtitle() {
					return subtitle;
				},

				get caption() {
					return caption;
				},

				get open() {
					return open;
				},

				set open($$value) {
					open = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	$.pop();
}