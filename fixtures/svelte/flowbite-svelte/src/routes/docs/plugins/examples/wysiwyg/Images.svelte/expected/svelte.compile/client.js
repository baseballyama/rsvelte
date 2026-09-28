import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { ImageButtonGroup, TextEditor } from "@flowbite-svelte-plugins/texteditor";

export default function Images($$anchor) {
	let editorInstance = $.state(null);

	const content = `<p>This is a basic example of implementing images. Drag to re-order.</p>
        <img src="/images/examples/image-1.jpg" />
        <img src="/images/examples/image-4@2x.jpg" />`;

	TextEditor($$anchor, {
		content,
		contentprops: { id: "image-ex" },
		get editor() {
			return $.get(editorInstance);
		},

		set editor($$value) {
			$.set(editorInstance, $$value, true);
		},

		children: ($$anchor, $$slotProps) => {
			ImageButtonGroup($$anchor, {
				get editor() {
					return $.get(editorInstance);
				}
			});
		},
		$$slots: { default: true }
	});
}