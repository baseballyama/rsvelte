import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { HeadingButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Heading($$anchor) {
	let editorInstance = $.state(null);
	const content = "<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p>";

	TextEditor($$anchor, {
		content,
		contentprops: { id: "heading-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			HeadingButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}