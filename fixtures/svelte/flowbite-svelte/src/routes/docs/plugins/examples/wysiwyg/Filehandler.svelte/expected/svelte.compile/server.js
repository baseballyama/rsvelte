import * as $ from 'svelte/internal/server';
import { SourceButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Filehandler($$renderer) {
	let editorInstance = null;

	const content = `<h1>
        Try to paste or drop files into this editor
      </h1>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>`;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			file: true,
			contentprops: { id: "file-handler-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				SourceButtonGroup($$renderer, { editor: editorInstance, html: false });
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