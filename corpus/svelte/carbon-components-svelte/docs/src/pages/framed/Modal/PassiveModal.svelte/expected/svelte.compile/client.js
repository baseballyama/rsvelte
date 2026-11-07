import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "carbon-components-svelte";

var root = $.from_html(`<p>IBM Cloudant is a distributed, secure database with global availability and
    zero vendor lock-in used to build web and mobile apps at scale.</p>`);

var root_1 = $.from_html(`<!> <!>`, 1);

export default function PassiveModal($$anchor, $$props) {
	let open = false;
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		kind: 'tertiary',
		$$events: { click: () => open = true },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Learn more');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		passiveModal: true,
		modalHeading: 'IBM Cloudant',
		get open() {
			return open;
		},

		set open($$value) {
			open = $$value;
		},

		$$events: {
			open: function ($$arg) {
				$.bubble_event.call(this, $$props, $$arg);
			},

			close: function ($$arg) {
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