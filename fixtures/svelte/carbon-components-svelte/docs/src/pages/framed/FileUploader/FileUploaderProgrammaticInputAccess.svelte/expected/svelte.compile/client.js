import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { Button, FileUploader, Stack } from "carbon-components-svelte";

var root = $.from_html(`<!> <!>`, 1);

export default function FileUploaderProgrammaticInputAccess($$anchor) {
	let inputRef = null;

	Stack($$anchor, {
		gap: 6,
		children: ($$anchor, $$slotProps) => {
			var fragment_1 = root();
			var node = $.first_child(fragment_1);

			Button(node, {
				kind: 'secondary',
				$$events: { click: () => inputRef?.click() },
				children: ($$anchor, $$slotProps) => {
					$.next();

					var text = $.text('Open file picker');

					$.append($$anchor, text);
				},
				$$slots: { default: true }
			});

			var node_1 = $.sibling(node, 2);

			FileUploader(node_1, {
				multiple: true,
				accept: [".jpg", ".jpeg", ".png"],
				labelTitle: 'Upload files',
				buttonLabel: 'Browse files',
				labelDescription: 'Only image files are accepted.',
				get ref() {
					return inputRef;
				},

				set ref($$value) {
					inputRef = $$value;
				}
			});

			$.append($$anchor, fragment_1);
		},
		$$slots: { default: true }
	});
}