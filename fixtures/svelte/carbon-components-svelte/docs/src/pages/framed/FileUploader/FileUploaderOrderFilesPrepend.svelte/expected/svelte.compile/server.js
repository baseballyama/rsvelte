import * as $ from 'svelte/internal/server';
import { FileUploader } from "carbon-components-svelte";

export default function FileUploaderOrderFilesPrepend($$renderer) {
	FileUploader($$renderer, {
		multiple: true,
		orderFiles: 'prepend',
		labelTitle: 'Upload files',
		buttonLabel: 'Add files',
		labelDescription: 'Newest files appear first.',
		status: 'edit'
	});
}