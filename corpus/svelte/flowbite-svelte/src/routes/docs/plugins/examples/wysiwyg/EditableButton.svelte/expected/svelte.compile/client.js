import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';

import {
	TextEditor,
	AlignmentButtonGroup,
	HeadingButtonGroup,
	UndoRedoButtonGroup,
	EditableButton
} from "@flowbite-svelte-plugins/texteditor";

var root = $.from_html(`<!> <!> <!> <!>`, 1);

export default function EditableButton_1($$anchor) {
	let editorInstance = $.state(null);
	let isEditable = $.state(true);

	const content = `<p>
        This is an example of a Medium-like editor. Try toggling the editable state with the button below.
      </p>
      <p></p>`;

	function handleEditableToggle(editable) {
		$.set(isEditable, editable, true);
		console.log("Editor is now:", editable ? "editable" : "read-only");
	}

	TextEditor($$anchor, {
		content,
		get isEditable() {
			return $.get(isEditable);
		},
		contentprops: { id: "editable-toggle-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			EditableButton(node, {
				get editor() {
					return $.get(editorInstance);
				},
				onToggle: handleEditableToggle,
				get isEditable() {
					return $.get(isEditable);
				},

				set isEditable($$value) {
					$.set(isEditable, $$value, true);
				}
			});

			var node_1 = $.sibling(node, 2);

			AlignmentButtonGroup(node_1, {
				get editor() {
					return $.get(editorInstance);
				}
			});

			var node_2 = $.sibling(node_1, 2);

			HeadingButtonGroup(node_2, {
				get editor() {
					return $.get(editorInstance);
				}
			});

			var node_3 = $.sibling(node_2, 2);

			UndoRedoButtonGroup(node_3, {
				get editor() {
					return $.get(editorInstance);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}