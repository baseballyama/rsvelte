import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UndoRedoButtonGroup, TextEditor, ToolbarRowWrapper } from "@flowbite-svelte-plugins/texteditor";

export default function UndoRedo($$anchor) {
	let editorInstance = $.state(null);
	const content = '<p>Flowbite is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p><p>Here is an example of a button component:</p><code>&#x3C;button type=&#x22;button&#x22; class=&#x22;text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 focus:outline-none dark:focus:ring-blue-800&#x22;&#x3E;Default&#x3C;/button&#x3E;</code><p>Learn more about all components from the <a href="https://flowbite.com/docs/getting-started/introduction/">Flowbite Docs</a>.</p>';

	TextEditor($$anchor, {
		content,
		contentprops: { id: "undoredo-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			ToolbarRowWrapper($$anchor, {
				children: ($$anchor, $$slotProps) => {
					UndoRedoButtonGroup($$anchor, {
						get editor() {
							return $.get(editorInstance);
						}
					});
				},
				$$slots: { default: true }
			});
		},
		$$slots: { default: true }
	});
}