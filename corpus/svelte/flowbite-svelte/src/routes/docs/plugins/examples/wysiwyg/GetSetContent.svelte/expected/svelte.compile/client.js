import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { AlignmentButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";
import { Button } from "flowbite-svelte";

var root = $.from_html(`<!> <div class="mt-4"><!> <!></div>`, 1);

export default function GetSetContent($$anchor) {
	let editorInstance = $.state(null);

	function getEditorContent() {
		return $.get(editorInstance)?.getHTML() ?? "";
	}

	function setEditorContent(content) {
		$.get(editorInstance)?.commands.setContent(content);
	}

	const content = "<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma design system, and more.</p><p>It includes all of the commonly used components that a website requires, such as buttons, dropdowns, navigation bars, modals, datepickers, advanced charts and the list goes on.</p>";
	var fragment = root();
	var node = $.first_child(fragment);

	TextEditor(node, {
		content,
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			AlignmentButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});

	var div = $.sibling(node, 2);
	var node_1 = $.child(div);

	Button(node_1, {
		onclick: () => console.log(getEditorContent()),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text = $.text('Log Content');

			$.append($$anchor, text);
		},
		$$slots: { default: true }
	});

	var node_2 = $.sibling(node_1, 2);

	Button(node_2, {
		onclick: () => setEditorContent("<p>New content!</p>"),
		children: ($$anchor, $$slotProps) => {
			$.next();

			var text_1 = $.text('Set Content');

			$.append($$anchor, text_1);
		},
		$$slots: { default: true }
	});

	$.reset(div);
	$.append($$anchor, fragment);
}