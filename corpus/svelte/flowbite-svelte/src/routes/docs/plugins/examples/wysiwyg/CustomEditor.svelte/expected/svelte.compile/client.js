import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import GroupCustom from "./CustomGroup.svelte";
import { TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function CustomEditor($$anchor) {
	let editorInstance = $.state(null);
	const content = "<p>Flowbite-Svelte is an <strong>open-source library of UI components</strong> based on the utility-first Tailwind CSS framework featuring dark mode support, a Figma ...</p>";

	TextEditor($$anchor, {
		content,
		contentprops: { id: "custom-editor-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			GroupCustom($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}