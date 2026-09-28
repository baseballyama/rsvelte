import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { TextEditor, UndoRedoButtonGroup, DragHandle } from "@flowbite-svelte-plugins/texteditor";

var root = $.from_html(`<!> <!>`, 1);

export default function DragHandle_1($$anchor) {
	let editorInstance = $.state(null);

	const content = `
        <h1>This is a demo file for our Drag Handle extension experiement.</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
        <p>Odio eu feugiat pretium nibh ipsum consequat nisl. Velit euismod in pellentesque massa placerat.</p>
        <p>Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Sem viverra aliquet eget sit amet tellus. </p>
        <h2>Another heading 2</h2>
        <p>Odio eu feugiat pretium nibh ipsum consequat nisl. Velit euismod in pellentesque massa placerat.</p>
        <p>Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Sem viverra aliquet eget sit amet tellus. .</p>
       
      `;

	TextEditor($$anchor, {
		content,
		contentprops: { id: "drag-handle-wrapper" },
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

			DragHandle(node_1, {
				get editor() {
					return $.get(editorInstance);
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}