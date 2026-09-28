import 'svelte/internal/disclose-version';
import * as $ from 'svelte/internal/client';
import { FileUploader } from "carbon-components-svelte";

export default function FileUploaderFixture($$anchor) {
	let files = [];

	FileUploader($$anchor, {
		'data-testid': 'file-uploader',
		labelTitle: 'Upload files',
		buttonLabel: 'Add file',
		status: 'edit',
		iconDescription: 'Remove file',
		get files() {
			return files;
		},

		set files($$value) {
			files = $$value;
		}
	});
}