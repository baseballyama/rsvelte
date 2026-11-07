import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploader } from "carbon-components-svelte";

export default function FileUploaderOrderFilesCustom($$anchor, $$props) {
	$.push($$props, true);

	FileUploader($$anchor, {
		multiple: true,
		orderFiles: (existing, added) => {
			return [...existing, ...added].sort((a, b) => b.lastModified - a.lastModified);
		},
		labelTitle: 'Upload files',
		buttonLabel: 'Add files',
		labelDescription: 'Files are sorted by last modified (newest first).',
		status: 'edit'
	});

	$.pop();
}