import * as $ from 'svelte/internal/server';
import { TextEditor, UndoRedoButtonGroup, DragHandle } from "@flowbite-svelte-plugins/texteditor";

export default function DragHandle_1($$renderer) {
	let editorInstance = null;

	const content = `
        <h1>This is a demo file for our Drag Handle extension experiement.</h1>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. </p>
        <p>Odio eu feugiat pretium nibh ipsum consequat nisl. Velit euismod in pellentesque massa placerat.</p>
        <p>Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Sem viverra aliquet eget sit amet tellus. </p>
        <h2>Another heading 2</h2>
        <p>Odio eu feugiat pretium nibh ipsum consequat nisl. Velit euismod in pellentesque massa placerat.</p>
        <p>Cursus euismod quis viverra nibh cras pulvinar mattis nunc. Sem viverra aliquet eget sit amet tellus. .</p>
       
      `;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "drag-handle-wrapper" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				UndoRedoButtonGroup($$renderer, { editor: editorInstance });
				$$renderer.push(`<!----> `);
				DragHandle($$renderer, { editor: editorInstance });
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