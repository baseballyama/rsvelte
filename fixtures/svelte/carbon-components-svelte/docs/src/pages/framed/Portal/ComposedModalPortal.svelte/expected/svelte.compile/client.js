import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	Button,
	ComposedModal,
	ModalBody,
	ModalFooter,
	ModalHeader,
	Portal,
	Stack
} from "carbon-components-svelte";

var root = $.from_html(`<p>This composed modal is rendered in a portal, ensuring it appears above
          all z-index stacking contexts and parent overflow constraints.</p>`);

var root_1 = $.from_html(`<!> <!> <!>`, 1);

var root_2 = $.from_html(
	`<p>This container hides overflowing content. Without a portal, the modal would
    be clipped.</p> <div><!></div> <!>`,
	1
);

export default function ComposedModalPortal($$anchor) {
	let open = false;

	Stack($$anchor, {
		gap: 5,
		style: 'overflow: hidden; position: relative; height: 200px;',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_2();
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
					ComposedModal($$anchor, {
						get open() {
							return open;
						},

						set open($$value) {
							open = $$value;
						},

						children: ($$anchor, $$slotProps) => {
							var fragment_3 = root_1();
							var node_2 = $.first_child(fragment_3);

							ModalHeader(node_2, { title: 'Composed Modal in Portal' });

							var node_3 = $.sibling(node_2, 2);

							ModalBody(node_3, {
								children: ($$anchor, $$slotProps) => {
									var p = root();

									$.append($$anchor, p);
								},
								$$slots: { default: true }
							});

							var node_4 = $.sibling(node_3, 2);

							ModalFooter(node_4, {
								primaryButtonText: 'Confirm',
								secondaryButtonText: 'Cancel',
								$$events: { 'click:button--secondary': () => open = false }
							});

							$.append($$anchor, fragment_3);
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