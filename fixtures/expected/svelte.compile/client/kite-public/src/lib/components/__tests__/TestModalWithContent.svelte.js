import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import BaseModal from '../BaseModal.svelte';

var root = $.from_html(`<div>Modal Content</div>`);

export default function TestModalWithContent($$anchor, $$props) {
	let title = $.prop($$props, 'title', 3, 'Test Modal');

	BaseModal($$anchor, {
		get isOpen() {
			return $$props.isOpen;
		},

		get onClose() {
			return $$props.onClose;
		},

		get title() {
			return title();
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();

			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});
}