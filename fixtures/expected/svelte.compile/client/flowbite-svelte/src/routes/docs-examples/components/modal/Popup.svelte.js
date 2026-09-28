import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, Modal } from "flowbite-svelte";
import { ExclamationCircleOutline } from "flowbite-svelte-icons";
import { slide } from "svelte/transition";

var root = $.from_html(`<div class="text-center"><!> <h3 class="mb-5 text-lg font-normal text-gray-500 dark:text-gray-400">Are you sure you want to delete this product?</h3> <div class="space-x-2"><!> <!></div></div>`);
var root_1 = $.from_html(`<!> <!>`, 1);

export default function Popup($$anchor) {
	let popupModal = $.state(false);
	var fragment = root_1();
	var node = $.first_child(fragment);

	Button(node, {
		onclick: () => $.set(popupModal, true),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Pop-up modal');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_1 = $.sibling(node, 2);

	Modal(node_1, {
		form: true,
		size: 'xs',
		get transition() {
			return slide;
		},
		permanent: true,
		get open() {
			return $.get(popupModal);
		},

		set open($$value) {
			$.set(popupModal, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var div = root();
			var node_2 = $.child(div);

			ExclamationCircleOutline(node_2, {
				class: 'mx-auto mb-4 h-12 w-12 text-gray-400 dark:text-gray-200'
			});

			var div_1 = $.sibling(node_2, 4);
			var node_3 = $.child(div_1);

			Button(node_3, {
				type: 'submit',
				value: 'yes',
				color: 'red',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_1 = $.text('Yes, I\'m sure');

					$.append($$anchor, text_1);
				},
				$$slots: { default: true }
			});

			var node_4 = $.sibling(node_3, 2);

			Button(node_4, {
				type: 'submit',
				value: 'no',
				color: 'alternative',
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text_2 = $.text('No, cancel');

					$.append($$anchor, text_2);
				},
				$$slots: { default: true }
			});

			$.reset(div_1);
			$.reset(div);
			$.append($$anchor, div);
		},
		$$slots: { default: true }
	});

	$.append($$anchor, fragment);
}