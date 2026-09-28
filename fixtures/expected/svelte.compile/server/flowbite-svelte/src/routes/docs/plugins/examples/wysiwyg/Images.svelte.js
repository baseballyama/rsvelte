import * as $ from 'svelte/internal/server';
import { ImageButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Images($$renderer) {
	let editorInstance = null;

	const content = `<p>This is a basic example of implementing images. Drag to re-order.</p>
        <img src="/images/examples/image-1.jpg" />
        <img src="/images/examples/image-4@2x.jpg" />`;

	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "image-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				ImageButtonGroup($$renderer, { editor: editorInstance });
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