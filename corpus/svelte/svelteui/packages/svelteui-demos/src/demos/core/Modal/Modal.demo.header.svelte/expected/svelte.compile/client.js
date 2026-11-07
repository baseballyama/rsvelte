import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Modal, Group, Button } from '@svelteuidev/core';

const code = `
<script>
	import { Modal } from '@svelteuidev/core';
<\/script>

<Modal withCloseButton={false}>
	Modal without header, press escape or click on overlay to close
</Modal>
`;

export const type = 'demo';
export const configuration = { code };

var root = $.from_html(`<!> <!>`, 1);

export default function Modal_demo_header($$anchor) {
	let opened;
	var fragment = root();
	var node = $.first_child(fragment);

	Modal(node, {
		get opened() {
			return opened;
		},
		withCloseButton: false,
		$$events: { close: () => opened = false },
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Modal without header, press escape or click on overlay to close');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Group(node_1, {
		position: 'center',
		children: ($$anchor, $$slotProps) => {
			Button($$anchor, {
				$$events: { click: () => opened = true },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Open Modal');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}