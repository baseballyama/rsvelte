import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { DetailsButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Details($$anchor) {
	let editorInstance = $.state(null);

	const content = `
      <p>Look at these details</p>
      <details>
        <summary>This is a summary</summary>
        <p>Surprise!</p>
      </details>
      <p>Nested details are also supported</p>
      <details open>
        <summary>This is another summary</summary>
        <p>And there is even more.</p>
        <details>
          <summary>We need to go deeper</summary>
          <p>Booya!</p>
        </details>
      </details>
    `;

	TextEditor($$anchor, {
		content,
		contentprops: { id: "details-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			DetailsButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}