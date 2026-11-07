import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TextEditor, UndoRedoButtonGroup } from "@flowbite-svelte-plugins/texteditor";

export default function FloatingMenu($$anchor) {
	let editorInstance = $.state(null);

	const content = `<p>
        This is an example of a Medium-like editor. Enter a new line and some buttons will appear.
      </p>
      <p></p>`;

	TextEditor($$anchor, {
		content,
		floatingMenu: true,
		contentprops: { id: "floating-menu-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			UndoRedoButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}