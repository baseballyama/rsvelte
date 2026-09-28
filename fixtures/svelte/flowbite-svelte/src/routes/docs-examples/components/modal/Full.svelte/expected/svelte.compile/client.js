import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal, P } from "flowbite-svelte";

var root = $.from_html(`<div class="flex h-screen items-center justify-center"><!></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Full($$anchor) {
	let defaultModal = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(defaultModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Default modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		fullscreen: true,
		size: 'none',
		class: 'bg-gray-100',
		get open() {
			return $.get(defaultModal);
		},

		set open($$value) {
			$.set(defaultModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_2 = $.child(div);

			P(node_2, {
				class: 'text-3xl',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Content');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}