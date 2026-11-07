import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { UndoRedoButtonGroup, TextEditor, ToolbarRowWrapper } from "@flowbite-svelte-plugins/texteditor";

export default function Placeholder($$anchor) {
	let editorInstance = $.state(null);

	TextEditor($$anchor, {
		contentprops: { id: "placeholder-ex" },
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