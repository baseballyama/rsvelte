import * as $ from 'svelte/internal/server';
import FileUploaderButton from "carbon-components-svelte/FileUploader/FileUploaderButton.svelte";

export default function FileUploaderButton_slot_test($$renderer) {
	FileUploaderButton($$renderer, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}