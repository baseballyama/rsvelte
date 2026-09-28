import * as $ from 'svelte/internal/server';
import { Textarea, ToolbarButton } from "flowbite-svelte";
import { ImageOutline, FaceGrinOutline, PaperPlaneOutline } from "flowbite-svelte-icons";

export default function Chatroom($$renderer) {
	$$renderer.push(`<form><label for="chat" class="sr-only">Your message</label> <div class="flex items-center rounded-lg bg-gray-50 px-3 py-2 dark:bg-gray-700">`);

	ToolbarButton($$renderer, {
		color: 'dark',
		class: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			ImageOutline($$renderer, { class: 'h-6 w-6' });
			$$renderer.push(`<!----> <span class="sr-only">Upload image</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	ToolbarButton($$renderer, {
		color: 'dark',
		class: 'text-gray-500 dark:text-gray-400',
		children: ($$renderer) => {
			FaceGrinOutline($$renderer, { class: 'h-6 w-6' });
			$$renderer.push(`<!----> <span class="sr-only">Add emoji</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----> `);

	Textarea($$renderer, {
		id: 'chat',
		class: 'mx-4 w-full bg-white dark:bg-gray-800',
		classes: { div: "w-full" },
		rows: 1,
		placeholder: 'Your message...'
	});

	$$renderer.push(`<!----> `);

	ToolbarButton($$renderer, {
		type: 'submit',
		color: 'blue',
		class: 'text-primary-600 dark:text-primary-500 ml-6 rounded-full',
		children: ($$renderer) => {
			PaperPlaneOutline($$renderer, { class: 'h-6 w-6 rotate-45' });
			$$renderer.push(`<!----> <span class="sr-only">Send message</span>`);
		},
		$$slots: { default: true }
	});

	$$renderer.push(`<!----></div></form>`);
}