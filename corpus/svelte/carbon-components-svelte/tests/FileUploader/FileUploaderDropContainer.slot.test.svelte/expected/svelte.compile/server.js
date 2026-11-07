import * as $ from 'svelte/internal/server';
import FileUploaderDropContainer from "carbon-components-svelte/FileUploader/FileUploaderDropContainer.svelte";

export default function FileUploaderDropContainer_slot_test($$renderer) {
	FileUploaderDropContainer($$renderer, {
		labelText: 'Default label',
		$$slots: {
			labelChildren: ($$renderer) => {
				$$renderer.push(`<span slot="labelChildren">Custom label content</span>`);
			}
		}
	});
}