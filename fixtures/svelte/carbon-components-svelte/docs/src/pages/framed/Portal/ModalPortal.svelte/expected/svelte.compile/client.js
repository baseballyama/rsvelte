import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, Portal, Stack } from "carbon-components-svelte";

var root = $.from_html(`<p>This modal is rendered in a portal, escaping the parent container's
        overflow constraints and ensuring it appears above all other content.</p>`);

var root_1 = $.from_html(
	`<p>This container hides overflowing content. Without a portal, the modal would
    be clipped.</p> <div><!></div> <!>`,
	1
);

export default function ModalPortal($$anchor) {
	let open = false;

	Stack($$anchor, {
		gap: 5,
		style: 'overflow: hidden; position: relative; height: 200px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var div = $.sibling($.first_child(fragment_1), 2);
			var node = $.child(div);

			Button(node, {
				$$events: { click: () => open = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open modal');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			$.reset(div);

			var node_1 = $.sibling(div, 2);

			Portal(node_1, {
				children: ($$anchor, $$slotProps) => {
					Modal($$anchor, {
						modalHeading: 'Modal in Portal',
						primaryButtonText: 'Confirm',
						secondaryButtonText: 'Cancel',
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
						},
						$$events: { 'click:button--secondary': () => open = false },
						children: ($$anchor, $$slotProps) => {
							var p = root();

							$.append($$anchor, p);
						},
						$$slots: { default: true }
					});
				},
				$$slots: { default: true }
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}