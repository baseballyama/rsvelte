import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploader } from "carbon-components-svelte";

export default function FileUploaderOrderFilesPrepend($$anchor) {
	FileUploader($$anchor, {
		multiple: true,
		orderFiles: 'prepend',
		labelTitle: 'Upload files',
		buttonLabel: 'Add files',
		labelDescription: 'Newest files appear first.',
		status: 'edit'
	});
}