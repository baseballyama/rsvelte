import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FileUploaderButton from "carbon-components-svelte/FileUploader/FileUploaderButton.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function FileUploaderButton_slot_test($$anchor) {
	FileUploaderButton($$anchor, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}