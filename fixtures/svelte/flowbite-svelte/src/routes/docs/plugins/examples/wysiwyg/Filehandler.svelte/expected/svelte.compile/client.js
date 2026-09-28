import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { SourceButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Filehandler($$anchor) {
	let editorInstance = $.state(null);

	const content = `<h1>
        Try to paste or drop files into this editor
      </h1>
      <p></p>
      <p></p>
      <p></p>
      <p></p>
      <p></p>`;

	TextEditor($$anchor, {
		content,
		file: true,
		contentprops: { id: "file-handler-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			SourceButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				},
				html: false
			});
		},
		$$slots: { default: true }
	});
}