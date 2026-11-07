import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	TextEditor,
	AlignmentButtonGroup,
	UndoRedoButtonGroup,
	BubbleMenu
} from "@flowbite-svelte-plugins/texteditor";

var root = $.from_html(`<!> <!> <!>`, 1);

export default function BubbleMenu2($$anchor) {
	let editorInstance = $.state(null);
	const content = "<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p>";

	TextEditor($$anchor, {
		content,
		contentprops: { id: "bubble-menu-ex2" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			UndoRedoButtonGroup(node, {
				get editor() {
					return $.get(editorInstance);
				}
			});

			var node_1 = $.sibling(node, 2);

			AlignmentButtonGroup(node_1, {
				get editor() {
					return $.get(editorInstance);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			BubbleMenu(node_2, {
				get editor() {
					return $.get(editorInstance);
				},
				showStrike: false,
				showHighlight: false
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}