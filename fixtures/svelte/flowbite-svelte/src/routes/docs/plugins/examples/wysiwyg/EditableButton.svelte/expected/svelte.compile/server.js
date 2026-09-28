import * as $ from 'svelte/internal/server';

import {
	TextEditor,
	AlignmentButtonGroup,
	HeadingButtonGroup,
	UndoRedoButtonGroup,
	EditableButton
} from "@flowbite-svelte-plugins/texteditor";

export default function EditableButton_1($$renderer) {
	let editorInstance = null;
	let isEditable = true;

	const content = `<p>
        This is an example of a Medium-like editor. Try toggling the editable state with the button below.
      </p>
      <p></p>`;

	function handleEditableToggle(editable) {
		isEditable = editable;
		console.log("Editor is now:", editable ? "editable" : "read-only");
	}

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			isEditable,
			contentprops: { id: "editable-toggle-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				EditableButton($$renderer, {
					editor: editorInstance,
					onToggle: handleEditableToggle,
					get isEditable() {
						return isEditable;
					},

					set isEditable($$value) {
						isEditable = $$value;
						$$settled = false;
					}
				});

				$$renderer.push(`<!----> `);
				AlignmentButtonGroup($$renderer, { editor: editorInstance });
				$$renderer.push(`<!----> `);
				HeadingButtonGroup($$renderer, { editor: editorInstance });
				$$renderer.push(`<!----> `);
				UndoRedoButtonGroup($$renderer, { editor: editorInstance });
				$$renderer.push(`<!---->`);
			},
			$$slots: { default: true }
		});
	}

	do {
		$$settled = true;
		$$inner_renderer = $$renderer.copy();
		$$render_inner($$inner_renderer);
	} while (!$$settled);

	$$renderer.subsume($$inner_renderer);
}