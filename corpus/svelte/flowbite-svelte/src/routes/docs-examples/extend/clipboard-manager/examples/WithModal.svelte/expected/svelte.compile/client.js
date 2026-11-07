import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ClipboardManager, Button, P } from "flowbite-svelte";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function WithModal($$anchor) {
	let clipboardModal = $.state(false);
	var fragment = root();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(clipboardModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Show Clips');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	ClipboardManager(node_1, {
		enableSelectionMenu: true,
		selectionTarget: '#with-modal',
		storageKey: 'modal-clipboard',
		get open() {
			return $.get(clipboardModal);
		},

		set open($$value) {
			$.set(clipboardModal, $$value, true);
		}
	});

	var node_2 = $.sibling(node_1, 2);

	P(node_2, {
		id: 'with-modal',
		class: 'py-4',
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Lorem ipsum dolor sit amet consectetur adipisicing elit. Aperiam, repudiandae. Optio delectus nihil assumenda laborum voluptatum nam illum nobis blanditiis esse sapiente, cumque facere ab\n  consequatur. Odit, architecto enim! At!');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}