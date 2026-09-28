import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "carbon-components-svelte";

var root = $.from_html(`<p>Create a new Cloudant database in the US South region.</p>`);
var root_1 = $.from_html(`<p>This is a permanent action and cannot be undone.</p>`);
var root_2 = $.from_html(`<!> <!> <!> <!>`, 1);

export default function ModalMultiple($$anchor, $$props) {
	let openCreate = false;
	let openDelete = false;
	var fragment = root_2();
	var node = $.first_child(fragment);

	Button(node, {
		$$events: { click: () => openCreate = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Create database');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Button(node_1, {
		kind: 'danger-tertiary',
		$$events: { click: () => openDelete = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Delete database');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Modal(node_2, {
		modalHeading: 'Create database',
		primaryButtonText: 'Confirm',
		secondaryButtonText: 'Cancel',
		get open() {
			return openCreate;
		},

		set open($$value) {
			openCreate = $$value;
		},

		$$events: {
			'click:button--secondary': () => openCreate = false,
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

	var node_3 = $.sibling(node_2, 2);

	Modal(node_3, {
		danger: true,
		modalHeading: 'Delete database',
		primaryButtonText: 'Delete',
		secondaryButtonText: 'Cancel',
		get open() {
			return openDelete;
		},

		set open($$value) {
			openDelete = $$value;
		},

		$$events: {
			'click:button--secondary': () => openDelete = false,
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
			var p_1 = root_1();

			$.append($$anchor, p_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}