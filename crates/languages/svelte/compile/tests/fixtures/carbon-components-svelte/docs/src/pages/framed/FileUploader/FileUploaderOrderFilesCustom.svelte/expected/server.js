import * as $ from 'svelte/internal/server';
import { FileUploader } from "carbon-components-svelte";

export default function FileUploaderOrderFilesCustom($$renderer, $$props) {
	$$renderer.component(($$renderer) => {
		FileUploader($$renderer, {
			multiple: true,
			orderFiles: (existing, added) => {
				return [...existing, ...added].sort((a, b) => b.lastModified - a.lastModified);
			},
			labelTitle: 'Upload files',
			buttonLabel: 'Add files',
			labelDescription: 'Files are sorted by last modified (newest first).',
			status: 'edit'
		});
	});
}