import * as $ from 'svelte/internal/server';
import GroupCustom from "./CustomGroup.svelte";
import { TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function CustomEditor($$renderer) {
	let editorInstance = null;
	const content = "<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma ...</p>";
	let $$settled = true;
	let $$inner_renderer;

	function $$render_inner($$renderer) {
		TextEditor($$renderer, {
			content,
			contentprops: { id: "custom-editor-ex" },
			get editor() {
				return editorInstance;
			},

			set editor($$value) {
				editorInstance = $$value;
				$$settled = false;
			},

			children: ($$renderer) => {
				GroupCustom($$renderer, { editor: editorInstance });
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