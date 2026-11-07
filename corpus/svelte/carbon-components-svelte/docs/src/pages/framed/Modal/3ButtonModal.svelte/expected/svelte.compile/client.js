import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "carbon-components-svelte";

var root = $.from_html(`<p>Create a new Cloudant database in the US South region.</p>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function _ButtonModal($$anchor, $$props) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Create database');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		modalHeading: 'Create database',
		primaryButtonText: 'Confirm',
		secondaryButtons: [
			{ text: "Cancel", kind: "ghost" },
			{ text: "Save draft", kind: "secondary" }
		],

		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			'click:button--secondary': ({ detail }) => {
				if (detail.text === "Cancel") open = false;
				if (detail.text === "Save draft") console.log("Save draft");
			},

			open: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			close: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			submit: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			}
		},

		children: ($$anchor, $$slotProps) => {
			var p = root();

			$.append($$anchor, p);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}