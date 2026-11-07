import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Textarea, ToolbarButton } from "flowbite-svelte";
import { ImageOutline, FaceGrinOutline, PaperPlaneOutline } from "flowbite-svelte-icons";

var root = $.from_html(`<!> <span class="sr-only">Upload image</span>`, 1);
var root_1 = $.from_html(`<!> <span class="sr-only">Add emoji</span>`, 1);
var root_2 = $.from_html(`<!> <span class="sr-only">Send message</span>`, 1);
var root_3 = $.from_html(`<form><label for="chat" class="sr-only">Your message</label> <div class="flex items-center rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700"><!> <!> <!> <!></div></form>`);

export default function Chatroom($$anchor) {
	var form = root_3();
	var div = $.sibling($.child(form), 2);
	var node = $.child(div);

	ToolbarButton(node, {
		color: 'dark',
		class: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var fragment = root();
			var node_1 = $.first_child(fragment);

			ImageOutline(node_1, { class: 'h-6 w-6' });
			$.next(2);
			$.append($$anchor, fragment);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node, 2);

	ToolbarButton(node_2, {
		color: 'dark',
		class: 'text-gray-500 dark:text-gray-400',
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root_1();
			var node_3 = $.first_child(fragment_1);

			FaceGrinOutline(node_3, { class: 'h-6 w-6' });
			$.next(2);
			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});

	var node_4 = $.sibling(node_2, 2);

	Textarea(node_4, {
		id: 'chat',
		class: 'mx-4 w-full bg-white dark:bg-gray-800',
		classes: { div: "w-full" },
		rows: 1,
		placeholder: 'Your message...'
	});

	var node_5 = $.sibling(node_4, 2);

	ToolbarButton(node_5, {
		type: 'submit',
		color: 'blue',
		class: 'text-primary-600 dark:text-primary-500 ml-6 rounded-full',
		children: ($$anchor, $$slotProps) => {
			var fragment_2 = root_2();
			var node_6 = $.first_child(fragment_2);

			PaperPlaneOutline(node_6, { class: 'h-6 w-6 rotate-45' });
			$.next(2);
			$.append($$anchor, fragment_2);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.reset(form);
	$.append($$anchor, form);
}