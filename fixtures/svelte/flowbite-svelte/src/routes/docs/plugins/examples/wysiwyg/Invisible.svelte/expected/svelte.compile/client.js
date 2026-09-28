import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { InvisibleButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Invisible($$anchor) {
	let editorInstance = $.state(null);

	const content = `
      <h1>
        This is a heading.
      </h1>
      <p>
        This<br>is<br>a<br>paragraph.
      </p>
      <p>
        This is a paragraph, but without breaks.
      </p>
    `;

	TextEditor($$anchor, {
		content,
		contentprops: { id: "invisible-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			InvisibleButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}