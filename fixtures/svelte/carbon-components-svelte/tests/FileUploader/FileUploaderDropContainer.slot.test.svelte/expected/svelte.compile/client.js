import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import FileUploaderDropContainer from "carbon-components-svelte/FileUploader/FileUploaderDropContainer.svelte";

var root = $.from_html(`<span slot="labelChildren">Custom label content</span>`);

export default function FileUploaderDropContainer_slot_test($$anchor) {
	FileUploaderDropContainer($$anchor, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$anchor, $$slotProps) => {
				var span = root();

				$.append($$anchor, span);
			}
		}
	});
}