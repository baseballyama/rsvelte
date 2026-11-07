import * as $ from 'svelte/internal/server';
import { TextEditor, UndoRedoButtonGroup } from "@flowbite-svelte-plugins/texteditor";

export default function FloatingMenu($$renderer) {
	let editorInstance = null;

	const content = `<p>
        This is an example of a Medium-like editor. Enter a new line and some buttons will appear.
      </p>
      <p></p>`;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			floatingMenu: true,
			contentprops: { id: "floating-menu-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				UndoRedoButtonGroup($$renderer, { editor: editorInstance });
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